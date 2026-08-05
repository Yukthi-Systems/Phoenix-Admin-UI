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
  useDeleteServer,
  useGetServers,
  useAddServer,
  useUpdateServer,
  useUpdateServerStatus,
  useRecaulculateQuota,
} from "@/hooks/useServer";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  Button,
  DeleteButton,
  TableDeleteButton,
  TableEditButton,
} from "@/components/common/Buttons";
import ProgressBar from "@/components/common/Progress";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import BulkImportModal from "@/components/common/BulkImport";
import DropdownButton from "@/components/common/DropdownButton";
import NoDataFound from "@/components/common/NoDataFound";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import {
  Trash2,
  Download,
  Plus,
  Upload,
  Edit,
  XCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import useBulkImport, { useBulkEdit } from "@/hooks/useImport";
import useExport from "@/hooks/useExport";
import { FIELD_MAPPINGS } from "@/constants/export";
import ExportModal from "@/components/common/ExportModal";
import { PER_PAGE } from "@/constants/constants";
import StatusBadge from "@/components/common/StatusBadge";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import EditModelBox from "@/components/common/EditModelBox";
import { useUrlParam } from "@/hooks/useUrlParam";
import SearchBar from "@/components/shared/SearchBar";
import { useTablePagination } from "@/hooks/useTablePagination";
import { getServers } from "@/api/servers";

const ListServers = () => {
  const navigate = useNavigate();
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);

  const [statusValue, setStatusValue] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [statusName, setStatusName] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useDeleteServer();
  const { formatUserDateNice } = useUserTimezone();
  const { mutate: createServer } = useAddServer();

  // Recalculate Quota Hook
  const { mutate: recalculateQuota, isPending: isRecalculating } =
    useRecaulculateQuota();

  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { data, isLoading, isError, refetch } = useGetServers(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );

  const { mutate: statusUpdate, isPending: statusLoad } =
    useUpdateServerStatus();
  const { mutate: updateServerMutate } = useUpdateServer();

  const {
    isImportModalOpen,
    importConfig,
    handleImport,
    handleImportModalClose,
    handleImportComplete,
    isImportAvailable,
  } = useBulkImport("servers", async (serverData) => {
    return new Promise((resolve, reject) => {
      createServer(serverData, {
        onSuccess: (result) => resolve(result),
        onError: (error) => reject(error),
      });
    });
  });

  const handleBulkEditServer = async (serverData) => {
    const { organization_id: _rowOrgId, server_id, ...rest } = serverData;
    const data = { ...rest };
    return new Promise((resolve, reject) => {
      updateServerMutate(
        { server_id, data },
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
  } = useBulkEdit("servers", handleBulkEditServer, "server_id");

  const fetchServersForExport = async ({ page, pageSize }) => {
    return await getServers(page, pageSize);
  };

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport("servers", fetchServersForExport, {}, FIELD_MAPPINGS.servers);
  const filtered = data?.servers?.filter(
    (s) => s.server_id != "0d069ed3-daaa-534f-9d2d-bd6c34503b84",
  );

  const servers = filtered ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total_count ?? 0;

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
  } = useBulkSelection(servers, "server_id", "host_name");

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
              checked={isItemSelected(row.original.server_id)}
              onChange={() => toggleItem(row.original.server_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "host_name",
        header: "Host Name",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/server/${encodeURIComponent(row.original.server_id)}`}
          >
            {row.original.host_name}
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
        id: "storage",
        header: "Storage",
        cell: ({ row }) => {
          const { quota_utilized, quota_allocated } = row.original;
          return (
            <ProgressBar
              utilized={quota_utilized}
              allocated={quota_allocated}
            />
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "is_monitoring",
        header: "Monitoring",
        cell: ({ getValue }) => {
          return (
            <span
              className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-sm font-medium transition-colors ${
                getValue() === true
                  ? "border-success/30 bg-success/10 text-success dark:border-success/50 dark:bg-success/20"
                  : "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/20"
              }`}
            >
              {getValue() === true ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "is_mailbox_server",
        header: "Mailbox",
        cell: ({ getValue }) => {
          return (
            <span
              className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-sm font-medium transition-colors ${
                getValue() === true
                  ? "border-success/30 bg-success/10 text-success dark:border-success/50 dark:bg-success/20"
                  : "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/20"
              }`}
            >
              {getValue() === true ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "is_accepting_new_mailboxes",
        header: "Accepting Mailboxes",
        cell: ({ getValue }) => {
          return (
            <span
              className={`inline-flex items-center rounded-2xl border px-2.5 py-1 text-sm font-medium transition-colors ${
                getValue() === true
                  ? "border-success/30 bg-success/10 text-success dark:border-success/50 dark:bg-success/20"
                  : "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/20"
              }`}
            >
              {getValue() === true ? "Yes" : "No"}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => {
          return formatUserDateNice(getValue());
        },
        meta: {
          align: "left",
        },
      },
    ];
    if (
      permissions.includes("server:edit") ||
      permissions.includes("server:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("server:edit")) {
            actions.push({
              label: "Edit Server",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/server/edit/${row?.original?.server_id}`),
              tooltip: "Edit server",
            });
          }
          if (permissions.includes("server:edit")) {
            actions.push({
              label: row.original.is_active ? "Deactivate" : "Activate",
              icon: row.original.is_active ? XCircle : CheckCircle,
              variant: row.original.is_active ? "danger" : "success",
              onClick: () => handleStatus(row.original),
              tooltip: "Toggle status",
            });
          }

          if (permissions.includes("server:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Server",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row?.original?.host_name,
                  id: row?.original?.server_id,
                }),
              tooltip: "Delete server",
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

  const handleStatus = (row) => {
    setStatusId(row.server_id);
    setStatusName(row.host_name);
    setStatusValue(!row.is_active);
    setShowStatusModal(true);
  };

  const handleStatusClose = () => {
    setStatusId("");
    setStatusName("");
    setStatusValue(false);
    setShowStatusModal(false);
  };

  const handleRecalculateConfirm = () => {
    recalculateQuota(undefined, {
      onSuccess: () => {
        toast("success", "Quota recalculation started successfully");
        setShowRecalculateModal(false);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to start recalculation";
        toast("error", message);
        setShowRecalculateModal(false);
      },
    });
  };

  function handleDelete({ name, id }) {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleBulkModalClose = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAddServer = () => {
    navigate("/server/add/");
  };

  const handleImportCompleteWithRefresh = (results) => {
    handleImportComplete(results);
    // Refresh the servers list
    queryClient.invalidateQueries(["servers"]);
  };

  const handleEditCompleteWithRefresh = (results) => {
    handleEditComplete(results);
    queryClient.invalidateQueries(["servers"]);
  };

  const OnStatusChange = () => {
    if (statusId) {
      statusUpdate(
        { server_id: statusId, status: statusValue, server_name: statusName },
        {
          onSuccess: () => {
            toast("success", "Successfully update server status");
            queryClient.invalidateQueries({
              queryKey: [
                "servers",
                pagination.pageIndex + 1,
                pagination.pageSize,
              ],
            });
            removeFromSelection([deleteId]);
            setShowStatusModal(false);
            setStatusId("");
            setStatusName("");
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

  const OnDelete = () => {
    if (deleteId) {
      mutate(
        { server_id: deleteId, server_name: deleteValue },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted server");
            queryClient.invalidateQueries({
              queryKey: [
                "servers",
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

  const handleBulkDelete = async (itemId, itemName) => {
    return new Promise((resolve, reject) => {
      mutate(
        { server_id: itemId, server_name: itemName },
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
    queryClient.invalidateQueries(["servers"]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} server${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected servers");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} server${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const table = useReactTable({
    data: servers,
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

    if (permissions.includes("server:create")) {
      options.push({
        label: "Add Single Server",
        description: "Create one server",
        icon: <Plus className="h-4 w-4" />,
        onClick: handleAddServer,
      });
    }

    if (permissions.includes("server:create") && isImportAvailable) {
      options.push({
        label: "Import",
        description: "Import multiple servers from file",
        icon: <Upload className="h-4 w-4" />,
        onClick: handleImport,
      });
    }

    if (permissions.includes("server:edit") && isEditAvailable) {
      options.push({
        label: "Bulk Edit",
        description:
          "Export, edit the file, then re-upload to update multiple servers",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleBulkEdit,
      });
    }

    if (permissions.includes("server:view") && isExportAvailable) {
      options.push({
        label: "Export",
        description: "Download all servers as Excel file",
        icon: <Download className="h-4 w-4" />,
        onClick: handleExport,
      });
    }

    return options;
  }, [
    permissions,
    isImportAvailable,
    handleAddServer,
    handleImport,
    isEditAvailable,
    handleBulkEdit,
    isExportAvailable,
    handleExport,
  ]);

  if (!permissions.includes("server:view"))
    return (
      <AccessDenied content="Don't have the access to view server details" />
    );

  if (isError)
    return <DataFechError content="Error while listing the servers" />;

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mt-1.5 mb-2.5 flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Breadcrumbs items={[{ name: "Mailbox Server" }]} />
            <div className="flex flex-1 gap-2">
              <SearchBar
                placeholder="Search servers..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onRefresh={refetch}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            {/* Bulk actions */}
            {selectedCount > 0 && (
              <div className="bg-muted/30 border-border/50 flex items-center gap-3 rounded-lg border px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
                  <span className="text-foreground text-sm font-medium">
                    {selectedCount} item{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="bg-border h-4 w-px"></div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearSelection}
                    className="text-muted-foreground hover:text-foreground hover:bg-background rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200"
                  >
                    Clear
                  </button>
                  {permissions.includes("server:delete") && (
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

            {/* Recalculate Button */}
            {permissions.includes("server:edit") && (
              <Button
                variant="outline"
                onClick={() => setShowRecalculateModal(true)}
                className="gap-2"
                disabled={isRecalculating}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw
                    size={16}
                    className={isRecalculating ? "animate-spin" : ""}
                  />
                  Recalculate Quota
                </div>
              </Button>
            )}

            {createOptions.length > 0 && (
              <DropdownButton
                label="Create"
                options={createOptions}
                variant="primary"
              />
            )}
          </div>
        </div>
        {servers.length !== 0 || isLoading ? (
          <Table totalCount={totalCount} table={table} isLoading={isLoading} />
        ) : (
          <NoDataFound content="There is no Mailbox Server records found for the give organization." />
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
        confirmationLabel="Please type the server hostname exactly to confirm deletion:"
        title="Delete Server"
        description="This action cannot be undone and will remove all server data."
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={handleBulkModalClose}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Servers"
        description="Are you sure you want to delete the selected servers?"
        itemName="server"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={handleImportModalClose}
        importConfig={importConfig}
        title="Bulk Import Servers"
        description="Upload a CSV or Excel file to create multiple servers at once."
        onComplete={handleImportCompleteWithRefresh}
      />

      <BulkImportModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        importConfig={editConfig}
        mode="edit"
        title="Bulk Edit Servers"
        description="Export servers, edit the fields you want to change, then upload the file here to update them."
        onComplete={handleEditCompleteWithRefresh}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Servers"
        description="Export all servers to Excel format. This may take a few minutes for large datasets."
      />

      {/* Status Modal */}
      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label="Change Status"
          handleCancel={handleStatusClose}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want{" "}
              <>
                {statusValue ? (
                  <span className="font-medium text-green-400">Active</span>
                ) : (
                  <span className="font-medium text-red-400">In-active</span>
                )}
              </>{" "}
              {statusName} .
            </p>
            <div className="mx-4 my-2 mt-12 flex items-center justify-end gap-3">
              <Button
                disabled={statusLoad}
                onClick={handleStatusClose}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>

              <Button
                disabled={statusLoad}
                onClick={OnStatusChange}
                variant="primary"
                size="md"
              >
                Confirm
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}

      {/* Recalculate Quota Modal */}
      {showRecalculateModal && (
        <EditModelBox
          isOpen={showRecalculateModal}
          label="Recalculate Quota"
          handleCancel={() => setShowRecalculateModal(false)}
        >
          <div className="w-xl text-left">
            <p className="mt-2 text-destructive">
              Are you sure you want to recalculate quotas?
            </p>
            <p className="mb-3 mt-4 text-base text-muted-foreground">
              This will recalculate the Servers and domains quota based on
              mailbox allocated spaces. And this is instant, if there are many
              domains or servers this might take some time do not close this
              window till its done.
            </p>
            <div className="mx-4 my-2 mt-12 flex items-center justify-end gap-3">
              <Button
                disabled={isRecalculating}
                onClick={() => setShowRecalculateModal(false)}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>

              <Button
                disabled={isRecalculating}
                onClick={handleRecalculateConfirm}
                variant="primary"
                size="md"
              >
                {isRecalculating ? "Starting..." : "Confirm"}
              </Button>
            </div>
          </div>
        </EditModelBox>
      )}
    </>
  );
};

export default ListServers;
