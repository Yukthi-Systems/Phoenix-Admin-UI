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
import { userInfoAtom } from "@/store/userInfo";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import Table from "@/components/shared/Table";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useGetDepartments,
  useUpdateDepartment,
} from "@/hooks/useDepartment";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  DeleteButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import NoDataFound from "@/components/common/NoDataFound";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import ExportModal from "@/components/common/ExportModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import { useToastify } from "@/hooks/useToastify";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { Trash2, Download, Plus, Upload, Edit, Copy } from "lucide-react";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import { PER_PAGE } from "@/constants/constants";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";
import SearchBar from "@/components/shared/SearchBar";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import { exportDepartments, getDepartment } from "@/api/department";
import CopyModal from "@/components/common/CopyModal";
import { useUrlParam } from "@/hooks/useUrlParam";
import { ImportActionLog } from "@/utils/importActionLog";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListDepartments = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { mutate: createDepartmentMutation } = useCreateDepartment();
  const { mutate: updateDepartmentMutate } = useUpdateDepartment();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const { formatUserDateNice } = useUserTimezone();
  const [deleteId, setDeleteId] = useState("");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const { mutate, isPending } = useDeleteDepartment();
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useGetDepartments(
    organization_id,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingDepartment, setCopyingDepartment] = useState(null);

  // Handler
  const handleCopy = (department) => {
    setCopyingDepartment(department);
    setShowCopyModal(true);
  };

  const fetchDepartmentsForExport = async ({
    organization_id,
    page,
    pageSize,
  }) => {
    return await exportDepartments(organization_id, page, pageSize);
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
  } = useBulkImport("departments", async (departmentData) => {
    return new Promise((resolve, reject) => {
      createDepartmentMutation(
        {
          data: {
            ...departmentData,
            associated_organization_id: organization_id,
          },
          addLog: false,
        },
        {
          onSuccess: (result) => {
            resolve(result);
          },
          onError: (error) => {
            console.error("Failed to create department:", error);
            reject(error);
          },
        },
      );
    });
  });

  const handleBulkEditDepartment = async (departmentData) => {
    const {
      organization_id: rowOrgId,
      department_id,
      ...rest
    } = departmentData;
    const data = { ...rest, associated_organization_id: rowOrgId };
    return new Promise((resolve, reject) => {
      updateDepartmentMutate(
        { department_id, data },
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
  } = useBulkEdit("departments", handleBulkEditDepartment, "department_id");

  const departments = data?.data?.departments ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 1;

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
  } = useBulkSelection(departments, "department_id", "department_name");

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "departments",
    fetchDepartmentsForExport,
    FIELD_MAPPINGS.departments,
  );

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
              checked={isItemSelected(row.original.department_id)}
              onChange={() => toggleItem(row.original.department_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "department_name",
        header: "Department Name",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/department/${encodeURIComponent(row.original.department_id)}`}
          >
            {row.original.department_name}
          </Link>
        ),
        meta: {
          align: "left",
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
      permissions.includes("department:edit") ||
      permissions.includes("department:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("department:edit")) {
            actions.push({
              label: "Edit Department",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/department/edit/${row?.original?.department_id}`),
              tooltip: "Edit department",
            });
          }

          if (permissions.includes("department:create")) {
            actions.push({
              label: "Copy Department",
              icon: Copy,
              variant: "default",
              onClick: () => handleCopy(row.original),
              tooltip: "Copy department",
            });
          }

          if (permissions.includes("department:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Department",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.department_name,
                  id: row?.original?.department_id,
                }),
              tooltip: "Delete department",
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

  const handleAddDepartment = () => {
    navigate("/department/add/");
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    // Refresh the departments list
    const ActionLog = {
      action_type: "import_departments",
      message: `Imported departments via bulk import`,
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
    queryClient.invalidateQueries(["departments", organization_id]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    const ActionLog = {
      action_type: "bulk_edit_departments",
      message: `Updated departments via bulk edit`,
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
    queryClient.invalidateQueries(["departments", organization_id]);
  };

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        {
          organization_id,
          department_id: deleteId,
          department_name: deleteValue,
        },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted department");
            queryClient.invalidateQueries(["departments", organization_id]);
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
      toast("error", `Message: 'Unknown error'`);
    }
  };

  const handleBulkDelete = async (itemId, itemName = "Unknown Department") => {
    return new Promise((resolve, reject) => {
      mutate(
        { organization_id, department_id: itemId, department_name: itemName },
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
    queryClient.invalidateQueries(["departments", organization_id]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} department${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected departments");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} department${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: departments,
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

  const createOptions = useMemo(() => {
    const options = [];

    if (permissions.includes("department:create")) {
      options.push({
        label: "Add Single Department",
        description: "Create one department",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddDepartment,
      });
    }

    if (permissions.includes("department:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: "Import multiple departments from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("department:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple departments",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("department:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all department as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddDepartment,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    handleExport,
  ]);

  const departmentCopyConfig = {
    type: "department",
    title: "Copy Department",
    itemDisplayName: "Department",
    copyRoute: (id) => `/department/copy/${id}`,
    fetchDetails: async (orgId, departmentId) => {
      const response = await getDepartment(orgId, departmentId);
      return response.data?.data || response.data;
    },
    transformData: (department) => ({
      department_name: department.department_name,
      department_details: {
        address: department.details?.address || "",
        description: department.details?.description || "",
        notes: department.details?.notes || "",
        authorized_persons: department.details?.authorized_persons || [
          { name: "", email: "", phone: "" },
        ],
      },
    }),
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  if (!permissions.includes("department:view"))
    return (
      <AccessDenied content="Don't have access to list department details." />
    );

  if (isError && isServerError)
    return <DataFechError content="Error while listing the departments" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Department Management" }]} />

          <div className="flex flex-1 gap-2">
            <SearchBar
              placeholder="Search department..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              onRefresh={refetch}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="department:delete"
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

        {departments.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataErrorWithReload content={error?.response?.data?.message} />
        ) : (
          <NoDataFound content="There is no department found in this organization" />
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
        confirmationLabel="Please type the department name exactly to confirm deletion:"
        title="Delete Department"
        description="This action cannot be undone and will remove all department data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Departments"
        description="Are you sure you want to delete the selected departments?"
        itemName="department"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Departments"
        description="Upload a CSV or Excel file to create multiple departments at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Departments"
        description="Export departments, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Departments"
        description="Export all Departments to Excel format. This may take a few minutes for large datasets."
      />

      <CopyModal
        isOpen={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyingDepartment(null);
        }}
        itemId={copyingDepartment?.department_id}
        itemName={copyingDepartment?.department_name}
        config={departmentCopyConfig}
      />
    </>
  );
};

export default ListDepartments;
