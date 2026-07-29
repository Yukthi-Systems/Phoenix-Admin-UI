/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import { useAtomValue, useAtom } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useMemo } from "react";
import {
  useCreateOrganization,
  useDeleteOrganization,
  useGetOrganizationDetail,
  useGetOrganizations,
} from "@/hooks/useOrganization";
import { getOrganizations } from "@/api/organizations";
import { getDomains } from "@/api/domain";
import { useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { AddButton, Button } from "@/components/common/Buttons";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import DeleteBlockedModal from "@/components/common/DeleteBlockedModal";
import BulkImportModal from "@/components/common/BulkImport";
import { usePreDeleteCheck } from "@/hooks/usePreDeleteCheck";
import { useToastify } from "@/hooks/useToastify";
import useBulkImport from "@/hooks/useImport";
import { ImportActionLog } from "@/utils/importActionLog";
import { getOrganizationImportFieldMapping } from "@/constants/import";
import OrganizationTreeNode from "./OrganizationTree";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
} from "lucide-react";
import { selectedOrganizationAtom, userInfoAtom, parentOrgAtom } from "@/store/userInfo";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";
import { useTablePagination } from "@/hooks/useTablePagination";

const OrganizationTreeView = () => {
  const { permissions = [], organization_id } = useAtomValue(userProfileAtom);
  const { email_service_enabled, chat_service_enabled } = useAtomValue(parentOrgAtom);
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const [, setUserInfo] = useAtom(userInfoAtom);
  const { uiInfo, updateUiInfo } = useSyncedUiInfo();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { runCheck: runDeleteCheck, checkingId: checkingDeleteId, blockInfo: deleteBlockInfo, clearBlock: clearDeleteBlock } = usePreDeleteCheck();
  const [expandedOrgs, setExpandedOrgs] = useState(new Set());
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination(10, 50);
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetOrganizations(
    pagination.pageIndex + 1,
    pagination.pageSize,
    organization_id,
  );
  const { data: defaultOrgDetails } = useGetOrganizationDetail(organization_id);

  const { mutate, isPending } = useDeleteOrganization();
  const { mutate: createOrgMutation } = useCreateOrganization();

  const hasCrmPermission = permissions.includes("crm:service:view");
  const organizationImportFieldMapping = useMemo(
    () => getOrganizationImportFieldMapping(hasCrmPermission),
    [hasCrmPermission],
  );

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport(
    "organizations",
    async (orgData) => {
      return new Promise((resolve, reject) => {
        createOrgMutation(
          {
            data: {
              name: orgData.name,
              parent_organization_id: orgData.parent_organization_id,
              allocated_quota: orgData.allocated_quota,
              allocated_email_identities: orgData.allocated_email_identities,
              activate: orgData.activate ?? true,
              email_service_enabled: orgData.email_service_enabled ?? false,
              chat_service_enabled: orgData.chat_service_enabled ?? false,
              // File service isn't wired up for organizations yet - always off.
              file_service_enabled: false,
              details: {
                type: orgData.details?.type,
                description: orgData.details?.description || "",
                website: orgData.details?.website || "",
                gst_number: orgData.details?.gst_number || "",
                branches: orgData.details?.branches || {},
                contact_info: orgData.details?.contact_info || {},
              },
            },
            addLog: false,
          },
          {
            onSuccess: (result) => resolve(result),
            onError: (error) => reject(error),
          },
        );
      });
    },
    {},
    organizationImportFieldMapping,
  );

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    ImportActionLog({
      values: {
        action_type: "import_organizations",
        message: "Imported organizations via bulk import",
        payload: {
          ...results,
          total_imported: results.successful.length || 0,
          total_failed: results.failed.length || 0,
        },
        organization_id,
        details: { organization_id },
      },
    });
    fetchData();
  };

  const rootOrganizations = data?.organizations ?? [];
  const totalPagesRef = useRef(1);
  if (data?.total_pages) {
    totalPagesRef.current = data.total_pages;
  }
  const totalPages = totalPagesRef.current;
  const currentPage = pagination.pageIndex + 1;
  const totalCount = data?.total_count ?? 0;
  const rootParentAvailableSpace =
    defaultOrgDetails?.quota_allocated - defaultOrgDetails?.quota_utilized;
  const rootParentAvailableIdentities =
    defaultOrgDetails?.allocated_email_identities === -1
      ? -1
      : (defaultOrgDetails?.allocated_email_identities ?? 0) -
        (defaultOrgDetails?.utilized_email_identities ?? 0);

  function handleDelete({ name, id }) {
    runDeleteCheck({
      id,
      name,
      checks: [
        {
          label: "sub-organization",
          fn: async (orgId) => (await getOrganizations(1, 1, orgId))?.total_count ?? 0,
        },
        {
          label: "domain",
          fn: async (orgId) => (await getDomains(orgId, 1, 1))?.domains?.total_count ?? 0,
        },
      ],
      onClear: () => {
        setShowDeleteModal(true);
        setDeleteId(id);
        setDeleteValue(name);
      },
    });
  }

  function fetchData() {
    queryClient.invalidateQueries([
      "organizations",
      pagination.pageIndex + 1,
      pagination.pageSize,
      organization_id,
    ]);
  }

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id: deleteId, organization_name: deleteValue },
        {
          onSuccess: () => {
            toast("success", "Organization deleted successfully");
            queryClient.invalidateQueries([
              "organizations",
              pagination.pageIndex + 1,
              pagination.pageSize,
              organization_id,
            ]);

            if (deleteId === selectedOrg?.organization_id && defaultOrgDetails) {
              setSelectedOrg(defaultOrgDetails);
              setUserInfo((prev) => ({
                ...prev,
                organization_id: defaultOrgDetails.organization_id,
                organization_name: defaultOrgDetails.organization_name,
                chat_service_enabled: defaultOrgDetails.chat_service_enabled ?? false,
                email_service_enabled: defaultOrgDetails.email_service_enabled ?? false,
              }));
              updateUiInfo({
                organizationSelector: {
                  ...(uiInfo?.organizationSelector || {}),
                  lastSelectedOrganization: null,
                },
              });
            }

            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
          },
          onError: (error) => {
            const message =
              error.response?.data?.message || error.message || "Unknown error";
            const tracebackId = error.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(error);
          },
        },
      );
    } else {
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const handleAddOrganization = () => {
    navigate("/organization/add");
  };

  const renderRootPagination = () => {
    // if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 1;
      const left = Math.max(1, currentPage - delta);
      const right = Math.min(totalPages, currentPage + delta);
      const pages = [];

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap px-2.5 border-t pt-2 bg-card">
        <div className="flex items-center gap-2">
          <label
            htmlFor="pageSize"
            className="text-[13px] font-medium text-muted-foreground"
          >
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 0, // Reset to first page when changing page size
              }));
            }}
            className="border border-border rounded px-2 py-1 text-sm bg-background"
          >
            {[10, 15, 25, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize} className="bg-background">
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">
            Page {currentPage} of {totalPages} • {totalCount} organizations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            disabled={currentPage === 1 || isLoading}
            className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(0, prev.pageIndex - 1),
              }))
            }
            disabled={currentPage === 1 || isLoading}
            className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: pageNum - 1 }))
              }
              disabled={isLoading}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${pageNum === currentPage
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground border border-border"
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1),
              }))
            }
            disabled={currentPage === totalPages || isLoading}
            className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))
            }
            disabled={currentPage === totalPages || isLoading}
            className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!permissions.includes("organization:view"))
    return (
      <AccessDenied content="Don't have access to view organization details." />
    );

  if (isError)
    return <DataFechError content="Error while loading the organizations" />;

  return (
    <>
      <div className="px-2 w-full h-full">
        <div className="w-full flex justify-between items-center mb-2.5">
          <Breadcrumbs items={[{ name: "Organization" }]} />
          {permissions.includes("organization:create") && (email_service_enabled || chat_service_enabled) && (
            <div className="flex items-center gap-2">
              {isImportAvailable && (
                <Button
                  variant="secondary"
                  icon={Upload}
                  onClick={handleImport}
                >
                  Import
                </Button>
              )}
              <AddButton
                label="Add Organization"
                handleClick={handleAddOrganization}
              />
            </div>
          )}
        </div>

        <div className="w-full h-[calc(100vh-150px)] shadow-lg overflow-hidden rounded-lg bg-card border border-border">
          <div className="bg-muted sticky top-0 left-0 z-10">
            <div className="min-w-full text-center">
              <div className="grid grid-cols-12 gap-4 px-2 py-2.5 border-b border-border font-semibold text-foreground">
                <div className="col-span-3 text-left">Organization Name</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Services</div>
                <div className="col-span-2">Storage</div>
                <div className="col-span-2">Identities</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-2"></div>
              </div>
            </div>
          </div>

          <div className="w-full h-[calc(100vh-270px)] overflow-y-auto relative">
            {defaultOrgDetails && (
              <OrganizationTreeNode
                organization={defaultOrgDetails}
                level={0}
                expandedOrgs={expandedOrgs}
                setExpandedOrgs={setExpandedOrgs}
                onDelete={handleDelete}
                permissions={permissions}
                ancestors={new Set()}
                fetchData={fetchData}
                parentAvailableSpace={rootParentAvailableSpace}
                parentAvailableIdentities={rootParentAvailableIdentities}
                checkingDeleteId={checkingDeleteId}
                isParentPlaceholder
                disableExpand
              />
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">
                  Loading organizations...
                </span>
              </div>
            ) : rootOrganizations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">
                    No organizations found
                  </div>
                  {permissions.includes("organization:create") && (
                    <button
                      onClick={handleAddOrganization}
                      className="text-primary hover:underline text-sm"
                    >
                      Create your first organization
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {rootOrganizations.map((org) => (
                  <OrganizationTreeNode
                    key={org.organization_id}
                    organization={org}
                    level={1}
                    expandedOrgs={expandedOrgs}
                    setExpandedOrgs={setExpandedOrgs}
                    onDelete={handleDelete}
                    permissions={permissions}
                    ancestors={
                      new Set(
                        defaultOrgDetails
                          ? [defaultOrgDetails.organization_id]
                          : [],
                      )
                    }
                    fetchData={fetchData}
                    parentAvailableSpace={rootParentAvailableSpace}
                    parentAvailableIdentities={rootParentAvailableIdentities}
                    checkingDeleteId={checkingDeleteId}
                  />
                ))}
              </div>
            )}
          </div>
          {renderRootPagination()}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the Organization name exactly to confirm deletion:"
        title="Delete Organization"
        description="This action cannot be undone and will remove all Organization data."
      />

      <DeleteBlockedModal
        isOpen={!!deleteBlockInfo}
        name={deleteBlockInfo?.name}
        reasons={deleteBlockInfo?.reasons}
        onClose={clearDeleteBlock}
        title="Can't Delete Organization"
        entityLabel="organization"
        actionLabel="View Organization"
        onAction={() => {
          navigate(`/organization/${encodeURIComponent(deleteBlockInfo.id)}`);
          clearDeleteBlock();
        }}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Organizations"
        description={`Upload a CSV or Excel file to create multiple organizations at once. Each row is created as a separate organization under the Parent Organization ID you specify. Every organization needs at least one branch${hasCrmPermission ? " and one contact" : ""}.`}
        onComplete={handleImportCompleteWithRefresh}
      />
    </>
  );
};

export default OrganizationTreeView;
