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
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { PER_PAGE } from "@/constants/constants";
import { useQueryClient } from "@tanstack/react-query";

import DomainSelector from "@/components/shared/DomainSelector";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import StatusBadge from "@/components/common/StatusBadge";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import MultiDelete from "@/components/shared/MultiDelete";
import { useGetUserAppSession, useDeleteUserAppSession } from "@/hooks/useUser";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useToastify } from "@/hooks/useToastify";
import AppSessionDetailsModal from "./SessionModal";
import { useTablePagination } from "@/hooks/useTablePagination";

const AppSession = () => {
  const [domainName, setDomainName] = useState(null);
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { mutate: deleteSession, isPending } = useDeleteUserAppSession();

  const { data, isLoading, isError, error } = useGetUserAppSession(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  }, [domainName]);

  const sessions = data?.app_sessions.data ?? [];
  const totalPages = data?.app_sessions.total_pages ?? 1;
  const totalCount = data?.app_sessions.total_count ?? 0;

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
  } = useBulkSelection(sessions, "session_id", "email");

  const handleRowClick = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleDelete = (session) => {
    setDeleteValue(session.email);
    setDeleteId(session.session_id);
    setShowDeleteModal(true);
  };

  const OnDelete = () => {
    if (deleteId && domainName) {
      deleteSession(
        { domain: domainName, sessionId: deleteId },
        {
          onSuccess: () => {
            toast("success", "Successfully deleted Mail25 app session");
            queryClient.invalidateQueries(["app_session"]);
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
    }
  };

  const handleBulkDelete = async (sessionId, email) => {
    return new Promise((resolve, reject) => {
      deleteSession(
        { domain: domainName, sessionId },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      );
    });
  };

  const handleBulkDeleteComplete = (results) => {
    queryClient.invalidateQueries(["app_session"]);
    if (results.successful.length > 0) {
      removeFromSelection(results.successful);
    }
    if (results.failed.length === 0) {
      toast(
        "success",
        `Successfully deleted ${results.successful.length} session${results.successful.length !== 1 ? "s" : ""}`,
      );
    } else if (results.successful.length === 0) {
      toast("error", "Failed to delete all selected sessions");
    } else {
      toast(
        "warning",
        `Deleted ${results.successful.length} session${results.successful.length !== 1 ? "s" : ""}. ${results.failed.length} failed.`,
      );
    }
  };

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const columns = useMemo(() => {
    const baseColumns = [];

    // Add checkbox column if delete permission exists
    if (permissions.includes("session:delete")) {
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
              checked={isItemSelected(row.original.session_id)}
              onChange={() => toggleItem(row.original.session_id)}
              className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
            />
          </div>
        ),
        size: 50,
      });
    }

    baseColumns.push(
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue, row }) => (
          <button
            onClick={() => handleRowClick(row.original)}
            className="main-col"
          >
            {getValue()}
          </button>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => {
          const phone = getValue();
          return (
            <span className="text-foreground font-mono text-sm">
              {phone || "N/A"}
            </span>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        id: "device",
        header: "Device",
        cell: ({ row }) => {
          const device = row.original.device_details;
          if (!device)
            return <span className="text-muted-foreground text-sm">N/A</span>;

          return (
            <div className="flex items-start justify-start gap-2">
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  {device.brand} {device.model}
                </span>
                <span className="text-muted-foreground text-xs">
                  {device.manufacturer} • Android {device.systemVersion}
                </span>
              </div>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "session_id",
        header: "Session ID",
        cell: ({ getValue }) => {
          return (
            <span className="text-foreground text-sm font-mono">
              {getValue()}
            </span>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        id: "last_active_at",
        header: "Last Active At",
        cell: ({ row }) => {
          const createdAt = row.original.last_active_at;
          if (!createdAt)
            return <span className="text-muted-foreground text-sm">N/A</span>;

          return (
            <div className="flex items-center justify-center">
              <span className="text-foreground text-sm">
                {new Date(createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        },
      },
    );

    // Add delete action column if permission exists
    if (permissions.includes("session:delete")) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDelete(row.original)}
              className="text-destructive hover:text-destructive/80 p-2 transition-colors"
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
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

  const table = useReactTable({
    data: sessions,
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

  if (!permissions.includes("session:view")) {
    return (
      <AccessDenied content="You don't have access to view Mail25 app sessions." />
    );
  }

  if (isError) {
    const statusCode = error?.response?.status;
    if (!statusCode || statusCode >= 500) {
      return <DataFechError content="Error loading Mail25 app sessions...!" />;
    }
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-2.5 w-full">
        <div className="mb-2.5 flex w-full justify-between gap-4 flex-nowrap items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Breadcrumbs
              items={[{ name: "Settings" }, { name: "Mail25 App Sessions" }]}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk delete */}
            {selectedCount > 0 && (
              <MultiDelete
                permission="session:delete"
                selectedCount={selectedCount}
                handleClear={clearSelection}
                handleClick={() => setShowBulkDeleteModal(true)}
              />
            )}

            <div className="w-auto min-w-72">
              <DomainSelector
                domainName={domainName}
                setDomainName={setDomainName}
              />
            </div>
          </div>
        </div>
      </div>

      {domainName ? (
        <>
          {sessions.length !== 0 || isLoading ? (
            <Table
              table={table}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          ) : (
            <NoDataFound
              content={
                error?.response?.data?.message || "No Mail25 app sessions found"
              }
            />
          )}
        </>
      ) : (
        <NoDataFound content="Please select a domain first" />
      )}

      {/* Session Details Modal */}
      <AppSessionDetailsModal
        isOpen={isModalOpen}
        handleClose={handleCloseModal}
        session={selectedSession}
      />

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue || ""}
        isLoading={isPending}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        items={selectedItemsWithLabels}
        onDelete={handleBulkDelete}
        onClose={() => setShowBulkDeleteModal(false)}
        onComplete={handleBulkDeleteComplete}
        title="Bulk Delete Mail25 App Sessions"
        description="Are you sure you want to delete the selected Mail25 app sessions?"
        itemName="session"
      />
    </div>
  );
};

export default AppSession;