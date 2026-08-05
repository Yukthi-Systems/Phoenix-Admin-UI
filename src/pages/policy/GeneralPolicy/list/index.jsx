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

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2, Plus, Upload, Edit, Download, Copy } from "lucide-react";

import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { PER_PAGE } from "@/constants/constants";
import { FIELD_MAPPINGS } from "@/constants/export";
import { useToastify } from "@/hooks/useToastify";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import useExport from "@/hooks/useExport";
import {
  useDeleteGeneralPolicy,
  useGeneralPolicy,
  useAddGeneralPolicy,
  useEditGeneralPolicy,
} from "@/hooks/useGeneralPolicy";
import {
  exportGeneralPolicy,
  getGeneralPolicyEntry,
} from "@/api/generalpolicy";

import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import AccessDenied from "@/components/common/AccessDenied";
import DomainSelector from "@/components/shared/DomainSelector";
import StatusBadge from "@/components/common/StatusBadge";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import SearchBar from "@/components/shared/SearchBar";
import MultiDelete from "@/components/shared/MultiDelete";
import ExportModal from "@/components/common/ExportModal";
import BulkActionsPolicies from "@/components/shared/BulkActionsPolicies";
import CopyPolicies from "@/components/common/CopyPolicies";
import CopyItem from "@/components/common/SingleCopy";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListGeneralPolicy = () => {
  const [domainName, setDomainName] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [openCopy, setOpenCopy] = useState(false);
  const [fullData, setFullData] = useState({});
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();

  const navigate = useNavigate();
  const { formatUserDateNice } = useUserTimezone();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useGeneralPolicy({
    organization_id,
    domain_name: domainName,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: searchQuery,
  });

  const fetchGeneralPolicyForExport = async ({
    organization_id: orgId,
    domain_name: domain,
    page,
    pageSize,
  }) => {
    return exportGeneralPolicy({
      organization_id: orgId,
      domain_name: domain,
      page,
      pageSize,
    });
  };

  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    if (domainName) {
      // setSearchQuery('');
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  const general = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const { mutate, isPending } = useDeleteGeneralPolicy();
  const { mutate: addGeneralPolicy } = useAddGeneralPolicy();
  const { mutate: editGeneralPolicyMutate } = useEditGeneralPolicy();

  const {
    selectedCount,
    selectedItemsWithLabels,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleItem,
    toggleAllCurrentPage,
    clearSelection,
    isItemSelected,
    removeFromSelection,
  } = useBulkSelection(general, "policy_id", "policy_name");

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("general_policies", async (policyData) => {
    return new Promise((resolve, reject) => {
      addGeneralPolicy(
        {
          org_id: organization_id,
          data: {
            ...policyData,
          },
          addLogs: false,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (err) => reject(err),
        },
      );
    });
  });

  const handleBulkEditGeneralPolicy = async (policyData) => {
    const { organization_id: rowOrgId, policy_id, ...rest } = policyData;
    const data = { ...rest };
    return new Promise((resolve, reject) => {
      editGeneralPolicyMutate(
        { org_id: rowOrgId, policy_id, data },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const {
    isEditModalOpen,
    editConfig,
    handleBulkEdit,
    handleEditModalClose,
    handleEditComplete,
    isEditAvailable,
  } = useBulkEdit("general_policies", handleBulkEditGeneralPolicy, "policy_id");

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "generalPolicies",
    fetchGeneralPolicyForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.generalPolicies,
  );

  const handleCopy = async (row) => {
    const value = {
      id: row?.policy_id,
      name: row?.policy_name,
    };
    getDetails(row?.policy_id);
    setSelectedPolicy(value);
    setOpenCopy(true);
  };

  const getDetails = async (id) => {
    try {
      const data = await getGeneralPolicyEntry(organization_id, id);
      setFullData(data);
    } catch (err) {
      console.error("Error", err);
    }
  };

  const handleNext = async (targetDomain) => {
    navigate(
      { pathname: `/policies/general/copy/${targetDomain}` },
      {
        state: {
          fullData: {
            ...fullData,
          },
        },
      },
    );
  };

  const handleCloseMove = () => {
    setSelectedPolicy(null);
    setFullData({});
    setOpenCopy(false);
  };

  const handleDelete = ({ name, id }) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddGeneralPolicy = () => {
    navigate(`/policies/general/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_general_policy",
      message: `Imported general policies via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });

    queryClient.invalidateQueries([
      "general_policy",
      organization_id,
      domainName,
    ]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_general_policy",
      message: `Updated general policies via bulk edit`,
      payload: {
        ...results,
        total_updated: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    };
    ImportActionLog({ values: ActionLog });

    queryClient.invalidateQueries([
      "general_policy",
      organization_id,
      domainName,
    ]);
  };

  const onCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const onDelete = () => {
    if (deleteId) {
      mutate(
        {
          org_id: organization_id,
          policy_id: deleteId,
          domain_name: domainName,
          policy_name: deleteValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted policy");
            queryClient.invalidateQueries({
              queryKey: [
                "general_policy",
                organization_id,
                domainName,
                pagination.pageIndex + 1,
                pagination.pageSize,
              ],
            });
            removeFromSelection([deleteId]);
            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
          },
          onError: (err) => {
            const message =
              err.response?.data?.message || err.message || "Unknown error";
            const tracebackId = err.response?.data?.traceback_id;
            toast(
              "error",
              `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
            );
            console.error(err);
          },
        },
      );
    } else {
      toast("error", "Message:'Unknown error'");
    }
  };

  const handleBulkDelete = async (itemId, itemName = "Unknown Policy") => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          org_id: organization_id,
          policy_id: itemId,
          domain_name: domainName,
          policy_name: itemName,
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (err) => {
            reject(err);
          },
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries([
      "general_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected policies");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
      );
    }
  };

  const handleBulkCopy = async (sourceDomain, policyId, targetDomain) => {
    return new Promise((resolve, reject) => {
      if (sourceDomain && policyId && targetDomain) {
        console.error(sourceDomain, policyId, targetDomain);
        resolve();
      } else {
        reject(new Error("Missing required parameters"));
      }
    });
  };

  const handleBulkCopyComplete = (results) => {
    queryClient.invalidateQueries([
      "filters_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected policies");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
      );
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "select",
        header: () => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllCurrentPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeCurrentPageSelected;
              }}
              onChange={toggleAllCurrentPage}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.policy_id)}
              onChange={() => toggleItem(row.original.policy_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "policy_name",
        header: "Policy Name",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/policies/general/${row?.original?.policy_id}`}
          >
            {row?.original?.policy_name}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue()} />;
        },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "updated_at",
        header: "Updated At",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];

    if (
      permissions.includes("policy:general:edit") ||
      permissions.includes("policy:general:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("policy:general:edit")) {
            actions.push({
              label: "Edit Policy",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/policies/general/edit/${row?.original?.policy_id}`),
              tooltip: "Edit Policy",
            });
          }

          if (permissions.includes("policy:general:edit")) {
            actions.push({
              label: "Copy Policy",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row?.original),
              tooltip: "Copy Policy",
            });
          }

          if (permissions.includes("policy:general:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Policy",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.policy_name,
                  id: row?.original?.policy_id,
                }),
              tooltip: "Delete Policy",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
      });
    }
    return baseColumns;
  }, [
    permissions,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleAllCurrentPage,
    toggleItem,
    isItemSelected,
    navigate,
    handleCopy,
    handleDelete,
  ]);

  const table = useReactTable({
    data: general,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const multipleSelectOption = useMemo(() => {
    const options = [];

    if (permissions.includes("policy:general:delete")) {
      options.push({
        label: "Delete",
        description: "Delete General policy",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => setShowBulkDeleteModal(true),
      });
    }

    if (permissions.includes("policy:general:edit")) {
      options.push({
        label: "Copy",
        description: "Copy general policy between domain",
        icon: <Copy className="h-4 w-4" />,
        onClick: () => setShowBulkMoveModal(true),
      });
    }

    return options;
  }, [permissions, selectedCount]);

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("policy:general:create")) {
      options.push({
        label: "Add Single Policy",
        description: "Create one general policy",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddGeneralPolicy,
      });
    }

    if (permissions.includes("policy:general:create") && domainName) {
      options.push({
        label: "Import",
        description: "Import multiple policies from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (
      permissions.includes("policy:general:edit") &&
      domainName &&
      isEditAvailable
    ) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple policies",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("policy:general:create") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all policies as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    domainName,
    isExportAvailable,
    handleAddGeneralPolicy,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    handleExport,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:general:view")) {
    return (
      <AccessDenied content="Don't have the access to list the general policies." />
    );
  }

  if (isError && isServerError) {
    return <DataFechError content="Error loading general policies...!" />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "General Policies" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search general policies..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Domain Selector */}
            <div className="w-full xl:w-auto xl:min-w-72">
              <DomainSelector
                domainName={domainName}
                setDomainName={setDomainName}
              />
            </div>

            {/* Bulk actions */}
            {selectedCount > 0 && domainName && (
              <MultiDelete
                permission="policy:general:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            {/* {selectedCount > 0 && domainName && (
              <BulkActionsPolicies
                selectedCount={selectedCount}
                handleClear={clearSelection}
                options={multipleSelectOption}
              />
            )} */}

            {/* Create dropdown button */}
            {domainName && createOptions.length > 0 && (
              <DropdownButton
                label="Actions"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>

        {/* Content */}
        {!domainName ? (
          <NoDataFound content="Please Select or add a domain first" />
        ) : (
          <>
            {general.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No general policies found for this domain" />
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={onCancel}
        handleDelete={onDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the policy name exactly to confirm deletion:"
        title="Delete Policy"
        description="This action cannot be undone and will remove all policy data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete General Policies"
        description="Are you sure you want to delete the selected general policies?"
        itemName="policy"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import General Policies"
        description="Upload a CSV or Excel file to create multiple general policies at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit General Policies"
        description="Export general policies, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export General Policies"
        description="Export all general policies to Excel format. This may take a few minutes for large datasets."
      />

      {openCopy && (
        <CopyItem
          isOpen={openCopy}
          onClose={handleCloseMove}
          item={selectedPolicy}
          onNext={handleNext}
          title="Copy Policy"
          itemLabel="Policy"
          organization_id={organization_id}
          currentDomain={domainName}
        />
      )}

      {/* {showBulkMoveModal && (
        <CopyPolicies
          isOpen={showBulkMoveModal}
          onClose={() => setShowBulkMoveModal(false)}
          policies={selectedItemsWithLabels}
          organization_id={organization_id}
          onComplete={handleBulkCopyComplete}
          onCopy={handleBulkCopy}
          currentDomain={domainName}
        />
      )} */}
    </>
  );
};

export default ListGeneralPolicy;
