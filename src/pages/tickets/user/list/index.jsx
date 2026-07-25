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

import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, RefreshCcw } from "lucide-react";

// Stores & Hooks
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { PER_PAGE } from "@/constants/constants";
import { useGetSupportTickets } from "@/hooks/useSupportTickets";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useDebounce } from "@/hooks/useDebounce";

// Components
import Table from "@/components/shared/Table";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import SearchBar from "@/components/shared/SearchBar";
import NoDataFound from "@/components/common/NoDataFound";
import DataFechError from "@/components/common/DataFechError";
import { AddButton } from "@/components/common/Buttons";
import CreateTicketModal from "./CreateTicketModal";
import StatusBadge from "../../StatusBadge";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListUserTickets = () => {
  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { pagination, onPaginationChange: setPagination } =
     useTablePagination();
  const [searchParams, setSearchParams] = useSearchParams();
  // Hooks
  const userProfile = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const { formatUserDateNice } = useUserTimezone();

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  const breadcrumbItems = [
    { name: "Support", link: "/support/tickets" },
    { name: "My Tickets", isActive: true },
  ];

  // Data Fetching
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetSupportTickets(
      organization_id || userProfile?.organization_id,
      pagination.pageIndex + 1,
      pagination.pageSize,
      debouncedSearch,
    );

  const tickets = data?.data?.data || [];
  const totalCount = data?.data?.total_count || 0;
  const totalPages =
    data?.data?.total_pages || Math.ceil(totalCount / pagination.pageSize) || 1;

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (searchParams.get("modal") === "open") {
      setIsCreateModalOpen(true);

      const newParams = new URLSearchParams(searchParams);
      newParams.delete("modal");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleTicketCreated = () => {
    refetch();
  };

  // Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "ticket_id",
        header: "Ticket ID",
        cell: ({ getValue }) => (
          <Link
            to={`/support/tickets/${getValue()}`}
            className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
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
          <Link
            to={`/support/tickets/${row.original.ticket_id}`}
            className="flex flex-col max-w-[500px]"
          >
            <span className=" main-col font-medium text-foreground">
              {getValue()}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {row.original?.details?.category}
              {row.original?.details?.sub_category &&
                ` • ${row.original?.details?.sub_category}`}
            </span>
          </Link>
        ),
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
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
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
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        meta: { align: "center" },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: { align: "left" },
      },
    ],
    [formatUserDateNice],
  );

  // Table Instance
  const table = useReactTable({
    data: tickets,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isServerError =
    !error?.response?.status || error?.response?.status >= 500;

  // Handle Error State strictly
  if (isError && isServerError) {
    return (
      <DataFechError content="Error loading support tickets. Please try again later." />
    );
  }

  // NOTE: The Early Return for <DataLoading /> was removed here.
  // The loading state is now handled inside the return block by passing
  // isLoading to the Table component.

  return (
    <>
      <div className="flex h-full w-full flex-col px-2">
        {/* Header */}
        <div className="mb-4 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center ">
            {/* Search */}
            <div className="w-full sm:max-w-xs">
              <SearchBar
                placeholder="Search tickets..."
                onSearch={handleSearch}
                onClear={handleClearSearch}
                value={searchQuery}
                onRefresh={refetch}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddButton
              label="Create Ticket"
              handleClick={() => setIsCreateModalOpen(true)}
              icon={<Plus size={16} />}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {/*
              Logic Update:
              If tickets exist OR we are loading, we show the Table.
              The Table component handles the loading overlay/skeleton internally.
              This keeps the search bar and header visible during data fetching.
          */}
          {tickets.length > 0 || isLoading ? (
            <Table
              table={table}
              isLoading={isLoading || isRefetching}
              totalCount={totalCount}
            />
          ) : (
            <div className="h-full flex flex-col">
              {searchQuery ? (
                <NoDataFound content="No tickets found matching your search." />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-card/50 m-1">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Plus size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No tickets yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm">
                    You haven't created any support tickets yet. Create one to
                    get started.
                  </p>
                  <AddButton
                    label="Create Your First Ticket"
                    handleClick={() => setIsCreateModalOpen(true)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTicketCreated}
        />
      )}
    </>
  );
};

export default ListUserTickets;
