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

import React, { useMemo, useState } from "react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/shared/Table";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import NoDataFound from "@/components/common/NoDataFound";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import StatusBadge from "./StatusBadge";
import BugReportDetailsModal from "./ReportsModal";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  useGetBugReports,
  useUpdateBugStatus,
  useDeleteBug,
} from "@/hooks/useReportBug";

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PER_PAGE } from "@/constants/constants";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useToastify } from "@/hooks/useToastify";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import { useTablePagination } from "@/hooks/useTablePagination";

const BugReports = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  if (!permissions.includes("internal_action:view")) {
    return (
      <AccessDenied content="You do not have permission to view bug reports." />
    );
  }

  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [searchQuery, setSearchQuery] = useState("");
 const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW DELETE MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState(null);

  const { data, isLoading, isError, error, refetch } = useGetBugReports(
    statusFilter,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  const updateMutation = useUpdateBugStatus();
  const deleteMutation = useDeleteBug();

  const reports = data?.data?.data ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? reports.length;

  // OPEN REPORT DETAILS
  const handleOpen = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // UPDATE STATUS
  const handleStatusUpdate = (reportId, newStatus) => {
    if (!permissions.includes("internal_action:edit")) {
      return toast("error", "You do not have permission to update status.");
    }

    updateMutation.mutate(
      { report_id: reportId, bug_status: newStatus },
      {
        onSuccess: () => {
          toast("success", "Status updated");
          refetch();
        },
        onError: (err) => {
          toast("error", err.message || "Failed to update status");
        },
      },
    );
  };

  const truncateText = (text, length = 20) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // OPEN DELETE MODAL
  const handleDeleteReport = (report) => {
    setDeleteValue(report);
    setShowDeleteModal(true);
  };

  // CANCEL DELETE
  const onCancel = () => {
    setShowDeleteModal(false);
    setDeleteValue(null);
  };

  // EXECUTE DELETE
  const onDelete = () => {
    if (!permissions.includes("internal_action:delete")) {
      return toast("error", "You do not have permission to delete reports.");
    }

    deleteMutation.mutate(
      { report_id: deleteValue?.report_id },
      {
        onSuccess: () => {
          toast("success", "Bug report deleted");
          setShowDeleteModal(false);
          setDeleteValue(null);
          refetch();
        },
        onError: (err) => {
          toast("error", err.message || "Failed to delete report");
        },
      },
    );
  };

  // Get available status transitions
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      OPEN: ["IN_PROGRESS", "RESOLVED"],
      IN_PROGRESS: ["OPEN", "RESOLVED"],
      RESOLVED: [ "OPEN","IN_PROGRESS"],
    };
    return transitions[currentStatus] || [];
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "report_id",
        header: "Report ID",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-card-foreground">
            #{row.original.report_id}
          </div>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <button
            className="text-left max-w-[360px]"
            onClick={() => handleOpen(row.original)}
          >
            <div
              className="
                main-col
                line-clamp-3 
                leading-snug
              "
            >
              {row.original.subject}
            </div>
          </button>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "user_name",
        header: "Reported By",
        cell: ({ row }) => (
          <div className="text-sm text-card-foreground">
            {row.original.additional_info.user_name || "-"}
            {` (${row.original.additional_info.contact_email || row.original.additional_info.contact_phone})`}
          </div>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "created_at",
        header: "Reported On",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {new Date(row.original.created_at).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <div className="text-sm text-card-foreground capitalize">
            {row.original.additional_info?.details?.type || "-"}
          </div>
        ),
        meta: {
          align: "left",
        },
      },

      // ACTIONS COLUMN
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const report = row.original;
          const actions = [];
          const currentStatus =  statusFilter;
          const availableTransitions = getAvailableStatusTransitions(currentStatus);

          if (permissions.includes("internal_action:edit")) {
            actions.push({ separator: true });
            
            availableTransitions.forEach((status) => {
              const statusLabel = status.replace("_", " ");
              actions.push({
                label: `Mark ${statusLabel}`,
                icon: Edit,
                variant: status === "RESOLVED" ? "success" : "default",
                onClick: () => handleStatusUpdate(report.report_id, status),
              });
            });
          }

          if (
            permissions.includes("internal_action:delete") &&
            currentStatus === "RESOLVED"
          ) {
            actions.push({ separator: true });
            actions.push({
              label: "Delete Report",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDeleteReport(report),
            });
          }

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
        size: 150,
      },
    ],
    [permissions ,statusFilter],
  );

  const table = useReactTable({
    data: reports,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (q) => {
    setSearchQuery(q);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        <div className="mb-3 flex w-full items-center justify-between gap-6">
          <Breadcrumbs items={[{ name: "Bug Reports" }]} />
          <div className="flex flex-1 gap-2">
            {/* <SearchBar
              placeholder="Search bug reports..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
            /> */}
          </div>

          <div className="flex gap-2">
            {["OPEN", "IN_PROGRESS", "RESOLVED"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className={`px-4 py-2 rounded-md text-sm border border-border transition-all
                  ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {reports.length !== 0 || isLoading ? (
          <Table table={table} isLoading={isLoading} totalCount={totalCount} />
        ) : isError && !isServerError ? (
          <DataFechError content={error?.response?.data?.message || "Error"} />
        ) : (
          <NoDataFound content="No bug reports found." />
        )}
      </div>

      {/* DETAILS MODAL */}
      {isModalOpen && (
        <BugReportDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
          statusFilter={statusFilter}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={onCancel}
        handleDelete={onDelete}
        value={truncateText(deleteValue?.subject)}
        isLoading={deleteMutation.isPending}
        requireConfirmation={false}
        title="Delete Bug Report"
        description="This action cannot be undone and will permanently delete this bug report."
      />
    </>
  );
};

export default BugReports;