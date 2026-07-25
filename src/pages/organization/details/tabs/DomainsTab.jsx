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

import { useState, useMemo } from "react";
import { useGetDomains } from "@/hooks/useDomain";
import Table from "@/components/shared/Table";
import DataFechError from "@/components/common/DataFechError";
import DataLoading from "@/components/common/DataLoading";
import StatusBadge from "@/components/common/StatusBadge";
import { Link } from "react-router-dom";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useUserTimezone } from "@/hooks/useTimezone";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const DomainsTab = ({ orgId }) => {
  const { pagination, onPaginationChange: setPagination } = useTablePagination(5, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const { formatUserDateNice } = useUserTimezone();

  const { data, isLoading, isError } = useGetDomains(
    orgId,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery
  );

  const domains = data?.domains?.domains ?? [];
  const totalPages = data?.domains?.total_pages ?? 1;
  const totalCount = data?.domains?.total_count ?? 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: "domain_name",
        header: "Domain",
        cell: ({ getValue }) => (
          <Link
            className="main-col font-medium hover:underline text-primary"
            to={`/domain/${encodeURIComponent(getValue())}`}
          >
            {getValue()}
          </Link>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: "storage",
        header: "Storage",
        cell: ({ row }) => {
          const { quota_utilized = 0, quota_allocated = 0 } = row.original;
          return (
            <div className="flex flex-col gap-1 w-full max-w-[150px]">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{quota_utilized} / {quota_allocated} GB</span>
              </div>
              <div className="bg-muted h-1.5 w-full rounded-full overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${quota_allocated > 0
                      ? Math.min((quota_utilized / quota_allocated) * 100, 100)
                      : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
      },
    ],
    [formatUserDateNice]
  );

  const table = useReactTable({
    data,
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

  if (isLoading) return <DataLoading content="Loading domains..." />;
  if (isError) return <DataFechError content="Failed to load domains." />;
  if (domains.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg border-border bg-card/30">
        <span className="text-muted-foreground text-sm">No domains found</span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <Table table={table} totalCount={totalCount} pagination={pagination} />
    </div>
  );
};

export default DomainsTab;
