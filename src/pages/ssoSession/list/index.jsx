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
import { Trash2, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import DomainSelector from "@/components/shared/DomainSelector";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import BulkDeleteModal from "@/components/common/BulkDeleteModal";
import EditModelBox from "@/components/common/EditModelBox";
import StatusBadge from "@/components/common/StatusBadge";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import MultiDelete from "@/components/shared/MultiDelete";

import {
  useGetSSOSessions,
  useDeleteSSOSession,
  useUpdateSSOSessionStatus,
} from "@/hooks/useUser";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useToastify } from "@/hooks/useToastify";
import SsoSessionDetailsModal from "./SessionModal";
import { useTablePagination } from "@/hooks/useTablePagination";

const SsoSession = () => {
  const [domainName, setDomainName] = useState(null);
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const queryClient = useQueryClient();
  const { mutate: deleteSession, isPending } = useDeleteSSOSession();
  const { mutate: updateStatus, isPending: isStatusPending } =
    useUpdateSSOSessionStatus();

  const { data, isLoading, isError, error } = useGetSSOSessions(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  }, [domainName]);

  const sessions = data?.sso_sessions?.data ?? [];
  const totalPages = data?.sso_sessions?.total_pages ?? 1;
  const totalCount = data?.sso_sessions?.total_count ?? 0;

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
            toast("success", "Successfully deleted SSO session");
            queryClient.invalidateQueries(["sso_session"]);
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
    queryClient.invalidateQueries(["sso_session"]);
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

  const handleStatusToggle = (session) => {
    setStatusTarget({
      sessionId: session.session_id,
      email: session.email,
      ipAddress: session.device_details?.ip,
      nextActive: !session.is_active,
    });
    setShowStatusModal(true);
  };

  const handleStatusCancel = () => {
    setShowStatusModal(false);
    setStatusTarget(null);
  };

  const OnStatusChange = () => {
    if (!statusTarget || !domainName) return;
    updateStatus(
      {
        domain: domainName,
        sessionId: statusTarget.sessionId,
        isActive: statusTarget.nextActive,
      },
      {
        onSuccess: () => {
          toast(
            "success",
            `Session ${statusTarget.nextActive ? "activated" : "deactivated"} successfully`,
          );
          setShowStatusModal(false);
          setStatusTarget(null);
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
        id: "is_active",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
      },
      {
        id: "device",
        header: "Device / Browser",
        cell: ({ row }) => {
          const device = row.original.device_details;
          if (!device)
            return <span className="text-muted-foreground text-sm">N/A</span>;

          const browser = device.browserName || device.browser || "Unknown Browser";
          const os = device.osName || device.os || "Unknown OS";

          return (
            <div className="flex items-start justify-start gap-2">
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  {browser}
                </span>
                <span className="text-muted-foreground text-xs">
                  {os} {device.deviceType ? `• ${device.deviceType}` : ""}
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
        id: "ip_address",
        header: "IP Address",
        cell: ({ row }) => {
          const ipAddress = row.original.device_details.ip;
          if (!ipAddress)
            return <span className="text-muted-foreground text-sm">N/A</span>;

          return (
            <div className="flex justify-start">
              <span className="text-foreground text-sm font-mono">
                {ipAddress}
              </span>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        id: "created_at",
        header: "Created At",
        cell: ({ row }) => {
          const createdAt = row.original.created_at;
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
      {
        id: "last_auth_at",
        header: "Last Authenticated At",
        cell: ({ row }) => {
          const lastAuth = row.original.last_auth_at;
          if (!lastAuth)
            return <span className="text-muted-foreground text-sm">N/A</span>;

          return (
            <div className="flex items-center justify-center">
              <span className="text-foreground text-sm">
                {new Date(lastAuth).toLocaleString("en-US", {
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

    // Add actions column if the user can edit or delete sessions
    if (
      permissions.includes("session:edit") ||
      permissions.includes("session:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("session:edit")) {
            actions.push({
              label: row.original.is_active
                ? "Deactivate Session"
                : "Activate Session",
              icon: CheckCircle,
              variant: "default",
              onClick: () => handleStatusToggle(row.original),
              tooltip: row.original.is_active
                ? "Deactivate this session"
                : "Activate this session",
            });
          }

          if (permissions.includes("session:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Session",
              icon: Trash2,
              variant: "danger",
              onClick: () => handleDelete(row.original),
              tooltip: "Delete session",
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
      <AccessDenied content="You don't have access to view SSO sessions." />
    );
  }

  if (isError) {
    const statusCode = error?.response?.status;
    if (!statusCode || statusCode >= 500) {
      return <DataFechError content="Error loading SSO sessions...!" />;
    }
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-2.5 w-full">
        <div className="mb-2.5 flex w-full justify-between gap-4 flex-nowrap items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Breadcrumbs
              items={[{ name: "Settings" }, { name: "SSO Sessions" }]}
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
                error?.response?.data?.message || "No SSO sessions found"
              }
            />
          )}
        </>
      ) : (
        <NoDataFound content="Please select a domain first" />
      )}

      {/* Session Details Modal */}
      <SsoSessionDetailsModal
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
        title="Bulk Delete SSO Sessions"
        description="Are you sure you want to delete the selected SSO sessions?"
        itemName="session"
      />

      {/* Active/Inactive Modal */}
      {showStatusModal && (
        <EditModelBox
          isOpen={showStatusModal}
          label={`${statusTarget?.nextActive ? "Activate" : "Deactivate"} Session`}
          handleCancel={handleStatusCancel}
        >
          <div className="w-xl text-left">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want to{" "}
              {statusTarget?.nextActive ? "activate" : "deactivate"} the
              session for{" "}
              <span className="text-primary font-medium">
                {statusTarget?.email}
              </span>
              {statusTarget?.ipAddress && (
                <>
                  {" "}
                  from IP{" "}
                  <span className="text-primary font-mono">
                    {statusTarget.ipAddress}
                  </span>
                </>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                className="hover:bg-accent border-border text-foreground rounded border px-4 py-2 transition-colors"
                disabled={isStatusPending}
                onClick={handleStatusCancel}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 transition-colors"
                disabled={isStatusPending}
                onClick={OnStatusChange}
              >
                {isStatusPending ? "Loading..." : "Confirm"}
              </button>
            </div>
          </div>
        </EditModelBox>
      )}
    </div>
  );
};

export default SsoSession;
