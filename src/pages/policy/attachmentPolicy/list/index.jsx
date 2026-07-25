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
import { userProfileAtom } from "@/store/userProfile";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { userInfoAtom } from "@/store/userInfo";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteAttachmentPolicy,
  useGetAttachmentPolicyList,
  useCreateAttachmentPolicy,
} from "@/hooks/useAttachmentPolicy";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import useBulkImport from "@/hooks/useImport";
import AccessDenied from "@/components/common/AccessDenied";
import DomainSelector from "@/components/shared/DomainSelector";
import { Trash2, Plus, Upload, Edit, Download, Copy } from "lucide-react";
import { PER_PAGE } from "@/constants/constants";
import StatusBadge from "@/components/common/StatusBadge";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import SearchBar from "@/components/shared/SearchBar";
import MultiDelete from "@/components/shared/MultiDelete";
import ExportModal from "@/components/common/ExportModal";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import {
  exportAttachmentPolicyList,
  getAttachmentPolicyById,
} from "@/api/attachmentPolicy";
import CopyItem from "@/components/common/SingleCopy";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { addLogs } from "@/api/logs";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListAttachmentPolicy = () => {
  const [domainName, setDomainName] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [openCopy, setOpenCopy] = useState(false);
  const [fullData, setFullData] = useState({});
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useGetAttachmentPolicyList(
    organization_id,
    domainName,
    searchQuery,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  // Export function for attachment policies
  const fetchAttachmentPolicyForExport = async ({
    organization_id,
    domain_name,
  }) => {
    return await exportAttachmentPolicyList(organization_id, domain_name);
  };

  // Search handler function
  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page when searching
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Reset search when domain changes
  useEffect(() => {
    if (domainName) {
      // setSearchQuery('');
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [domainName]);

  const policies = data?.attachment_policies || [];
  const totalPages = data?.total_pages || 1;
  const totalCount = data?.total_count || 0;

  const { mutate, isPending } = useDeleteAttachmentPolicy();
  const { mutate: addAttachmentPolicy } = useCreateAttachmentPolicy();

  // Bulk selection hook
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
  } = useBulkSelection(policies, "policy_id", "policy_name");

  // Bulk import hook
  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("attachment_policies", async (policyData) => {
    return new Promise((resolve, reject) => {
      addAttachmentPolicy(
        {
          organization_id,
          data: {
            ...policyData,
            // domain_name: domainName,
            allowed_file_types: policyData.allowed_file_types || [],
            blocked_file_types: policyData.blocked_file_types || [],
          },
          addLogs : false,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  });

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "attachmentPolicies",
    fetchAttachmentPolicyForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.attachmentPolicies || {},
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
      const data = await getAttachmentPolicyById(
        organization_id,
        domainName,
        id,
      );
      setFullData(data);
    } catch (err) {
      console.error("Error", err);
    }
  };

  const handleNext = async (targetDomain) => {
    navigate(
      { pathname: `/policies/attachments/copy/${targetDomain}` },
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

  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isAllCurrentPageSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeCurrentPageSelected;
              }}
              onChange={toggleAllCurrentPage}
              className="border-border bg-background text-primary focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.policy_id)}
              onChange={() => toggleItem(row.original.policy_id)}
              className="border-border bg-background text-primary focus:ring-primary h-4 w-4 rounded focus:ring-2"
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
            to={`/policies/attachments/${row?.original?.policy_id}/${domainName}`}
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
      //   {
      //     accessorKey: 'max_attachment_size_mb',
      //     header: 'Max Size (MB)',
      //     cell: ({ getValue }) => {
      //       return (
      //         <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
      //           {getValue()} MB
      //         </span>
      //       );
      //     },
      //   },
      //   {
      //     accessorKey: 'allowed_file_types',
      //     header: 'Allowed Types',
      //     cell: ({ getValue }) => {
      //       const types = getValue() || [];
      //       if (types.length === 0) return <span className="text-muted-foreground">None</span>;
      //       return (
      //         <div className="flex flex-wrap gap-1">
      //           {types.slice(0, 3).map((type, idx) => (
      //             <span
      //               key={idx}
      //               className="inline-flex items-center rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success"
      //             >
      //               {type}
      //             </span>
      //           ))}
      //           {types.length > 3 && (
      //             <span className="text-xs text-muted-foreground">
      //               +{types.length - 3} more
      //             </span>
      //           )}
      //         </div>
      //       );
      //     },
      //   },
      //   {
      //     accessorKey: 'blocked_file_types',
      //     header: 'Blocked Types',
      //     cell: ({ getValue }) => {
      //       const types = getValue() || [];
      //       if (types.length === 0) return <span className="text-muted-foreground">None</span>;
      //       return (
      //         <div className="flex flex-wrap gap-1">
      //           {types.slice(0, 3).map((type, idx) => (
      //             <span
      //               key={idx}
      //               className="inline-flex items-center rounded-md bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive"
      //             >
      //               {type}
      //             </span>
      //           ))}
      //           {types.length > 3 && (
      //             <span className="text-xs text-muted-foreground">
      //               +{types.length - 3} more
      //             </span>
      //           )}
      //         </div>
      //       );
      //     },
      //   },
      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "updated_at",
        header: "Updated Date",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];

    if (
      permissions.includes("policy:attachment:edit") ||
      permissions.includes("policy:attachment:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("policy:attachment:edit")) {
            actions.push({
              label: "Edit Policy",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(
                  `/policies/attachments/edit/${row?.original?.policy_id}/${domainName}`,
                ),
              tooltip: "Edit Policy",
            });
          }

          if (permissions.includes("policy:attachment:edit")) {
            actions.push({
              label: "Copy Policy",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row?.original),
              tooltip: "Copy Policy",
            });
          }

          if (permissions.includes("policy:attachment:delete")) {
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
  ]);

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddAttachmentPolicy = () => {
    navigate(`/policies/attachments/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_attachment_policy",
      message: `Imported attachment policies via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        domain_name: domainName,
      },
    }
    ImportActionLog({ values: ActionLog })

    queryClient.invalidateQueries([
      "attachment_policy_list",
      organization_id,
      domainName,
    ]);
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id, policy_id: deleteId, domain_name: domainName },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted attachment policy");
            queryClient.invalidateQueries({
              queryKey: [
                "attachment_policy_list",
                organization_id,
                domainName,
                searchQuery,
                pagination.pageIndex + 1,
                pagination.pageSize,
              ],
            });
            removeFromSelection([deleteId]);
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
      toast("error", `Message:'Unknown error'`);
    }
  };

  const handleBulkDelete = async (itemId) => {
    return new Promise((resolve, reject) => {
      mutate(
        { organization_id, policy_id: itemId },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries([
      "attachment_policy_list",
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

  const table = useReactTable({
    data: policies,
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

  // Create options for dropdown button
  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("policy:attachment:create")) {
      options.push({
        label: "Add Single Policy",
        description: "Create one attachment policy",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddAttachmentPolicy,
      });
    }

    if (
      permissions.includes("policy:attachment:create") &&
      isImportAvailable &&
      domainName
    ) {
      options.push({
        label: "Import",
        description: "Import multiple policies from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("policy:attachment:create") && isExportAvailable) {
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
    isImportAvailable,
    domainName,
    handleAddAttachmentPolicy,
    handleImport,
    isExportAvailable,
    handleExport,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:attachment:view"))
    return (
      <AccessDenied content="Don't have the access to list the attachment policies." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error loading attachment policies...!" />;

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Attachment Policies" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search attachment policies..."
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
                permission="policy:attachment:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            {/* Create dropdown button */}
            {domainName && createOptions.length > 0 && (
              <DropdownButton
                label="Create"
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
            {policies.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No attachment policies found for this domain" />
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the policy name exactly to confirm deletion:"
        title="Delete Attachment Policy"
        description="This action cannot be undone and will remove all policy data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Attachment Policies"
        description="Are you sure you want to delete the selected attachment policies?"
        itemName="policy"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Attachment Policies"
        description="Upload a CSV or Excel file to create multiple attachment policies at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Attachment Policies"
        description="Export all attachment policies to Excel format. This may take a few minutes for large datasets."
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
    </>
  );
};

export default ListAttachmentPolicy;
