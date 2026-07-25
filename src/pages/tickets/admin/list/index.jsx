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

import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  UserPlus,
  ListChecks,
  Filter,
  AlertCircle,
  FileX,
  UserCheck,
} from "lucide-react";

import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { PER_PAGE } from "@/constants/constants";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetAdminSupportTickets,
  useUpdateSupportTicketStatus,
  useDeleteSupportTicket,
} from "@/hooks/useSupportTickets";
import { useGetUser } from "@/hooks/useUser";

import Table from "@/components/shared/Table";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import SearchBar from "@/components/shared/SearchBar";
import DeleteModelBox from "@/components/common/DeleteModelBox";
import AccessDenied from "@/components/common/AccessDenied";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import AssignTicketModal from "./AssignTicketModal";
import StatusBadge from "../../StatusBadge";
import FilterDropdown from "./FilterDropdown";
import { useTablePagination } from "@/hooks/useTablePagination";

const SingleUserDisplay = ({ userId, organizationId }) => {
  const { data, isLoading } = useGetUser(organizationId, userId);

  if (isLoading) {
    return <div className="h-5 w-24 bg-muted animate-pulse rounded" />;
  }

  return (
    <span className="text-sm text-foreground font-medium truncate">
      {data?.user_details?.user_name ||
        data?.user_details?.display_name ||
        userId}
    </span>
  );
};

