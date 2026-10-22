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
import { useAtomValue } from "jotai";
import {
  CalendarDays,
  FolderOpen,
  Mail,
  MessageSquare,
  Network,
} from "lucide-react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { userProfileAtom } from "@/store/userProfile";
import { useGlobalOrganizations } from "@/hooks/useOrganization";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useUrlParam } from "@/hooks/useUrlParam";
import { PER_PAGE } from "@/constants/constants";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import NoDataFound from "@/components/common/NoDataFound";
import StatusBadge from "@/components/common/StatusBadge";
import SearchBar from "@/components/shared/SearchBar";
import Table from "@/components/shared/Table";
import ProgressBar from "@/components/common/Progress";
import IdentityProgress from "@/components/common/IdentityProgress";
import OrgDetailsModal from "./OrgDetailsModal";

// The platform root org is stored as its own parent - it's left out of the
// results (per backend: "ignore the root one").
const isRootOrg = (org) =>
  !org.parent_organization_id ||
  org.parent_organization_id === org.organization_id;

// Same service icons as the Organizations page tree rows
const SERVICES = [
  { key: "email_service_enabled", label: "Email Service", icon: Mail },
  { key: "chat_service_enabled", label: "Chat Service", icon: MessageSquare },
  { key: "file_service_enabled", label: "File Service", icon: FolderOpen },
  {
    key: "tasks_service_enabled",
    label: "Tasks & Calendar Service",
    icon: CalendarDays,
  },
];

// Global organization search (Tools) - finds any org at any level of the
// hierarchy via the global-list endpoint. Admin-only ("organization:admin:view");
// regular users search within their own tree on the Organizations page.
const OrganizationLookup = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchQuery, setSearchQuery] = useUrlParam("search", "");
  const { pagination, onPaginationChange: setPagination } =
    useTablePagination(PER_PAGE);

  const { data, isLoading, isError, error, refetch } = useGlobalOrganizations(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchQuery,
  );
  const rawOrganizations = data?.organizations || [];
  const organizations = rawOrganizations.filter((org) => !isRootOrg(org));
  // Keep the count in step with the filtered rows
  const totalCount = Math.max(
    (data?.total_count || 0) - (rawOrganizations.length - organizations.length),
    0,
  );

  // Cells mirror the Organizations page tree rows (status, service
  // icons, storage + identity bars) so both views read the same.
  const columns = useMemo(
    () => [
      {
        accessorKey: "organization_name",
        header: "Organization Name",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2 text-left">
            <button
              type="button"
              onClick={() => setSelectedOrg(row.original)}
              className="main-col text-primary truncate text-left font-medium hover:underline"
            >
              {row.original.organization_name}
            </button>
          </div>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: "services",
        header: "Services",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1.5">
            {SERVICES.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                title={`${label} ${row.original[key] ? "Enabled" : "Disabled"}`}
                className={`rounded-md p-1 ${
                  row.original[key]
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "storage",
        header: "Storage",
        cell: ({ row }) => (
          <ProgressBar
            utilized={row.original.quota_utilized}
            allocated={row.original.quota_allocated}
          />
        ),
      },
      {
        id: "identities",
        header: "Identities",
        cell: ({ row }) => (
          <IdentityProgress
            utilized={row.original.utilized_email_identities}
            allocated={row.original.allocated_email_identities}
          />
        ),
      },
      {
        id: "level",
        header: "Level",
        // hierarchy_path is root -> ... -> self, so a direct child of the
        // root is level 1
        cell: ({ row }) =>
          row.original.hierarchy_path?.length
            ? row.original.hierarchy_path.length - 1
            : "-",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: organizations,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize) || 1,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
  });

  if (!permissions.includes("organization:admin:view")) {
    return (
      <AccessDenied content="Don't have access to look up organizations." />
    );
  }

  return (
    <div className="h-full w-full px-2">
      <div className="mb-2.5 flex w-full flex-wrap items-center justify-between gap-2">
        <Breadcrumbs
          items={[{ name: "Tools" }, { name: "Organization Lookup" }]}
        />
        <SearchBar
          placeholder="Search any organization by name..."
          onSearch={(value) => {
            setSearchQuery(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          onClear={() => setSearchQuery("")}
          onRefresh={refetch}
        />
      </div>

      {!searchQuery ? (
        <div className="bg-card border-border rounded-2xl border-2 border-dashed py-32 text-center shadow-sm">
          <div className="bg-muted mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Network className="text-muted-foreground/60 h-10 w-10" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">
            Look up an Organization
          </h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-sm">
            Search any organization by name, at any level of the hierarchy.
            Click a result to see its full details.
          </p>
        </div>
      ) : isError ? (
        <DataErrorWithReload
          content={error?.message || "Failed to search organizations"}
        />
      ) : !isLoading && organizations.length === 0 ? (
        <NoDataFound content={`No organizations match "${searchQuery}"`} />
      ) : (
        <Table table={table} isLoading={isLoading} totalCount={totalCount} />
      )}

      <OrgDetailsModal
        organization={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      />
    </div>
  );
};

export default OrganizationLookup;
