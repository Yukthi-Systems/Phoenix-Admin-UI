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
import { userInfoAtom } from "@/store/userInfo";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useGetEmailClientSessions,
  useSwitchEmailClientSession,
  useDeleteEmailClientSession,
} from "@/hooks/useClientSession";
import { MonitorSmartphone, MapPin, Trash2, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToastify } from "@/hooks/useToastify";
import { PER_PAGE } from "@/constants/constants";

import DomainSelector from "@/components/shared/DomainSelector";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import NoDataFound from "@/components/common/NoDataFound";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import EditModelBox from "@/components/common/EditModelBox";
import StatusBadge from "@/components/common/StatusBadge";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import SessionTimer from "./sessionTimer";
import SessionDetailsModal from "./SessionModal";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListEmailClientSessions = () => {
  const [domainName, setDomainName] = useState(null);
  const { pagination, onPaginationChange: setPagination } =
     useTablePagination();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const queryClient = useQueryClient();

  const { mutate: deleteSession, isPending: isDeleting } =
    useDeleteEmailClientSession();
  const { mutate: switchSession, isPending: isSwitching } =
    useSwitchEmailClientSession();

  const { data, isLoading, isError, error } = useGetEmailClientSessions(
    domainName,
    pagination.pageIndex + 1,
    pagination.pageSize,
  );

  useEffect(() => {
    if (pagination.pageIndex > 0) {
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  }, [domainName]);

  const sessions = data?.email_sessions?.data ?? [];
  const totalPages = data?.email_sessions?.total_pages ?? 1;
  const totalCount = data?.email_sessions?.total_count ?? 0;

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "attempted_by",
        header: "Email",
        cell: ({ getValue, row }) => (
          <button
            onClick={() => handleViewDetails(row.original)}
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
        accessorKey: "origin_ip",
        header: "Origin IP",
        cell: ({ getValue }) => (
          <span className="text-foreground font-mono text-sm">
            {getValue()}
          </span>
        ),
        meta: {
          align: "left",
        },
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => {
          const location = row.original.geo_ip_location;
          return (
            <div className="flex items-center justify-start gap-2">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-foreground text-sm">
                {location?.country || "Unknown"} ({location.iso_code})
              </span>
            </div>
          );
        },
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
        id: "expires_in",
        header: "Expires In",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              <SessionTimer
                attemptedAt={row.original.attempted_at}
                expiresAt={row.original.session_expires_at}
              />
            </div>
          );
        },
      },
    ];

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
              onClick: () => handleActive(row.original),
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
  }, [permissions]);

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleActive = (session) => {
    setSelectedSession(session);
    setShowActiveModal(true);
  };

  const handleDelete = (session) => {
    setSelectedSession(session);
    setDeleteValue(`${session.attempted_by} - ${session.origin_ip}`);
    setShowDeleteModal(true);
  };

  const OnSwitch = () => {
    if (!selectedSession) return;

    switchSession(
      {
        domain_name: domainName,
        attempted_by: selectedSession.attempted_by,
        origin_ip: selectedSession.origin_ip,
        isactive: true,
        value: !selectedSession.is_active,
      },
      {
        onSuccess: () => {
          toast(
            "success",
            `Session ${selectedSession.is_active ? "deactivated" : "activated"} successfully`,
          );
          queryClient.invalidateQueries(["email_client_sessions", domainName]);
          setShowActiveModal(false);
          setSelectedSession(null);
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

  const OnDelete = () => {
    if (!selectedSession) return;

    deleteSession(
      {
        domain_name: domainName,
        attempted_by: selectedSession.attempted_by,
        origin_ip: selectedSession.origin_ip,
      },
      {
        onSuccess: () => {
          toast("success", "Successfully deleted session");
          queryClient.invalidateQueries(["email_client_sessions", domainName]);
          setShowDeleteModal(false);
          setDeleteValue("");
          setSelectedSession(null);
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

  const OnCancel = () => {
    setShowDeleteModal(false);
    setDeleteValue("");
    setSelectedSession(null);
  };

  const OnActiveCancel = () => {
    setShowActiveModal(false);
    setSelectedSession(null);
  };

  const OnDetailsClose = () => {
    setShowDetailsModal(false);
    setSelectedSession(null);
  };

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
      <AccessDenied content="You don't have access to view mailbox sessions." />
    );
  }

  if (isError) {
    const statusCode = error?.response?.status;
    if (!statusCode || statusCode >= 500) {
      return (
        <DataFechError content="Error loading mailbox sessions...!" />
      );
    }
  }

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-2.5 w-full">
          <div className="mb-2.5 flex w-full  items-start justify-between gap-4 xl:flex-nowrap xl:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <Breadcrumbs
                items={[
                  { name: "Settings" },
                  { name: "Mailbox Sessions" },
                ]}
              />
            </div>

            <div className="order-2 flex items-center gap-2 xl:order-3 xl:gap-3">
              <div className=" w-full  xl:w-auto xl:min-w-72">
                <DomainSelector
                  domainName={domainName}
                  setDomainName={setDomainName}
                />
              </div>
              {domainName && (
                <div className="bg-card border-border flex items-center gap-4 rounded-lg border px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Active
                    </span>
                    <span className="text-success text-sm font-bold">
                      {sessions.filter((s) => s.is_active).length}
                    </span>
                  </div>
                  <div className="bg-border h-8 w-px"></div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Inactive
                    </span>
                    <span className="text-destructive text-sm font-bold">
                      {sessions.filter((s) => !s.is_active).length}
                    </span>
                  </div>
                </div>
              )}
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
                  error?.response?.data?.message ||
                  "No mailbox sessions found"
                }
              />
            )}
          </>
        ) : (
          <NoDataFound content="Please select a domain first" />
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={OnCancel}
        handleDelete={OnDelete}
        value={deleteValue}
        isLoading={isDeleting}
        requireConfirmation={false}
        title="Delete Mailbox Session"
        description="Are you sure you want to delete this mailbox session? This action cannot be undone."
      />

      {/* Active/Inactive Modal */}
      {showActiveModal && (
        <EditModelBox
          isOpen={showActiveModal}
          label={`${selectedSession?.is_active ? "Deactivate" : "Activate"} Session`}
          handleCancel={OnActiveCancel}
        >
          <div className="w-xl">
            <p className="mb-3 text-lg font-medium">Are you sure?</p>
            <p className="mb-3 text-base">
              You want to{" "}
              {selectedSession?.is_active ? "deactivate" : "activate"} the
              session for{" "}
              <span className="text-primary font-medium">
                {selectedSession?.attempted_by}
              </span>{" "}
              from IP{" "}
              <span className="text-primary font-mono">
                {selectedSession?.origin_ip}
              </span>
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                className="hover:bg-accent border-border text-foreground rounded border px-4 py-2 transition-colors"
                disabled={isSwitching}
                onClick={OnActiveCancel}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 transition-colors"
                disabled={isSwitching}
                onClick={OnSwitch}
              >
                {isSwitching ? "Loading..." : "Confirm"}
              </button>
            </div>
          </div>
        </EditModelBox>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        isOpen={showDetailsModal}
        handleClose={OnDetailsClose}
        session={selectedSession}
      />
    </>
  );
};

export default ListEmailClientSessions;
