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

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

import { userProfileAtom } from "@/store/userProfile";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useToastify } from "@/hooks/useToastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteMaintenanceStatus,
  useGetMaintenanceStatus,
  useUpdateMaintenanceStatus,
} from "@/hooks/useMaintenanceStatus";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { AddButton } from "@/components/common/Buttons";
import DataFechError from "@/components/common/DataFechError";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import NoDataFound from "@/components/common/NoDataFound";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import TableWithoutPagination from "@/components/shared/TableWithoutPagination";
import MultiDelete from "@/components/shared/MultiDelete";

function MaintenanceStatusListing() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [statusFilter, setStatusFilter] = useState(true);

  const { formatUserDateNice } = useUserTimezone();
  const navigate = useNavigate();
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetMaintenanceStatus(statusFilter);
  const maintenanceStatuses = data?.data ?? [];
  const { mutate: deleteMaintenance, isPending } = useDeleteMaintenanceStatus();
  const { mutate: updateStatus } = useUpdateMaintenanceStatus();

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
  } = useBulkSelection(maintenanceStatuses, "maintenance_id", "title");

  const handleStatusToggle = (maintenance) => {
    const newStatus = !statusFilter; //TODO
    updateStatus(
      {
        maintenance_id: maintenance.maintenance_id,
        data: {
          ...maintenance,
          is_active: newStatus,
        },
      },
      {
        onSuccess: () => {
          toast(
            "success",
            `Maintenance status ${newStatus ? "activated" : "deactivated"} successfully`,
          );
          queryClient.invalidateQueries({
            queryKey: ["maintenance_status", statusFilter],
          });
          queryClient.invalidateQueries({
            queryKey: ["maintenance_status", !statusFilter],
          });
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          toast("error", `Failed to update status: ${message}`);
        },
      },
    );
  };

  const handleDelete = ({ name, id }) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(name);
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const OnDelete = () => {
    if (deleteId) {
      deleteMaintenance(
        { id: deleteId, maintenance_title: deleteValue },
        {
          onSuccess: () => {
            toast("success", "Maintenance status deleted successfully");
            queryClient.invalidateQueries({
              queryKey: ["maintenance_status", statusFilter],
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
          },
        },
      );
    } else {
      toast("error", "Unknown error");
    }
  };

  const handleBulkDelete = async (itemId, name) => {
    return new Promise((resolve, reject) => {
      deleteMaintenance(
        { id: itemId, maintenance_title: name },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries({
      queryKey: ["maintenance_status", statusFilter],
    });
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} maintenance status${results.successful.length !== 1 ? "es" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected maintenance statuses");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} maintenance status${results.successful.length !== 1 ? "es" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const columns = useMemo(() => {
    const baseColumns = [];

    if (permissions.includes("maintenance:delete")) {
      baseColumns.push({
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
              checked={isItemSelected(row.original.maintenance_id)}
              onChange={() => toggleItem(row.original.maintenance_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      });
    }

    baseColumns.push(
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <Link
            className="main-col"
            to={`/maintenance/view/${row.original.maintenance_id}`}
            state={{ maintenanceData: row.original }}
          >
            {row.original.title}
          </Link>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ getValue }) => {
          const severity = getValue();
          const severityColors = {
            LOW: "bg-success/20 text-success border-success/30",
            MEDIUM: "bg-warning/20 text-warning border-warning/30",
            HIGH: "bg-orange-500/15 text-orange-600 border-orange-500/30",
            CRITICAL:
              "bg-destructive/20 text-destructive border-destructive/30",
          };

          return (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                severityColors[severity] ||
                "bg-muted text-muted-foreground border-border"
              }`}
            >
              {severity
                ? severity.charAt(0).toUpperCase() +
                  severity.slice(1).toLowerCase()
                : "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "start_time",
        header: "Start Time",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
      {
        accessorKey: "end_time",
        header: "End Time",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
    );

    if (
      permissions.includes("maintenance:edit") ||
      permissions.includes("maintenance:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const actions = [];
          const isActive = statusFilter == true;

          if (permissions.includes("maintenance:edit")) {
            actions.push({
              label: "Edit Maintenance",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(`/maintenance/edit/${row.original.maintenance_id}`, {
                  state: {
                    maintenanceData: row.original,
                    isActive: statusFilter,
                  },
                }),
              tooltip: "Edit maintenance",
            });

            actions.push({
              label: isActive ? "Make Inactive" : "Make Active",
              icon: isActive ? XCircle : CheckCircle,
              variant: "default",
              onClick: () => handleStatusToggle(row.original),
              tooltip: `${isActive ? "Deactivate" : "Activate"} maintenance`,
            });
          }

          if (permissions.includes("maintenance:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Maintenance",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  name: row.original.title,
                  id: row.original.maintenance_id,
                }),
              tooltip: "Delete maintenance",
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
    navigate,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    toggleAllCurrentPage,
    toggleItem,
    isItemSelected,
    statusFilter,
  ]);

  const table = useReactTable({
    data: maintenanceStatuses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!permissions.includes("maintenance:create"))
    return (
      <AccessDenied content="You don't have permission to view maintenance statuses." />
    );

  if (isError)
    return <DataFechError content="Error loading maintenance statuses..." />;

  return (
    <>
      <div className="px-2 w-full h-full">
        <div className="w-full flex justify-between items-center mb-2.5">
          <Breadcrumbs items={[{ name: "Maintenance" }, { name: "Status" }]} />

          <div className="flex gap-2 items-center">
            {selectedCount > 0 && (
              <MultiDelete
                permission="maintenance:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            <div className="flex gap-2">
              {["Active", "In Active"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s === "Active");
                    clearSelection();
                  }}
                  className={`px-4 py-2 rounded-md text-sm border border-border transition-all
                  ${
                    statusFilter === (s === "Active")
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            {permissions.includes("maintenance:create") && (
              <AddButton
                label="Add Maintenance"
                handleClick={() => navigate("/maintenance/create")}
              />
            )}
          </div>
        </div>

        {maintenanceStatuses.length !== 0 || isLoading ? (
          <TableWithoutPagination table={table} isLoading={isLoading} />
        ) : (
          <NoDataFound content="No maintenance statuses found" />
        )}
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isPending}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the maintenance title exactly to confirm deletion:"
        title="Delete Maintenance Status"
        description="This action cannot be undone and will permanently remove the maintenance status."
      />

      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={() => setShowBulkDeleteModal(false)}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Maintenance Statuses"
        description="Are you sure you want to delete the selected maintenance statuses?"
        itemName="maintenance status"
      />
    </>
  );
}

export default MaintenanceStatusListing;
