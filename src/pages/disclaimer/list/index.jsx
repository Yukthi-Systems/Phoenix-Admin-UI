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
  useDeleteDisclaimer,
  useGetDisclaimers,
  useCreateDisclaimer,
  useUpdateDisclaimer,
} from "@/hooks/useDisclaimers";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  DeleteButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import ExportModal from "@/components/common/ExportModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { userInfoAtom } from "@/store/userInfo";
import NoDataFound from "@/components/common/NoDataFound";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Trash2, Download, Plus, Upload, Edit, Copy } from "lucide-react";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import { PER_PAGE } from "@/constants/constants";
import StatusBadge from "@/components/common/StatusBadge";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import { exportDisclaimersList, getDisclaimerDetails } from "@/api/disclaimer";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import CopyModal from "@/components/common/CopyModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListDisclaimers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { formatUserDateNice } = useUserTimezone();
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDeleteDisclaimer();
  const { mutate: createDisclaimer } = useCreateDisclaimer();
  const { mutate: updateDisclaimerMutate } = useUpdateDisclaimer();
  const { data, isLoading, isError, error, refetch } = useGetDisclaimers(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingDisclaimer, setCopyingDisclaimer] = useState(null);

  // Add handler
  const handleCopy = (disclaimer) => {
    setCopyingDisclaimer(disclaimer);
    setShowCopyModal(true);
  };

  const fetchDisclaimerForExport = async ({
    organization_id,
    page,
    pageSize,
  }) => {
    return await exportDisclaimersList(organization_id, page, pageSize);
  };

  // Search handler function
  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page when searching
    }
  };

  // Import functionality
  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("disclaimers", async (disclaimerData) => {
    return new Promise((resolve, reject) => {
      createDisclaimer(
        {
          data: {
            ...disclaimerData,
            associated_organization_id: organization_id,
          },
          addLog: false,
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error),
        },
      );
    });
  });

  const handleBulkEditDisclaimer = async (disclaimerData) => {
    const {
      organization_id: rowOrgId,
      disclaimer_id,
      ...rest
    } = disclaimerData;
    const data = { ...rest, associated_organization_id: rowOrgId };
    return new Promise((resolve, reject) => {
      updateDisclaimerMutate(
        { disclaimer_id, data },
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
  } = useBulkEdit("disclaimers", handleBulkEditDisclaimer, "disclaimer_id");

  const disclaimers = data?.data?.disclaimers ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 0;

  // Bulk selection functionality
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
  } = useBulkSelection(disclaimers, "disclaimer_id", "disclaimer_name");

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
              checked={isItemSelected(row.original.disclaimer_id)}
              onChange={() => toggleItem(row.original.disclaimer_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "disclaimer_name",
        header: "Disclaimer Name",
        cell: ({ row }) => (
          <Link
            to={`/disclaimer/${encodeURIComponent(row.original.disclaimer_id)}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {row.original.disclaimer_name}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },

      {
        accessorKey: "created_at",
        header: "Created Date",
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm">
            {formatUserDateNice(getValue())}
          </span>
        ),
        meta: {
          align: "left",
        },
      },

      {
        accessorKey: "updated_at",
        header: "Updated Date",
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm">
            {formatUserDateNice(getValue())}
          </span>
        ),
        meta: {
          align: "left",
        },
      },
    ];

    if (
      permissions.includes("disclaimer:edit") ||
      permissions.includes("disclaimer:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("disclaimer:edit")) {
            actions.push({
              label: "Edit Disclaimer",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/disclaimer/edit/${row.original.disclaimer_id}`),
              tooltip: "Edit disclaimer",
            });
          }
          if (permissions.includes("disclaimer:create")) {
            actions.push({
              label: "Copy Disclaimer",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row.original),
              tooltip: "Copy disclaimer",
            });
          }

          if (permissions.includes("disclaimer:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Disclaimer",
              icon: Trash2,
              variant: "danger",
              onClick: () => {
                setDeleteId(row.original.disclaimer_id);
                setDeleteValue(row.original.disclaimer_name);
                setShowDeleteModal(true);
              },
              tooltip: "Delete disclaimer",
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
        meta: {
          align: "center",
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

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddDisclaimer = () => {
    navigate("/disclaimer/add/");
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    // Refresh the disclaimers list
    const ActionLog = {
      action_type: "import_disclaimers",
      message: `Imported disclaimers via bulk import`,
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
    queryClient.invalidateQueries(["disclaimers", organization_id]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_disclaimers",
      message: `Updated disclaimers via bulk edit`,
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
    queryClient.invalidateQueries(["disclaimers", organization_id]);
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        {
          organization_id,
          disclaimer_id: deleteId,
          disclaimer_name: deleteValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted disclaimer");
            queryClient.invalidateQueries(["disclaimers", organization_id]);
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

  const handleBulkDelete = async (itemId, itemName = "Unknown Disclaimer") => {
    return new Promise((resolve, reject) => {
      mutate(
        { organization_id, disclaimer_id: itemId, disclaimer_name: itemName },
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
    queryClient.invalidateQueries(["disclaimers", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} disclaimer${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected disclaimers");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} disclaimer${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: disclaimers,
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
  } = useExport(
    "disclaimers",
    fetchDisclaimerForExport,
    FIELD_MAPPINGS.disclaimers,
  );

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const disclaimerCopyConfig = {
    type: "disclaimer",
    title: "Copy Disclaimer",
    itemDisplayName: "Disclaimer",
    copyRoute: (id) => `/disclaimer/copy/${id}`,
    fetchDetails: async (orgId, disclaimerId) => {
      const response = await getDisclaimerDetails(orgId, disclaimerId);
      return response.data?.data || response.data;
    },
    transformData: (disclaimer) => ({
      disclaimer_name: disclaimer.disclaimer_name,
      html_content: disclaimer.html_content,
      text_content: disclaimer.text_content,
      activate: disclaimer.is_active,
      details: {
        address: disclaimer.info?.address || "",
        description: disclaimer.info?.description || "",
      },
    }),
  };

  // Create options for dropdown button
  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("disclaimer:create")) {
      options.push({
        label: "Add Single Disclaimer",
        description: "Create one disclaimer",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddDisclaimer,
      });
    }

    if (permissions.includes("disclaimer:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: "Import multiple disclaimers from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("disclaimer:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple disclaimers",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("disclaimer:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all disclaimer as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddDisclaimer,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    handleExport,
  ]);
  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("disclaimer:view"))
    return (
      <AccessDenied content="Don't have the access to view disclaimer details" />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while listing the disclaimers" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Disclaimer Management" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search disclaimer..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="disclaimer:delete"
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
        {disclaimers.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="There are no disclaimer records found for the given organization." />
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
        confirmationLabel="Please type the disclaimer name exactly to confirm deletion:"
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Disclaimers"
        description="Are you sure you want to delete the selected disclaimers?"
        itemName="disclaimer"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Disclaimers"
        description="Upload a CSV or Excel file to create multiple disclaimers at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Disclaimers"
        description="Export disclaimers, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Disclaimers"
        description="Export all Disclaimers to Excel format. This may take a few minutes for large datasets."
      />

      <CopyModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyingDisclaimer(null);
        }}
        itemId={copyingDisclaimer?.disclaimer_id}
        itemName={copyingDisclaimer?.disclaimer_name}
        config={disclaimerCopyConfig}
      />
    </>
  );
};

export default ListDisclaimers;
