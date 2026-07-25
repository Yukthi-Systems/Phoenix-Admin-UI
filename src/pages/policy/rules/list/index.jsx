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

import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  DeleteButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import NoDataFound from "@/components/common/NoDataFound";
import StatusBadge from "@/components/common/StatusBadge";
import DomainSelector from "@/components/shared/DomainSelector";
import Table from "@/components/shared/Table";
import {
  useDeletePolicyRule,
  useGetPolicyRules,
  useAddPolicyRule,
} from "@/hooks/usePolicyRules";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import useBulkImport from "@/hooks/useImport";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Upload, Edit } from "lucide-react";
import { PER_PAGE } from "@/constants/constants";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import { useTablePagination } from "@/hooks/useTablePagination";

function PolicyRulesListing() {
  const [domainName, setDomainName] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();
  const { formatUserDateNice } = useUserTimezone();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useGetPolicyRules(
    organization_id,
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  const rules = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const { mutate, isPending } = useDeletePolicyRule();
  const { mutate: addPolicyRule } = useAddPolicyRule();

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
  } = useBulkSelection(rules, "rule_id", "rule_name");

  // Bulk import hook
  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("policy_rules", async (ruleData) => {
    return new Promise((resolve, reject) => {
      addPolicyRule(
        {
          organization_id,
          data: {
            ...ruleData,
            domain_name: domainName,
          },
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  });

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
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.rule_id)}
              onChange={() => toggleItem(row.original.rule_id)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "rule_name",
        header: "Policy",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/policies/rules/${row.original.rule_id}`}
          >
            {row.original.rule_name}
          </Link>
        ),
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
        header: "Created",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
      },
    ];

    if (
      permissions.includes("policy:rule:edit") ||
      permissions.includes("policy:rule:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("policy:rule:edit")) {
            actions.push({
              label: "Edit Policy Rule",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/policies/rules/edit/${row?.original?.rule_id}`),
              tooltip: "Edit Policy Rule",
            });
          }

          if (permissions.includes("policy:rule:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Policy Rule",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.rule_name,
                  id: row?.original?.rule_id,
                }),
              tooltip: "Delete Policy Rule",
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
  ]);

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddPolicyRule = () => {
    navigate(`/policies/rules/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    queryClient.invalidateQueries(["policyrules", organization_id, domainName]);
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id: organization_id, rule_id: deleteId },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted policy rule");
            queryClient.invalidateQueries({
              queryKey: [
                "policyrules",
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
        { organization_id: organization_id, rule_id: itemId },
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
    queryClient.invalidateQueries(["policyrules", organization_id, domainName]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} policy rule${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected policy rules");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} policy rule${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const table = useReactTable({
    data: rules,
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

    if (permissions.includes("policy:rule:create")) {
      options.push({
        label: "Add Single Policy Rule",
        description: "Create one policy rule",
        icon: <Plus className="w-4 h-4" />,
        onClick: handleAddPolicyRule,
      });
    }

    if (
      permissions.includes("policy:rule:create") &&
      isImportAvailable &&
      domainName
    ) {
      options.push({
        label: "Import",
        description: "Import multiple policy rules from file",
        icon: <Upload className="w-4 h-4" />,
        onClick: handleImport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    domainName,
    handleAddPolicyRule,
    handleImport,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:rule:view"))
    return (
      <AccessDenied content="Don't have the access to list the policy rules." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error loading policy rules...!" />;

  return (
    <>
      <div className="px-2 w-full h-full flex flex-col">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-2.5">
          <Breadcrumbs items={[{ name: "Rules" }]} />

          <div className="min-w-72">
            <DomainSelector
              domainName={domainName}
              setDomainName={setDomainName}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && domainName && (
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">
                    {selectedCount} item{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="h-4 w-px bg-border"></div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearSelection}
                    className="px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all duration-200"
                  >
                    Clear
                  </button>
                  {permissions.includes("policy:rule:delete") && (
                    <DeleteButton
                      handleClick={() => setShowBulkDeleteModal(true)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </DeleteButton>
                  )}
                </div>
              </div>
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
            {rules.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No policy rules found for this domain" />
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
        confirmationLabel="Please type the policy rule name exactly to confirm deletion:"
        title="Delete Policy Rule"
        description="This action cannot be undone and will remove all policy rule data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Policy Rules"
        description="Are you sure you want to delete the selected policy rules?"
        itemName="policy rule"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Policy Rules"
        description="Upload a CSV or Excel file to create multiple policy rules at once."
        onComplete={handleImportCompleteWithRefresh}
      />
    </>
  );
}

export default PolicyRulesListing;
