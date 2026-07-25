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
import useBulkImport from "@/hooks/useImport";
import useExport from "@/hooks/useExport";
import {
  useDeleteDistributionPolicy,
  useDistributionPolicy,
  useAddDistributionPolicy,
} from "@/hooks/useDistributionPolicy";
import {
  exportDistributionPolicy,
  getDistributionPolicyEntry,
} from "@/api/distributionPolicy";

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

const ListDistributionPolicy = () => {
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

  // Use distribution policy hooks
  const { data, isLoading, isError, error, refetch } = useDistributionPolicy({
    organization_id,
    domain_name: domainName,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: searchQuery,
  });

  const fetchDistributionPolicyForExport = async ({
    organization_id: orgId,
    domain_name: domain,
    page,
    pageSize,
  }) => {
    return exportDistributionPolicy({
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

  const distributionPolicies = data?.entries ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

  const { mutate, isPending } = useDeleteDistributionPolicy();
  const { mutate: addDistributionPolicy } = useAddDistributionPolicy();

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
  } = useBulkSelection(distributionPolicies, "policy_id", "policy_name");

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("distribution_policies", async (policyData) => {
    return new Promise((resolve, reject) => {
      addDistributionPolicy(
        {
          org_id: organization_id,
          data: {
            ...policyData,
            domain_name: domainName,
          },
          addLogs: false
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (err) => reject(err),
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
    "distributionPolicies",
    fetchDistributionPolicyForExport,
    { domain_name: domainName },
    FIELD_MAPPINGS.distributionPolicies || FIELD_MAPPINGS.generalPolicies,
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
      const data = await getDistributionPolicyEntry(organization_id, id);
      setFullData(data);
    } catch (err) {
      console.error("Error fetching policy details:", err);
      toast("error", "Failed to fetch policy details for copying");
    }
  };

  const handleNext = async (targetDomain) => {
    navigate(
      { pathname: `/policies/distribution/copy/${targetDomain}` },
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

  const handleAddDistributionPolicy = () => {
    navigate(`/policies/distribution/add/${domainName}`);
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    const ActionLog = {
      action_type: "import_distribution_policy",
      message: `Imported distribution policies via bulk import`,
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
      "distribution_policy",
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
            toast("success", "Successfully deleted distribution policy");
            queryClient.invalidateQueries({
              queryKey: [
                "distribution_policy",
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
      "distribution_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} distribution policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected distribution policies");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} distribution policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
      );
    }
  };

  const handleBulkCopy = async (sourceDomain, policyId, targetDomain) => {
    return new Promise(async (resolve, reject) => {
      try {
        const policyData = await getDistributionPolicyEntry(organization_id, policyId);

        const copyData = {
          ...policyData,
          policy_name: `${policyData.policy_name} (Copy)`,
          domain_name: targetDomain,
        };

        addDistributionPolicy(
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
      "distribution_policy",
      organization_id,
      domainName,
    ]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully copied ${results.successful.length} distribution policy${results.successful.length !== 1 ? "ies" : "y"}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to copy all selected distribution policies");
    } else {
      toast(
        "warning",
        `Copied ${results.successful.length} distribution policy${results.successful.length !== 1 ? "ies" : "y"}. ${results.failed.length} failed.`,
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
            to={`/policies/distribution/${row?.original?.policy_id}`}
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
        accessorKey: "distribution_type",
        header: "Distribution Type",
        cell: ({ getValue }) => {
          return <span className="capitalize">{getValue()?.replace(/_/g, ' ') || 'N/A'}</span>;
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
              label: "Edit Distribution Policy",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/policies/distribution/edit/${row?.original?.policy_id}`),
              tooltip: "Edit Distribution Policy",
            });
          }

          if (permissions.includes("policy:general:edit")) {
            actions.push({
              label: "Copy Distribution Policy",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row?.original),
              tooltip: "Copy Distribution Policy",
            });
          }

          if (permissions.includes("policy:general:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Distribution Policy",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.policy_name,
                  id: row?.original?.policy_id,
                }),
              tooltip: "Delete Distribution Policy",
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
    data: distributionPolicies,
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
        description: "Delete Distribution policy",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => setShowBulkDeleteModal(true),
      });
    }

    if (permissions.includes("policy:general:edit")) {
      options.push({
        label: "Copy",
        description: "Copy distribution policy between domains",
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
        label: "Add Single Distribution Policy",
        description: "Create one distribution policy",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddDistributionPolicy,
      });
    }

    if (permissions.includes("policy:general:create") && domainName) {
      options.push({
        label: "Import",
        description: "Import multiple distribution policies from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("policy:general:create") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all distribution policies as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    domainName,
    isExportAvailable,
    handleAddDistributionPolicy,
    handleImport,
    handleExport,
  ]);

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("policy:general:view")) {
    return (
      <AccessDenied content="You don't have permission to view distribution policies." />
    );
  }

  if (isError && isServerError) {
    return <DataFechError content="Error loading distribution policies..." />;
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Distribution Policies" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search distribution policies..."
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
            {distributionPolicies.length !== 0 || isLoading ? (
              <Table
                table={table}
                isLoading={isLoading}
                totalCount={totalCount}
              />
            ) : isError && !isServerError ? (
              <DataErrorWithReload content={error?.response?.data?.message} />
            ) : (
              <NoDataFound content="No distribution policies found for this domain" />
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
        title="Delete Distribution Policy"
        description="This action cannot be undone and will remove all policy data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Distribution Policies"
        description="Are you sure you want to delete the selected distribution policies?"
        itemName="distribution policy"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Distribution Policies"
        description="Upload a CSV or Excel file to create multiple distribution policies at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Distribution Policies"
        description="Export all distribution policies to Excel format. This may take a few minutes for large datasets."
      />

      {/* Copy Single Policy Modal */}
      {openCopy && (
        <CopyItem
          isOpen={openCopy}
          onClose={handleCloseMove}
          item={selectedPolicy}
          onNext={handleNext}
          title="Copy Distribution Policy"
          itemLabel="Distribution Policy"
          organization_id={organization_id}
          currentDomain={domainName}
        />
      )}
    </>
  );
};

export default ListDistributionPolicy;