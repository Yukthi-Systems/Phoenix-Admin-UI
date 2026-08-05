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

import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Table from "@/components/shared/Table";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useDeleteCaution,
  useGetCautions,
  useCreateCaution,
  useUpdateCaution,
} from "@/hooks/useCautions";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { userInfoAtom } from "@/store/userInfo";
import NoDataFound from "@/components/common/NoDataFound";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Trash2, Plus, Upload, Edit, Download, Copy } from "lucide-react";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { PER_PAGE } from "@/constants/constants";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import { exportCautionsList, getCautionDetails } from "@/api/cautions";
import ExportModal from "@/components/common/ExportModal";
import CopyModal from "@/components/common/CopyModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useGetDomains } from "@/hooks/useDomain";
import StatusBadge from "@/components/common/StatusBadge";

const ListCautions = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");

  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const { formatUserDateNice } = useUserTimezone();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDeleteCaution();
  const { mutate: createCaution } = useCreateCaution();
  const { mutate: updateCautionMutate } = useUpdateCaution();
  const { data, isLoading, isError, error, refetch } = useGetCautions(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const { data: domainsData } = useGetDomains(organization_id, 1, 1000);
  const domainsList = useMemo(
    () => domainsData?.domains?.domains || [],
    [domainsData],
  );
  const cautionDomainMap = useMemo(() => {
    const map = {};
    domainsList.forEach((domain) => {
      if (domain.caution_id) {
        map[domain.caution_id] = domain.domain_name;
      }
    });
    return map;
  }, [domainsList]);

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingCaution, setCopyingCaution] = useState(null);

  const handleCopy = (caution) => {
    setCopyingCaution(caution);
    setShowCopyModal(true);
  };

  const fetchCautionForExport = async ({ organization_id, page, pageSize }) => {
    return await exportCautionsList(organization_id, page, pageSize);
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

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("cautions", async (cautionData) => {
    return new Promise((resolve, reject) => {
      createCaution(
        { data: cautionData, addLog: false },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  });

  const handleBulkEditCaution = async (cautionData) => {
    const { organization_id: rowOrgId, caution_id, ...rest } = cautionData;
    const data = { ...rest, associated_organization_id: rowOrgId };
    return new Promise((resolve, reject) => {
      updateCautionMutate(
        { organization_id: rowOrgId, caution_id, data },
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
  } = useBulkEdit("cautions", handleBulkEditCaution, "caution_id");

  const cautions = data?.data.cautions ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 0;

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
  } = useBulkSelection(cautions, "caution_id", "caution_name");

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
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isItemSelected(row.original.caution_id)}
              onChange={() => toggleItem(row.original.caution_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "caution_name",
        header: "Caution Name",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/caution/${encodeURIComponent(row.original.caution_id)}`}
          >
            {row.original.caution_name}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        id: "domain_name",
        header: "Domain Name",
        cell: ({ row }) => {
          const domainName = cautionDomainMap[row.original.caution_id];
          return domainName ? (
            <Link
              className="hover:underline text-primary"
              to={`/domain/details/${encodeURIComponent(domainName)}`}
            >
              {domainName}
            </Link>
          ) : (
            "--"
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isEnabled = !!cautionDomainMap[row.original.caution_id];
          return <StatusBadge status={isEnabled} />;
        },
      },
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
      permissions.includes("caution:edit") ||
      permissions.includes("caution:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("caution:edit")) {
            actions.push({
              label: "Edit Caution",
              icon: Edit,
              variant: "default",
              onClick: () => handleEdit(row.original),
              tooltip: "Edit caution",
            });
          }

          if (permissions.includes("caution:create")) {
            actions.push({
              label: "Copy Caution",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row.original),
              tooltip: "Copy caution",
            });
          }

          if (permissions.includes("caution:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Caution",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDelete(row.original),
              tooltip: "Delete caution",
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
    cautionDomainMap,
  ]);

  const handleEdit = (caution) => {
    navigate(`/caution/edit/${caution.caution_id}`);
  };

  const handleDelete = (caution) => {
    setDeleteValue(caution.caution_name);
    setDeleteId(caution.caution_id);
    setShowDeleteModal(true);
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddCaution = () => {
    navigate("/caution/add/");
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    // Refresh the mailboxes list
    const ActionLog = {
      action_type: "import_cautions",
      message: `Imported cautions via bulk import`,
      payload: {
        ...results,
        total_imported: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        organization_id: organization_id,
      },
    };
    ImportActionLog({ values: ActionLog });
    // Refresh the cautions list
    queryClient.invalidateQueries(["cautions", organization_id]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_cautions",
      message: `Updated cautions via bulk edit`,
      payload: {
        ...results,
        total_updated: results.successful.length || 0,
        total_failed: results.failed.length || 0,
      },
      organization_id: organization_id,
      details: {
        organization_id: organization_id,
      },
    };
    ImportActionLog({ values: ActionLog });
    queryClient.invalidateQueries(["cautions", organization_id]);
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { organization_id, caution_id: deleteId, caution_name: deleteValue },
        {
          onSuccess: (data) => {
            toast("success", "Successfully deleted caution message");
            queryClient.invalidateQueries(["cautions", organization_id]);
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

  const handleBulkDelete = async (itemId, name) => {
    return new Promise((resolve, reject) => {
      mutate(
        { organization_id, caution_id: itemId, caution_name: name },
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
    queryClient.invalidateQueries(["cautions", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} caution${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected cautions");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} caution${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const cautionCopyConfig = {
    type: "caution",
    title: "Copy Caution",
    itemDisplayName: "Caution",
    copyRoute: (id) => `/caution/copy/${id}`,
    fetchDetails: async (orgId, cautionId) => {
      const response = await getCautionDetails(orgId, cautionId);

      return response;
    },
    transformData: (caution) => ({
      caution_message_name: caution.caution_name,
      html_content: caution.html_content,
      text_content: caution.text_content,
      info: {
        description: caution.info?.description || "",
        notes: caution.info?.notes || "",
        severity: caution.info?.severity || "Medium",
      },
    }),
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: cautions,
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

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport("cautions", fetchCautionForExport, FIELD_MAPPINGS.cautions);

  // Create options for dropdown button
  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("caution:create")) {
      options.push({
        label: "Add Single Caution",
        description: "Create one caution message",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddCaution,
      });
    }

    if (permissions.includes("caution:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: "Import multiple cautions from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("caution:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple cautions",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("caution:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all cautions as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddCaution,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    handleExport,
  ]);
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("caution:view"))
    return (
      <AccessDenied content="Don't have the access to view caution details" />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while listing the cautions" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Caution Management" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search cautions..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="caution:delete"
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

        {cautions.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="There are no caution message records found for the given organization." />
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue || ""}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the caution name exactly to confirm deletion:"
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Cautions"
        description="Are you sure you want to delete the selected caution messages?"
        itemName="caution"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Cautions"
        description="Upload a CSV or Excel file to create multiple caution messages at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Cautions"
        description="Export cautions, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Caution"
        description="Export all Cautions to Excel format. This may take a few minutes for large datasets."
      />
      <CopyModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyingCaution(null);
        }}
        itemId={copyingCaution?.caution_id}
        itemName={copyingCaution?.caution_name}
        config={cautionCopyConfig}
      />
    </>
  );
};

export default ListCautions;
