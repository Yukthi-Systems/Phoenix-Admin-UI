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

import { useState, useMemo, useEffect } from "react";
import { useGetDomains } from "@/hooks/useDomain";
import { useGetMailboxes } from "@/hooks/useMailbox";
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

const IdentitiesTab = ({ orgId }) => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const { pagination, onPaginationChange: setPagination } = useTablePagination(5, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const { formatUserDateNice } = useUserTimezone();

  // 1. Fetch domains for selector
  const { data: domainsData, isLoading: domainsLoading } = useGetDomains(
    orgId,
    1,
    100,
    ""
  );

  const domains = domainsData?.domains?.domains || [];

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].domain_name);
    }
  }, [domains, selectedDomain]);

  // 2. Fetch mailboxes for selected domain
  const { data: mailboxesData, isLoading: mailboxesLoading, isError: mailboxesError } = useGetMailboxes(
    selectedDomain,
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery
  );

  const mailboxes = mailboxesData?.mailboxes ?? [];
  const totalPages = mailboxesData?.total_pages ?? 1;
  const totalCount = mailboxesData?.total_rows ?? 0;

  function bytesToGB(bytes = 0) {
    return (bytes / 1024 ** 3).toFixed(2);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <Link
            className="main-col font-medium hover:underline text-primary"
            to={`/mailbox/${encodeURIComponent(getValue())}`}
          >
            {getValue()}
          </Link>
        ),
      },
      {
        id: "storage",
        header: "Storage",
        cell: ({ row }) => {
          const { quota_utilized_bytes = 0, quota_allocated = 0 } = row.original;
          const utilizedGb = Number(bytesToGB(quota_utilized_bytes));
          return (
            <div className="flex flex-col gap-1 w-full max-w-[150px]">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{utilizedGb} / {quota_allocated} GB</span>
              </div>
              <div className="bg-muted h-1.5 w-full rounded-full overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${quota_allocated > 0
                      ? Math.min((utilizedGb / quota_allocated) * 100, 100)
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
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
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
    data: mailboxes,
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

  if (domainsLoading) return <DataLoading content="Loading domains..." />;

  if (domains.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg border-border bg-card/30">
        <span className="text-muted-foreground text-sm">Please create a domain before viewing identities.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Domain Selector Dropdown */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Select Domain:</label>
        <select
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground"
        >
          {domains.map((dom) => (
            <option key={dom.domain_name} value={dom.domain_name}>
              {dom.domain_name}
            </option>
          ))}
        </select>
      </div>

      {mailboxesLoading ? (
        <DataLoading content="Loading identities..." />
      ) : mailboxesError ? (
        <DataFechError content="Failed to load identities." />
      ) : mailboxes.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg border-border bg-card/30">
          <span className="text-muted-foreground text-sm">No identities found under this domain.</span>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table table={table} totalCount={totalCount} pagination={pagination} />
        </div>
      )}
    </div>
  );
};

export default IdentitiesTab;