const AssignedToCell = ({ userId = [], organizationId }) => {
  if (!userId || userId.length === 0) {
    return (
      <span className="text-muted-foreground italic text-sm">Unassigned</span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[100px] max-w-[250px]">
      {userId.map((id, index) => (
        <div key={id || index} className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
          <SingleUserDisplay userId={id} organizationId={organizationId} />
        </div>
      ))}
    </div>
  );
};

const ListAdminTickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteValue, setDeleteValue] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { pagination, onPaginationChange: setPagination } =
     useTablePagination();

  const [payload, setPayload] = useState({
    assigned_to: "",
    ticket_status: "",
    ticket_id: "",
  });

  const navigate = useNavigate();
  const { permissions = [], user_id: currentUserID } =
    useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const { formatUserDateNice } = useUserTimezone();

  const debouncedSearch = useDebounce(searchQuery, 500);

  const breadcrumbItems = [
    { name: "Support", link: "/support/admin/tickets" },
    { name: "All Tickets", isActive: true },
  ];

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetAdminSupportTickets(pagination.pageIndex + 1, pagination.pageSize, {
      ...payload,
      title_search: debouncedSearch,
      ticket_id: payload.ticket_id ? Number(payload.ticket_id) : undefined,
      organization_id: organization_id || "",
    });

  const { mutate: updateStatus } = useUpdateSupportTicketStatus();
  const { mutate: deleteTicket, isPending: isDeletingTicket } =
    useDeleteSupportTicket();
  const { mutate: assignTicket, isPending: isAssigning } =
    useUpdateSupportTicketStatus();

  const tickets = data?.data?.data || [];
  const totalCount = data?.data?.total_count || 0;
  const totalPages = data?.data?.total_pages || 1;

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    debouncedSearch,
    payload.assigned_to,
    payload.ticket_status,
    payload.ticket_id,
  ]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
    setPayload((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setPayload({
      assigned_to: "",
      ticket_id: "",
      ticket_status: "",
    });
    setSearchQuery("");
    setShowFilters(false);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      payload.assigned_to ||
      payload.ticket_status ||
      searchQuery ||
      payload.ticket_id
    );
  }, [payload, searchQuery]);

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ["OPEN", "IN-PROGRESS", "RESOLVED"];
    return allStatuses.filter((status) => status !== currentStatus);
  };

  const handleStatusChange = (ticketId, newStatus, assignTo) => {
    let fixedStatus = "";
    if (newStatus === "IN-PROGRESS") {
      fixedStatus = "IN_PROGRESS";
    } else {
      fixedStatus = newStatus;
    }
    updateStatus({
      organization_id,
      ticket_id: ticketId,
      payload: { ticket_status: fixedStatus, assigned_to: assignTo || [] },
    });
  };

  const handleDelete = ({ title, id }) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteValue(title);
  };

  const onCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId("");
    setDeleteValue("");
  };

  const onConfirmDelete = () => {
    if (deleteId) {
      deleteTicket(
        { organization_id, ticket_id: deleteId },
        {
          onSuccess: () => {
            setShowDeleteModal(false);
            setDeleteId("");
            setDeleteValue("");
          },
        },
      );
    }
  };

  const handleOpenAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTicket(null);
  };

  const handleAssignTicket = (userIds) => {
    if (selectedTicket && userIds && userIds.length > 0) {
      assignTicket(
        {
          organization_id,
          ticket_id: selectedTicket.ticket_id,
          payload: {
            assigned_to: userIds, // Now accepts array
            ticket_status: selectedTicket.ticket_status,
          },
        },
        {
          onSuccess: () => {
            handleCloseAssignModal();
            refetch();
          },
        },
      );
    }
  };

  const handleSelfAssign = (ticket) => {
    assignTicket(
      {
        organization_id,
        ticket_id: ticket.ticket_id,
        payload: {
          assigned_to: [currentUserID],
          ticket_status: ticket.ticket_status,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "ticket_id",
        header: "Ticket ID",
        cell: ({ getValue, row }) => (
          <Link
            to={`/support/admin/tickets/${row.original.ticket_id}`}
            className="text-primary hover:underline font-medium"
          >
            #{getValue()}
          </Link>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "ticket_title",
        header: "Subject",
        cell: ({ row, getValue }) => (
          <div className="space-y-1 max-w-[400px]">
            <Link
              to={`/support/admin/tickets/${row.original.ticket_id}`}
              className="text-foreground hover:text-primary font-medium block main-col"
            >
              {getValue()}
            </Link>
            <div className="text-xs text-muted-foreground">
              {row.original?.details?.category}
              {row.original?.details?.sub_category &&
                ` • ${row.original?.details?.sub_category}`}
            </div>
          </div>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "assigned_to",
        header: "Assigned To",
        cell: ({ getValue }) => {
          const assignedToId = getValue();
          return (
            <AssignedToCell
              userId={assignedToId || []}
              organizationId={organization_id}
            />
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "details.priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const priority = getValue();
          let colorClass =
            "text-muted-foreground bg-muted/50 border-transparent";
          if (priority === "High" || priority === "Critical")
            colorClass =
              "text-destructive bg-destructive/10 border-destructive/20";
          else if (priority === "Medium")
            colorClass = "text-warning bg-warning/10 border-warning/20";
          else if (priority === "Low")
            colorClass = "text-success bg-success/10 border-success/20";

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
            >
              {priority}
            </span>
          );
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "ticket_status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return <StatusBadge status={status} />;
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: { align: "left" },
      },
      {
        accessorKey: "updated_at",
        header: "Last Updated",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: { align: "left" },
      },
    ];

    if (
      permissions.includes("support_admin:view") ||
      permissions.includes("support_admin:edit") ||
      permissions.includes("support_admin:delete")
    ) {
      baseColumns.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];
          const currentStatus = row.original.ticket_status;
          const assignedTo = row.original.assigned_to || [];
          const availableStatuses = getStatusOptions(currentStatus);

          if (
            permissions.includes("support_admin:edit") &&
            availableStatuses.length > 0
          ) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }

            availableStatuses.forEach((status) => {
              let icon = Clock;
              if (status === "RESOLVED") {
                icon = CheckCircle;
              }

              actions.push({
                label: `Mark as ${status}`,
                icon: icon,
                variant: "default",
                onClick: () =>
                  handleStatusChange(
                    row.original.ticket_id,
                    status,
                    row.original.assigned_to,
                  ),
                tooltip: `Change status to ${status}`,
              });
            });
          }

          if (permissions.includes("support_admin:edit")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }

            if (assignedTo[0] !== currentUserID) {
              actions.push({
                label: "Assign to Me",
                icon: UserCheck,
                variant: "default",
                onClick: () => handleSelfAssign(row.original),
                tooltip: "Assign ticket to yourself",
              });
            }

            actions.push({
              label: "Assign Ticket",
              icon: UserPlus,
              variant: "default",
              onClick: () => handleOpenAssignModal(row.original),
              tooltip: "Assign to team member",
            });
          }

          if (permissions.includes("support_admin:delete")) {
            if (actions.length > 0) {
              actions.push({ separator: true });
            }
            actions.push({
              label: "Delete Ticket",
              icon: Trash2,
              variant: "danger",
              onClick: () =>
                handleDelete({
                  title: row.original.ticket_title,
                  id: row.original.ticket_id,
                }),
              tooltip: "Delete ticket",
            });
          }

          return (
            <div className="flex items-center justify-end">
              <TableActionsDropdown height={300} actions={actions} />
            </div>
          );
        },
        meta: { align: "right" },
      });
    }

    return baseColumns;
  }, [
    permissions,
    formatUserDateNice,
    navigate,
    handleStatusChange,
    handleDelete,
    currentUserID,
    organization_id,
  ]);

  const table = useReactTable({
    data: tickets,
    columns,
    pageCount: totalPages,
    state: { pagination },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!permissions.includes("support_admin:view")) {
    return (
      <AccessDenied
        message="You don't have permission to view support tickets"
        redirectTo="/dashboard"
      />
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full flex-col p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-destructive/10 p-3 rounded-full mb-4">
            <AlertCircle size={24} className="text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error loading tickets
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error?.message || "Unable to load tickets. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-6">
        <div className="mb-2.5 flex flex-col gap-4">
          <div className="">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Left side: Breadcrumb and Search */}
              <div className=" flex items-center gap-4">
                <Breadcrumbs items={breadcrumbItems} />
                <div className="max-w-md">
                  <SearchBar
                    placeholder="Search tickets by subject..."
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    value={searchQuery}
                    onRefresh={refetch}
                  />
                </div>
              </div>

              {/* Right side: Filters */}
              <div className="flex items-center gap-3 relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ListChecks className="h-4 w-4" />
                  <span>{totalCount} total</span>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                )}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    showFilters || hasActiveFilters
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-accent"
                  }`}
                >
                  <Filter size={16} />
                  <span className="text-sm">Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-primary-foreground text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {
                        [
                          payload.assigned_to,
                          payload.ticket_status,
                          payload.ticket_id,
                          searchQuery,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </button>

                <FilterDropdown
                  isOpen={showFilters}
                  onClose={() => setShowFilters(false)}
                  filters={payload}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearAllFilters}
                  organizationId={organization_id}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {tickets.length > 0 || isLoading ? (
            <div className="bg-card border border-border rounded-lg">
              <Table
                table={table}
                columns={columns}
                isLoading={isLoading || isRefetching}
                totalCount={totalCount}
                entityName="ticket"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <FileX size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tickets found
              </h3>
              <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                {searchQuery || hasActiveFilters
                  ? "No tickets match your current filters. Try adjusting your search or filters."
                  : "There are no support tickets in the system yet."}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <button
                  onClick={handleClearAllFilters}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteModelBox
        isOpen={showDeleteModal}
        handleCancel={onCancelDelete}
        handleDelete={onConfirmDelete}
        value={deleteValue}
        title="Delete Support Ticket"
        description={`Are you sure?. This action cannot be undone.`}
        isLoading={isDeletingTicket}
        requireConfirmation={true}
        confirmationText={deleteValue}
        confirmationPlaceholder={`Type "${deleteValue}" to confirm`}
        confirmationLabel="Please type the Ticket subject exactly to confirm deletion:"
      />

      {showAssignModal && selectedTicket && (
        <AssignTicketModal
          isOpen={showAssignModal}
          onClose={handleCloseAssignModal}
          ticket={selectedTicket}
          organizationId={organization_id}
          onAssign={handleAssignTicket}
          isPending={isAssigning}
        />
      )}
    </>
  );
};

export default ListAdminTickets;
