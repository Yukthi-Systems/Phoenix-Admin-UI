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
  useDeleteRestrictionPolicy,
  useRestrictionPolicy,
  useAddRestrictionPolicy,
  useEditRestrictionPolicy,
} from "@/hooks/useRestrictionPolicy";
import {
  exportRestrictionPolicy,
  getRestrictionPolicyEntry,
} from "@/api/restrictionpolicy";

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

const ListRestrictionPolicy = () => {
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

  // Use restriction policy hooks
  const { data, isLoading, isError, error, refetch } = useRestrictionPolicy({
    organization_id,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: searchQuery,
  });

  const fetchRestrictionPolicyForExport = async ({
    organization_id: orgId,
    page,
    pageSize,
  }) => {
    return exportRestrictionPolicy({
      organization_id: orgId,
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

  const restrictionPolicies = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const { mutate, isPending } = useDeleteRestrictionPolicy();
  const { mutate: addRestrictionPolicy } = useAddRestrictionPolicy();
  const { mutate: editRestrictionPolicyMutate } = useEditRestrictionPolicy();

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
  } = useBulkSelection(restrictionPolicies, "policy_id", "policy_name");

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("restriction_policies", async (policyData) => {
    return new Promise((resolve, reject) => {
      addRestrictionPolicy(
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

  const handleBulkEditRestrictionPolicy = async (policyData) => {
    const { organization_id: rowOrgId, policy_id, ...rest } = policyData;
    const data = { ...rest };
    return new Promise((resolve, reject) => {
      editRestrictionPolicyMutate(
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
    "restriction_policies",
    handleBulkEditRestrictionPolicy,
    "policy_id",
  );

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "restrictionPolicies",
    fetchRestrictionPolicyForExport,
    {},
    FIELD_MAPPINGS.restrictionPolicies || FIELD_MAPPINGS.generalPolicies, // Fallback to general if restriction not defined
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
      const data = await getRestrictionPolicyEntry(organization_id, id);
      setFullData(data);
    } catch (err) {
      console.error("Error fetching policy details:", err);
      toast("error", "Failed to fetch policy details for copying");
    }
  };

  const handleNext = async (targetDomain) => {
    navigate(
      { pathname: `/policies/restrictions/copy/${targetDomain}` },
      {
        state: {
          fullData: {
            ...fullData,
            domain_name: targetDomain, // Update domain in the copied data
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

  const handleAddRestrictionPolicy = () => {
    navigate(`/policies/restrictions/add`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_restriction_policy",
      message: `Imported restriction policies via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {},
    };
    ImportActionLog({ values: ActionLog });

    queryClient.invalidateQueries(["restriction_policy", organization_id]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_restriction_policy",
      message: `Updated restriction policies via bulk edit`,
      payload: {
        ...results,
        total_updated: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {},
    };
    ImportActionLog({ values: ActionLog });

    queryClient.invalidateQueries(["restriction_policy", organization_id]);
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
          policy_name: deleteValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted restriction policy");
            queryClient.invalidateQueries({
              queryKey: [
                "restriction_policy",
                organization_id,
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
    queryClient.invalidateQueries(["restriction_policy", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} restriction policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected restriction policies");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} restriction policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
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
            to={`/policies/restrictions/${row?.original?.policy_id}`}
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
              label: "Edit Restriction Policy",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(
                  `/policies/restrictions/edit/${row?.original?.policy_id}`,
                ),
              tooltip: "Edit Restriction Policy",
            });
          }

          if (permissions.includes("policy:general:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Restriction Policy",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.policy_name,
                  id: row?.original?.policy_id,
                }),
              tooltip: "Delete Restriction Policy",
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
    handleDelete,
  ]);

  const table = useReactTable({
    data: restrictionPolicies,
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
        description: "Delete Restriction policy",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => setShowBulkDeleteModal(true),
      });
    }

    return options;
  }, [permissions, selectedCount]);

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("policy:general:create")) {
      options.push({
        label: "Add Single Restriction Policy",
        description: "Create one restriction policy",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddRestrictionPolicy,
      });
    }

    if (permissions.includes("policy:general:create")) {
      options.push({
        label: "Import",
        description: "Import multiple restriction policies from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("policy:general:edit") && isEditAvailable) {
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
            ? "No restriction policies to export"
            : "Download all restriction policies as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
        disabled: totalCount === 0,
      });
    }

    return options;
  }, [
    permissions,
    isExportAvailable,
    handleAddRestrictionPolicy,
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
      <AccessDenied content="You don't have permission to view restriction policies." />
    );
  }

  if (isError && isServerError) {
    return <DataFechError content="Error loading restriction policies..." />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Restriction Policies" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search restriction policies..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="policy:general:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            {/* Create dropdown button */}
            {createOptions.length > 0 && (
              <DropdownButton
                label="Actions"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>

        {/* Content */}
        {restrictionPolicies.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="No restriction policies found" />
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
        title="Delete Restriction Policy"
        description="This action cannot be undone and will remove all policy data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Restriction Policies"
        description="Are you sure you want to delete the selected restriction policies?"
        itemName="restriction policy"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Restriction Policies"
        description="Upload a CSV or Excel file to create multiple restriction policies at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Restriction Policies"
        description="Export restriction policies, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Restriction Policies"
        description="Export all restriction policies to Excel format. This may take a few minutes for large datasets."
      />
    </>
  );
};

export default ListRestrictionPolicy;
