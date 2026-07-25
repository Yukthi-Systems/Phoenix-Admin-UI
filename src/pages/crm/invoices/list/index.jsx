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

import { PER_PAGE } from "@/constants/constants";
import { useGetAllInvoices, useGetGlobalInvoices } from "@/hooks/useInvoice";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Table from "@/components/shared/Table";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { AddButton } from "@/components/common/Buttons";
import NoDataFound from "@/components/common/NoDataFound";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import {
  FileText,
  Calendar,
  Plus,
  RefreshCw,
  Copy,
  Edit,
  Globe,
  Building2,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/useTimezone";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import SearchBar from "@/components/shared/SearchBar";
import StatusBadge from "@/components/common/StatusBadge";
import { useUrlParam } from "@/hooks/useUrlParam";
import TabToggle from "@/components/common/TabToggle";
import { useTablePagination } from "@/hooks/useTablePagination";

const ListInvoice = () => {
  const userInfo = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();

  const { pagination, onPaginationChange: setPagination } =
     useTablePagination();
  // false = Organization View, true = Global View
  const [isGlobal, setIsGlobal] = useState(false);

  const [searchQuery, setSearchQuery] = useUrlParam("search", "");

  // 1. Organization Invoice Query (enabled when isGlobal is false)
  const orgInvoicesQuery = useGetAllInvoices({
    organization_id: userInfo.organization_id,
    page: pagination.pageIndex + 1,
    page_Size: pagination.pageSize,
    query: searchQuery,
    enabled: !isGlobal,
  });

  // 2. Global Invoice Query (enabled when isGlobal is true)
  const globalInvoicesQuery = useGetGlobalInvoices({
    page: pagination.pageIndex + 1,
    page_Size: pagination.pageSize,
    query: searchQuery,
    enabled: isGlobal,
  });

  // Determine active data source
  const activeQuery = isGlobal ? globalInvoicesQuery : orgInvoicesQuery;
  const { data, isLoading, isError, refetch } = activeQuery;

  const handleSearch = (query) => {
    if (query) {
      setSearchQuery(query);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const invoices = data?.data?.invoices ?? [];
  const totalPages = data?.data?.total_pages ?? 1;
  const totalCount = data?.data?.total_count ?? 0;

  const { formatUserDateNice, formatUserDateOnly } = useUserTimezone();

  const getDueStatus = (dueDate, isPaid) => {
    if (isPaid) return { label: "Paid", variant: "success" };

    const now = new Date();
    const due = new Date(dueDate);
    const daysDiff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return {
        label: `Overdue by ${Math.abs(daysDiff)} days`,
        variant: "destructive",
      };
    } else if (daysDiff === 0) {
      return { label: "Due Today", variant: "warning" };
    } else if (daysDiff <= 7) {
      return { label: `Due in ${daysDiff} days`, variant: "warning" };
    } else {
      return { label: `Due in ${daysDiff} days`, variant: "secondary" };
    }
  };

  const getPaymentStatus = (isPaid) => {
    if (isPaid) {
      return { label: "Paid", variant: "paid" };
    } else {
      return { label: "Unpaid", variant: "unpaid" };
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "invoice_id",
        header: "Invoice ID",
        cell: ({ row }) => (
          <div className="main-col flex items-center justify-start gap-2">
            <div className="bg-primary/10 rounded-md p-1.5">
              <FileText className="text-primary h-3 w-3" />
            </div>
            <Link
              to={`/crm/invoice/view?invoice_id=${row.original.invoice_id}`}
              className="main-col text-foreground font-medium hover:underline"
            >
              {row.getValue("invoice_id")}
            </Link>
          </div>
        ),
        meta: {
          align: "left",
        },
      },

      {
        accessorKey: "invoice_date",
        header: "Invoice Date",
        cell: ({ row }) => (
          <div className="flex items-center justify-start gap-2">
            <Calendar className="text-muted-foreground h-3 w-3" />
            <span className="text-foreground text-sm">
              {formatUserDateOnly(row.getValue("invoice_date"))}
            </span>
          </div>
        ),
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
          const dueDate = row.getValue("due_date");
          const isPaid = row.original.is_paid;

          return (
            <div className="flex flex-col justify-start gap-1">
              <div className="flex items-center justify-start gap-2">
                <Calendar className="text-muted-foreground h-3 w-3" />
                <span className="text-foreground text-sm">
                  {formatUserDateNice(dueDate)}
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
        accessorKey: "is_paid",
        header: "Status",
        cell: ({ row }) => {
          const dueDate = row.getValue("due_date");
          const isPaid = row.original.is_paid;
          const dueStatus = getDueStatus(dueDate, isPaid);
          const paymentStatus = getPaymentStatus(isPaid);

          return (
            <div className="flex gap-2 justify-center">
              <StatusBadge
                status={paymentStatus.variant}
                label={paymentStatus.label}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatUserDateNice(row.getValue("created_at"))}
          </span>
        ),
        meta: {
          align: "left",
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const actions = [];

          if (permissions.includes("crm:invoice:edit")) {
            actions.push({
              label: "Edit Invoice",
              icon: Edit,
              variant: "default",
              onClick: () =>
                navigate(
                  `/crm/invoice/edit?invoice_id=${row.original.invoice_id}`,
                ),
              tooltip: "Edit Invoice",
            });
          }

          actions.push({
            label: "Revise Invoice",
            icon: RefreshCw,
            variant: "default",
            onClick: () =>
              navigate(
                `/crm/invoice/revise?invoice_id=${row.original.invoice_id}`,
              ),
            tooltip: "Revise Invoice",
          });

          actions.push({
            label: "Copy Invoice",
            icon: Copy,
            variant: "default",
            onClick: () =>
              navigate(
                `/crm/invoice/create-copy?invoice_id=${row.original.invoice_id}`,
              ),
            tooltip: "Copy Invoice",
          });

          return (
            <div className="flex justify-center">
              <TableActionsDropdown actions={actions} />
            </div>
          );
        },
      },
    ],
    [navigate, isGlobal, permissions],
  );

  const table = useReactTable({
    data: invoices,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  if (!permissions?.includes("crm:invoice:view")) {
    return <AccessDenied />;
  }

  if (isError) {
    return <DataFechError />;
  }

  return (
    <div className="px-2 w-full h-full">
      <div className="mx-auto w-full space-y-3">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs
            items={[
              { name: "CRM" },
              { name: "Invoices", link: "/crm/invoice" },
            ]}
          />

          <SearchBar
            placeholder={
              isGlobal ? "Search all invoices..." : "Search org. invoices..."
            }
            onSearch={handleSearch}
            onClear={handleClearSearch}
            showSearchButton={false}
            className="w-full sm:w-80"
            onRefresh={refetch}
          />

          <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
            {/* View Toggle Buttons */}
            <TabToggle
              value={isGlobal}
              onChange={(val) => {
                setIsGlobal(val);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              options={[
                { label: "Organization", value: false, icon: Building2 },
                { label: "Global", value: true, icon: Globe },
              ]}
            />

            {permissions?.includes("crm:invoice:create") && (
              <AddButton
                handleClick={() => navigate("/crm/invoice/create")}
                icon={Plus}
                size="lg"
                label="Create Invoice"
                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r"
              />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          {!isLoading && invoices.length === 0 ? (
            <NoDataFound
              title={
                isGlobal ? "No Global Invoices Found" : "No Invoices Found"
              }
              description={
                isGlobal
                  ? "No invoices found across any organization."
                  : "You haven't created any invoices yet. Click the button above to create your first invoice."
              }
              icon={FileText}
              actionButton={
                permissions?.invoice?.create &&
                !isGlobal && (
                  <AddButton
                    onClick={() => navigate("/invoices/create")}
                    icon={Plus}
                    size="lg"
                  >
                    Create First Invoice
                  </AddButton>
                )
              }
            />
          ) : (
            <Table
              table={table}
              isLoading={isLoading}
              totalCount={totalCount}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListInvoice;
