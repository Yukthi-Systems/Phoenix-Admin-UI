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

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  Building2,
  AlertTriangle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  ChartPie,
  UserCog,
  Trash2,
  Edit,
  Mail,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetOrganizations,
  useUpdateOrganizationSpace,
  useUpdateOrganizationIdentityQuota,
  useUpdateOrganizationStatus,
  useRenameOrganizationStatus,
  useGetOrganizationDetail,
} from "@/hooks/useOrganization";
import { ActiveStatus, InactiveStatus } from "@/components/common/Status";
import {
  Button,
  IconButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import OrganizationLogo from "@/components/shared/OrgLogo";
import { useToastify } from "@/hooks/useToastify";
import ProgressBar from "@/components/common/Progress";
import IdentityProgress from "@/components/common/IdentityProgress";
import EditModelBox from "@/components/common/EditModelBox";
import SpaceAllocationModal from "./SpaceAllocation";
import IdentityAllocationModal from "./IdentityAllocation";
import { BASE_ORG } from "@/constants/constants";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/store/userInfo";
import StatusBadge from "@/components/common/StatusBadge";
import { userProfileAtom } from "@/store/userProfile";

const OrganizationTreeNode = ({
  organization,
  level = 0,
  expandedOrgs,
  setExpandedOrgs,
  onDelete,
  permissions,
  fetchData = () => { },
  ancestors = new Set(),
  parentAvailableSpace = 0,
  parentAvailableIdentities = 0,
  parentIsActive = true,
  checkingDeleteId = null,
  // True when this row is the always-visible "root" placeholder for the
  // current organization, labeled accordingly, so its ID is always
  // visible/copyable (e.g. for use as the Parent Organization ID in bulk import).
  isParentPlaceholder = false,
  // Hides the expand/collapse toggle — used for the parent placeholder row,
  // whose children are already rendered separately (the normal root list),
  // so its own expand mechanism would just re-fetch and show the same list again.
  disableExpand = false,
}) => {
  const [children, setChildren] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useAtom(selectedOrganizationAtom);
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const { refetch: refetchOrgDetails } = useGetOrganizationDetail(
    selectedOrg?.organization_id,
  );

  // Use local state (NOT URL params) so each child node has independent pagination
  const [childPagination, setChildPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const setPagination = useCallback((updater) => {
    setChildPagination((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);
  const pagination = childPagination;
  const toast = useToastify();
  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateOrganizationStatus();
  const { mutate: spaceUpdate, isPending: spaceLoad } =
    useUpdateOrganizationSpace();
  const { mutate: identityUpdate, isPending: identityLoad } =
    useUpdateOrganizationIdentityQuota();
  const { mutate: renameOrg, isPending: renameLoad } =
    useRenameOrganizationStatus();
  const thisOrgAvailableSpace = Math.max(
    0,
    (organization.quota_allocated || 0) - (organization.quota_utilized || 0),
  );
  const thisOrgAvailableIdentities =
    organization.allocated_email_identities === -1
      ? -1
      : Math.max(
          0,
          (organization.allocated_email_identities || 0) -
            (organization.utilized_email_identities || 0),
        );
  const navigate = useNavigate();
  const isExpanded = expandedOrgs.has(organization.organization_id);
  const indentWidth = level * 20;
  const isCircular = ancestors.has(organization.organization_id);
  const MAX_DEPTH = 10;
  const isMaxDepthReached = level >= MAX_DEPTH;
  const { formatUserDateNice } = useUserTimezone();

  const { data, isLoading, isError } = useGetOrganizations(
    pagination.pageIndex + 1,
    pagination.pageSize,
    isExpanded && !isCircular && !isMaxDepthReached
      ? organization.organization_id
      : null,
  );

  const totalPages = data?.total_pages ?? 1;
  const currentPage = pagination.pageIndex + 1;

  useEffect(() => {
    if (data && isExpanded && !isCircular && !isMaxDepthReached) {
      const filteredChildren = (data.organizations || []).filter(
        (child) =>
          !ancestors.has(child.organization_id) &&
          child.organization_id !== organization.organization_id,
      );
      setChildren(filteredChildren);
    }
  }, [
    data,
    isExpanded,
    isCircular,
    isMaxDepthReached,
    ancestors,
    organization.organization_id,
  ]);

  useEffect(() => {
    if (!isExpanded) {
      setChildren([]);
      setChildPagination({ pageIndex: 0, pageSize: 10 });
    }
  }, [isExpanded]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isCircular || isMaxDepthReached) {
      return;
    }

    setExpandedOrgs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(organization.organization_id)) {
        newSet.delete(organization.organization_id);
      } else {
        newSet.add(organization.organization_id);
      }
      return newSet;
    });
  };

  const handleDeleteClick = () => {
    onDelete({
      name: organization.organization_name,
      id: organization.organization_id,
    });
  };

  const OnStatusChange = () => {
    if (statusId) {
      statusUpdate(
        { organization_id: organization.organization_id, status: statusValue },
        {
          onSuccess: () => {
            toast("success", "Successfully update organization status");
            fetchData();
            setShowStatusModal(false);
            setStatusId("");
            setStatusValue(false);
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

  const OnSpaceChange = (allocationData) => {
    spaceUpdate(allocationData, {
      onSuccess: async () => {
        toast("success", "Successfully updated organization space allocation");

        // Refetch the selected org data
        const { data } = await refetchOrgDetails();

        // Update atom with fresh data
        if (data) {
          setSelectedOrg(data);
        }

        fetchData(); // Refresh parent list
        setShowSpaceModal(false);
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
    });
  };

  const OnIdentityChange = (allocationData) => {
    identityUpdate(allocationData, {
      onSuccess: async () => {
        toast("success", "Successfully updated organization identity allocation");

        const { data } = await refetchOrgDetails();
        if (data) {
          setSelectedOrg(data);
        }

        fetchData();
        setShowIdentityModal(false);
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
    });
  };

  const OnRename = () => {
    if (statusId) {
      renameOrg(
        { organization_id: organization.organization_id, name: orgName },
        {
          onSuccess: () => {
            toast("success", "Successfully rename organization");
            fetchData();
            setShowRenameModal(false);
            setStatusId("");
            setOrgName("");
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

  const handleStatus = (row) => {
    setStatusId(row.organization_name);
    setStatusValue(!row.is_active);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleRename = (row) => {
    setStatusId(row.organization_id);
    setOrgName(row.organization_name);
    setShowRenameModal(true);
  };

  const handleRenameClose = () => {
    setStatusId("");
    setOrgName("");
    setShowRenameModal(false);
  };

  const handleSpace = () => {
    setShowSpaceModal(true);
  };

  const handleSpaceClose = () => {
    setShowSpaceModal(false);
  };

  const handleIdentity = () => {
    setShowIdentityModal(true);
  };

  const handleIdentityClose = () => {
    setShowIdentityModal(false);
  };

  const childAncestors = new Set([...ancestors, organization.organization_id]);

  const renderExpandButton = () => {
    if (disableExpand) {
      return <div className="w-5 h-5 mr-2 flex-shrink-0" />;
    }

    if (isCircular) {
      return (
        <div className="flex items-center justify-center w-5 h-5 mr-2">
          <AlertTriangle
            className="w-4 h-4 text-warning"
            title="Circular reference detected"
          />
        </div>
      );
    }

    if (isMaxDepthReached) {
      return (
        <div className="flex items-center justify-center w-5 h-5 mr-2">
          <span
            className="text-xs text-muted-foreground"
            title="Maximum depth reached"
          >
            ...
          </span>
        </div>
      );
    }

    return (
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-5 h-5 mr-2 hover:bg-accent hover:text-accent-foreground rounded transition-colors duration-200 flex-shrink-0"
        disabled={isCircular || isMaxDepthReached}
      >
        {isLoading && isExpanded ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    );
  };

  const renderPagination = () => {
    if (!isExpanded || isCircular || isMaxDepthReached || totalPages <= 1) {
      return null;
    }

    return (
      <div className="border-b border-border bg-muted/5">
        <div
          className="flex items-center justify-between py-2 px-4"
          style={{ paddingLeft: `${indentWidth + 32}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} • {data?.total_count || 0}{" "}
              child organizations
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
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

            {(() => {
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

              return getVisiblePages().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: pageNum - 1,
                    }))
                  }
                  disabled={isLoading}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${pageNum === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {pageNum}
                </button>
              ));
            })()}

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
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: totalPages - 1,
                }))
              }
              disabled={currentPage === totalPages || isLoading}
              className="p-1 rounded disabled:opacity-50 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const baseOrgName = BASE_ORG;

  if (baseOrgName && organization.organization_name === baseOrgName) {
    return null;
  }

  return (
    <>
      <div className="select-none">
        <div
          className={`border-b border-border text-sm text-foreground hover:bg-muted/20 transition-colors duration-150 ${isCircular ? "bg-warning/5" : ""
            }`}
        >
          <div className="grid grid-cols-12 gap-4 p-2">
            <div
              className="col-span-3 flex items-center"
              style={{ paddingLeft: `${indentWidth}px` }}
            >
              {renderExpandButton()}

              {/* <Building2 className={`w-4 h-4 mr-2 flex-shrink-0 ${isCircular ? 'text-warning' : 'text-primary'
                            }`} /> */}
              <div className="mr-2">
                <OrganizationLogo
                  organizationId={organization.organization_id}
                  organizationName={organization.organization_name}
                  size="xxs"
                  showUpload={false}
                />
              </div>

              <Link
                to={`/organization/${encodeURIComponent(organization.organization_id)}`}
                className={`hover:underline font-medium truncate ${isCircular ? "text-warning" : "text-primary"
                  }`}
              >
                {organization.organization_name}
                {isParentPlaceholder && (
                  <span
                    className="text-xs text-primary ml-1"
                    title="This is your organization, shown because there are no organizations in this list. Use its ID as the Parent Organization ID for bulk-importing child organizations."
                  >
                    (Parent)
                  </span>
                )}
                {isCircular && (
                  <span
                    className="text-xs text-warning ml-1"
                    title="Circular reference"
                  >
                    (circular)
                  </span>
                )}
                {isMaxDepthReached && (
                  <span
                    className="text-xs text-muted-foreground ml-1"
                    title="Maximum depth reached"
                  >
                    (max depth)
                  </span>
                )}
              </Link>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <StatusBadge status={organization.is_active} />
            </div>

            <div className="col-span-1 flex items-center justify-center gap-1.5">
              <div
                title={`Email Service ${organization.email_service_enabled ? "Enabled" : "Disabled"}`}
                className={`rounded-md p-1 ${organization.email_service_enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"}`}
              >
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div
                title={`Chat Service ${organization.chat_service_enabled ? "Enabled" : "Disabled"}`}
                className={`rounded-md p-1 ${organization.chat_service_enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div
                title={`File Service ${organization.file_service_enabled ? "Enabled" : "Disabled"}`}
                className={`rounded-md p-1 ${organization.file_service_enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"}`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <ProgressBar
                utilized={organization.quota_utilized}
                allocated={organization.quota_allocated}
              />
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <IdentityProgress
                utilized={organization.utilized_email_identities}
                allocated={organization.allocated_email_identities}
              />
            </div>

            <div className="col-span-1 flex items-center justify-center text-xs">
              {formatUserDateNice(organization.created_at)}
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <TableActionsDropdown 
                height={300}
                actions={[
                  ...(permissions.includes("organization:edit") && userProfile?.organization_id !== organization.organization_id
                    ? [
                      {
                        label: "Edit Organization",
                        icon: Edit,
                        variant: "default",
                        onClick: () =>
                          navigate(
                            `/organization/edit/${organization.organization_id}`,
                          ),
                        tooltip: "Edit organization",
                      },
                    ]
                    : []),
                  ...(userProfile?.organization_id !== organization.organization_id)
                    ? [
                      {
                        label: "Manage Space",
                        icon: ChartPie,
                        variant: "default",
                        onClick: () => handleSpace(organization),
                        tooltip: "Space allocation",
                      }] : [],
                  ...(userProfile?.organization_id !== organization.organization_id)
                    ? [
                      {
                        label: "Manage Identities",
                        icon: UserCog,
                        variant: "default",
                        onClick: () => handleIdentity(organization),
                        tooltip: "Email identity allocation",
                      }] : [],
                  ...(permissions.includes("organization:edit") && userProfile?.organization_id !== organization.organization_id
                    ? [
                      {
                        label: "Rename Organization",
                        icon: Edit,
                        variant: "default",
                        onClick: () => handleRename(organization),
                        tooltip: "Rename organization",
                      },
                    ]
                    : []),

                  ...(permissions.includes("organization:delete") && userProfile?.organization_id !== organization.organization_id
                    ? [
                      { separator: true },
                      {
                        label: organization?.is_active
                          ? "Deactivate"
                          : "Activate",
                        icon: organization?.is_active ? XCircle : CheckCircle,
                        variant: organization?.is_active
                          ? "danger"
                          : "success",
                        disabled: !organization?.is_active && !parentIsActive,
                        onClick: () => handleStatus(organization),
                        tooltip: organization?.is_active
                          ? "Deactivate"
                          : !parentIsActive
                            ? "Parent organization is inactive"
                            : "Activate",
                      },
                      {
                        label:
                          checkingDeleteId === organization.organization_id
                            ? "Checking..."
                            : "Delete Organization",
                        icon: Trash2,
                        variant: "danger",
                        disabled: checkingDeleteId === organization.organization_id,
                        onClick: handleDeleteClick,
                        tooltip: "Delete organization",
                      },
                    ]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>

        {isExpanded && !isCircular && !isMaxDepthReached && (
          <div>
            {/* Render pagination controls */}
            {renderPagination()}

            {isError ? (
              <div className="border-b border-border text-sm">
                <div className="grid grid-cols-12 gap-4 p-2 bg-destructive/5">
                  <div
                    className="col-span-12 text-destructive italic"
                    style={{ paddingLeft: `${indentWidth + 32}px` }}
                  >
                    Failed to load child organizations
                  </div>
                </div>
              </div>
            ) : children.length > 0 ? (
              children.map((childOrg) => (
                <OrganizationTreeNode
                  key={childOrg.organization_id}
                  organization={childOrg}
                  level={level + 1}
                  expandedOrgs={expandedOrgs}
                  setExpandedOrgs={setExpandedOrgs}
                  onDelete={onDelete}
                  permissions={permissions}
                  ancestors={childAncestors}
                  fetchData={fetchData}
                  parentAvailableSpace={thisOrgAvailableSpace}
                  parentAvailableIdentities={thisOrgAvailableIdentities}
                  parentIsActive={organization?.is_active}
                  checkingDeleteId={checkingDeleteId}
                />
              ))
            ) : (
              !isLoading && (
                <div className="border-b border-border text-sm">
                  <div className="grid grid-cols-12 gap-4 p-2 bg-muted/10">
                    <div
                      className="col-span-12 text-muted-foreground italic"
                      style={{ paddingLeft: `${indentWidth + 32}px` }}
                    >
                      No child organizations
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className=" w-xl">
            <p className=" text-lg font-medium mb-3">Are you sure?</p>
            <p className=" text-base  mb-3">
              You want{" "}
              <>
                {statusValue ? (
                  <span className=" text-green-400 font-medium">Active</span>
                ) : (
                  <span className=" text-red-400 font-medium">In-active</span>
                )}
              </>{" "}
              {statusId} .
            </p>
            <div className="flex justify-end items-center gap-3 m-2">
              <Button
                variant="secondary"
                disabled={statusLoad}
                onClick={handleStatusClose}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                loading={statusLoad}
                onClick={OnStatusChange}
              >
                Confirm
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}
      {showRenameModal && (
        <EditModelBox
          isOpen={showRenameModal}
          label="Rename Orgnization"
          handleCancel={handleRenameClose}
        >
          <div className=" w-xl">
            <label className="text-sm font-medium text-foreground mb-1 mt-6 block text-left">
              Orgnization Name *
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={`mt-1 w-full rounded-md border bg-card text-card-foreground p-2 pr-12
    focus:border-primary focus:ring-0 focus:ring-primary focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
    placeholder:text-muted-foreground transition-colors duration-200`}
              placeholder="Enter allocation in GB"
              disabled={renameLoad}
            />
            <div className="flex justify-end items-center gap-3 mx-2 mt-6">
              <Button
                variant="secondary"
                disabled={renameLoad}
                onClick={handleRenameClose}
              >
                Cancel
              </Button>

              <Button variant="primary" loading={renameLoad} onClick={OnRename}>
                Rename
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}
      {showSpaceModal && (
        <SpaceAllocationModal
          isOpen={showSpaceModal}
          organization={organization}
          parentAvailableSpace={parentAvailableSpace}
          onClose={handleSpaceClose}
          onConfirm={OnSpaceChange}
          isLoading={spaceLoad}
        />
      )}
      {showIdentityModal && (
        <IdentityAllocationModal
          isOpen={showIdentityModal}
          organization={organization}
          parentAvailableIdentities={parentAvailableIdentities}
          onClose={handleIdentityClose}
          onConfirm={OnIdentityChange}
          isLoading={identityLoad}
        />
      )}
    </>
  );
};

export default OrganizationTreeNode;
