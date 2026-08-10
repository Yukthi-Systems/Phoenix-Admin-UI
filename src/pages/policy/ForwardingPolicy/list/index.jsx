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
  useDeleteForwardingPolicy,
  useForwardingPolicy,
  useAddForwardingPolicy,
  useEditForwardingPolicy,
} from "@/hooks/useForwardingPolicy";
import {
  exportForwardingPolicy,
  getForwardingPolicyEntry,
} from "@/api/forwardingPolicy";

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
import CopyItem from "@/components/common/SingleCopy";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListForwardingPolicy = () => {
  const [domainName, setDomainName] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);
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

  // Use forwarding policy hooks
  const { data, isLoading, isError, error, refetch } = useForwardingPolicy({
    organization_id,
    domain_name: domainName,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: searchQuery,
  });

  const fetchForwardingPolicyForExport = async ({
    organization_id: orgId,
    domain_name: domain,
    page,
    pageSize,
  }) => {
    return exportForwardingPolicy({
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
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  const forwardingPolicies = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const { mutate, isPending } = useDeleteForwardingPolicy();
  const { mutate: addForwardingPolicy } = useAddForwardingPolicy();
  const { mutate: editForwardingPolicyMutate } = useEditForwardingPolicy();

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
  } = useBulkSelection(forwardingPolicies, "policy_id", "policy_name");

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("forwarding_policies", async (policyData) => {
    return new Promise((resolve, reject) => {
      addForwardingPolicy(
        {
          org_id: organization_id,
          data: {
            ...policyData,
            domain_name: domainName,
          },
          addLog: false,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (err) => reject(err),
        },
      );
    });
  });

  const handleBulkEditForwardingPolicy = async (policyData) => {
    const { organization_id: rowOrgId, policy_id, ...rest } = policyData;
    const data = { ...rest, domain_name: domainName };
    return new Promise((resolve, reject) => {
      editForwardingPolicyMutate(
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
  } = useBulkEdit(
    "forwarding_policies",
    handleBulkEditForwardingPolicy,
    "policy_id",
  );

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "forwardingPolicies",
    fetchForwardingPolicyForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.forwardingPolicies || FIELD_MAPPINGS.generalPolicies,
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
      const data = await getForwardingPolicyEntry(organization_id, id);
      setFullData(data);
    } catch (err) {
      console.error("Error fetching policy details:", err);
      toast("error", "Failed to fetch policy details for copying");
    }
  };

  const handleNext = async (targetDomain) => {
    navigate(
      { pathname: `/policies/forwarding/copy/${targetDomain}` },
      {
        state: {
          fullData: {
            ...fullData,
            domain_name: targetDomain,
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

  const handleAddForwardingPolicy = () => {
    navigate(`/policies/forwarding/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_forwarding_policy",
      message: `Imported forwarding policies via bulk import`,
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
      "forwarding_policy",
      organization_id,
      domainName,
    ]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_forwarding_policy",
      message: `Updated forwarding policies via bulk edit`,
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
      "forwarding_policy",
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
            toast("success", "Successfully deleted forwarding policy");
            queryClient.invalidateQueries({
              queryKey: [
                "forwarding_policy",
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
      "forwarding_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} forwarding policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected forwarding policies");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} forwarding policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
      );
    }
  };

  const handleBulkCopy = async (sourceDomain, policyId, targetDomain) => {
    return new Promise(async (resolve, reject) => {
      try {
        const policyData = await getForwardingPolicyEntry(
          organization_id,
          policyId,
        );

        const copyData = {
          ...policyData,
          policy_name: `${policyData.policy_name} (Copy)`,
          domain_name: targetDomain,
        };

        addForwardingPolicy(
          {
            org_id: organization_id,
            data: copyData,
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
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleBulkCopyComplete = (results) => {
    queryClient.invalidateQueries([
      "forwarding_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully copied ${results.successful.length} forwarding policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to copy all selected forwarding policies");
    } else {
      toast(
        "warning",
        `Copied ${results.successful.length} forwarding policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
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
            to={`/policies/forwarding/${row?.original?.policy_id}`}
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
        accessorKey: "forwarding_type",
        header: "Forwarding Type",
        cell: ({ getValue }) => {
          return (
            <span className="capitalize">
              {getValue()?.replace(/_/g, " ") || "N/A"}
            </span>
          );
        },
        meta: {
          align: "left",
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
              label: "Edit Forwarding Policy",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(
                  `/policies/forwarding/edit/${row?.original?.policy_id}`,
                ),
              tooltip: "Edit Forwarding Policy",
            });
          }

          if (permissions.includes("policy:general:edit")) {
            actions.push({
              label: "Copy Forwarding Policy",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row?.original),
              tooltip: "Copy Forwarding Policy",
            });
          }

          if (permissions.includes("policy:general:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Forwarding Policy",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.policy_name,
                  id: row?.original?.policy_id,
                }),
              tooltip: "Delete Forwarding Policy",
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
    data: forwardingPolicies,
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
        description: "Delete Forwarding policy",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => setShowBulkDeleteModal(true),
      });
    }

    if (permissions.includes("policy:general:edit")) {
      options.push({
        label: "Copy",
        description: "Copy forwarding policy between domains",
        icon: <Copy className="h-4 w-4" />,
        onClick: () => setShowBulkCopyModal(true),
      });
    }

    return options;
  }, [permissions, selectedCount]);

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("policy:general:create")) {
      options.push({
        label: "Add Single Forwarding Policy",
        description: "Create one forwarding policy",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddForwardingPolicy,
      });
    }

    if (permissions.includes("policy:general:create") && domainName) {
      options.push({
        label: "Import",
        description: "Import multiple forwarding policies from file",
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
          totalCount === 0
            ? "No policies to edit"
            : "Export, edit the file, then re-upload to update multiple policies",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
        disabled: totalCount === 0,
      });
    }

    if (permissions.includes("policy:general:create") && isExportAvailable) {
      options.push({
        label: "Export",
        description:
          totalCount === 0
            ? "No forwarding policies to export"
            : "Download all forwarding policies as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
        disabled: totalCount === 0,
      });
    }

    return options;
  }, [
    permissions,
    domainName,
    isExportAvailable,
    handleAddForwardingPolicy,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    handleExport,
    totalCount,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:general:view")) {
    return (
      <AccessDenied content="You don't have permission to view forwarding policies." />
    );
  }

  if (isError && isServerError) {
    return <DataFechError content="Error loading forwarding policies..." />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Forwarding Policies" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search forwarding policies..."
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
          <NoDataFound content="Please select a domain first" />
        ) : (
          <>
            {forwardingPolicies.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No forwarding policies found for this domain" />
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
        title="Delete Forwarding Policy"
        description="This action cannot be undone and will remove all policy data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Forwarding Policies"
        description="Are you sure you want to delete the selected forwarding policies?"
        itemName="forwarding policy"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Forwarding Policies"
        description="Upload a CSV or Excel file to create multiple forwarding policies at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Forwarding Policies"
        description="Export forwarding policies, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Forwarding Policies"
        description="Export all forwarding policies to Excel format. This may take a few minutes for large datasets."
      />

      {/* Copy Single Policy Modal */}
      {openCopy && (
        <CopyItem
          isOpen={openCopy}
          onClose={handleCloseMove}
          item={selectedPolicy}
          onNext={handleNext}
          title="Copy Forwarding Policy"
          itemLabel="Forwarding Policy"
          organization_id={organization_id}
          currentDomain={domainName}
        />
      )}
    </>
  );
};

export default ListForwardingPolicy;
