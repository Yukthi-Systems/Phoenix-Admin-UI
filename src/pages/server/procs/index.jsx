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

import React, { useMemo, useState, useEffect } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { ArrowUpDown, Activity, Server, Search, X } from "lucide-react";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import AccessDenied from "@/components/common/AccessDenied";
import DataFechError from "@/components/common/DataFechError";
import NoDataFound from "@/components/common/NoDataFound";
import ServerSelector from "@/pages/server/mailQ/searchMailQ/ServerSelector";

import { useGetServerProcs } from "@/hooks/useServer";
import { userProfileAtom } from "@/store/userProfile";
import {
  formatFileSize,
  smartFormat,
  formatNumber,
  formatNumberWithCommas,
} from "@/utils/numberFormat";

// Process State Configuration
const PROCESS_STATES = {
  R: { icon: "🟢", label: "Running", color: "text-success" },
  S: { icon: "🟡", label: "Sleeping", color: "text-warning" },
  D: { icon: "🔴", label: "I/O Wait", color: "text-destructive" },
  T: { icon: "⏸️", label: "Stopped", color: "text-muted-foreground" },
  t: { icon: "🐞", label: "Debug", color: "text-primary" },
  Z: { icon: "💀", label: "Zombie", color: "text-destructive" },
  X: { icon: "⚫", label: "Dead", color: "text-muted-foreground" },
  I: { icon: "💠", label: "Idle", color: "text-accent-foreground" },
};

// Tooltip Component
const Tooltip = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
      {content}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
    </div>
  </div>
);

// Search Bar Component
const ProcessSearchBar = ({ searchQuery, setSearchQuery, resultCount }) => {
  return (
    <div className="relative max-w-xl text-left">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search processes by name or PID..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      {searchQuery && (
        <div className="mt-2 text-xs text-muted-foreground">
          Found {resultCount} {resultCount === 1 ? "process" : "processes"}{" "}
          matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

// Custom Table Component
const ProcessTable = ({ table, isLoading }) => {
  const skeletonRows = Array(8).fill(null);

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted border-b-2 border-primary/20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-sm font-bold text-foreground whitespace-nowrap"
                    style={{
                      textAlign: header.column.columnDef.meta?.align || "left",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/50">
            {skeletonRows.map((_, idx) => (
              <tr key={idx} className="bg-card hover:bg-muted/20">
                {table.getAllColumns().map((col, colIdx) => (
                  <td key={colIdx} className="px-3 py-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-muted border-b-2 border-primary/20">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-sm font-bold text-foreground whitespace-nowrap"
                  style={{
                    textAlign: header.column.columnDef.meta?.align || "left",
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border/50">
          {table.getRowModel().rows.map((row, rowIdx) => (
            <tr
              key={row.id}
              className={`transition-colors hover:bg-primary/10 ${
                rowIdx % 2 === 1 ? "bg-muted/10" : "bg-card"
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 text-sm text-foreground whitespace-nowrap"
                  style={{
                    textAlign: cell.column.columnDef.meta?.align || "left",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ServerProcs = () => {
  const [selectedServer, setSelectedServer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState([{ id: "cpu_percent", desc: true }]);

  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  const { data, isLoading, isError, refetch, isFetching ,error} =
    useGetServerProcs(selectedServer);
  const processList = data?.data ?? [];

  useEffect(() => {
    setSearchQuery("");
  }, [selectedServer]);

  // Search Logic - Filters by name or PID
  const filteredProcs = useMemo(() => {
    if (!searchQuery.trim()) return processList;
    const query = searchQuery.toLowerCase().trim();
    return processList.filter(
      (proc) =>
        proc.name?.toLowerCase().includes(query) ||
        proc.pid?.toString().includes(query),
    );
  }, [processList, searchQuery]);

  // Memoize column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "pid",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PID <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue, row }) => (
          <Tooltip content={`PID: ${getValue()}, PPID: ${row.original.ppid}`}>
            <span className="font-mono text-xs font-medium">{getValue()}</span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "ppid",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PPID <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip content={`Parent PID: ${getValue()}`}>
            <span className="font-mono text-xs text-muted-foreground">
              {getValue()}
            </span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Process <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip content={getValue()}>
            <span className="font-medium text-foreground max-w-[150px] truncate inline-block">
              {getValue()}
            </span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "state",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            State <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const state = getValue();
          const stateInfo = PROCESS_STATES[state] || {
            icon: "❓",
            label: "Unknown",
            color: "text-muted-foreground",
          };
          return (
            <Tooltip content={`${stateInfo.label} (${state})`}>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{stateInfo.icon}</span>
                <span className={`text-xs font-medium ${stateInfo.color}`}>
                  {state}
                </span>
              </div>
            </Tooltip>
          );
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "cpu_percent",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CPU % <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          const displayVal = val < 0.01 ? 0 : val;
          return (
            <Tooltip content={`CPU: ${val.toFixed(8)}%`}>
              <div className="flex items-center justify-start gap-2">
                <span className="text-xs font-medium w-10 text-left">
                  {smartFormat(displayVal, "percentage")}
                </span>
              </div>
            </Tooltip>
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "mem_percent",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mem % <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <Tooltip content={`Memory: ${val.toFixed(8)}%`}>
              <span className="text-xs">{smartFormat(val, "percentage")}</span>
            </Tooltip>
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <Tooltip content={`Priority: ${val} (lower = higher priority)`}>
              <span
                className={`text-xs font-medium ${val < 20 ? "text-success" : ""}`}
              >
                {val}
              </span>
            </Tooltip>
          );
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "nice",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nice <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return (
            <Tooltip content={`Nice: ${val} (-20 high, +19 low)`}>
              <span
                className={`text-xs font-medium ${
                  val < 0 ? "text-success" : val > 0 ? "text-warning" : ""
                }`}
              >
                {val}
              </span>
            </Tooltip>
          );
        },
        meta: { align: "center" },
      },
      {
        accessorKey: "threads",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Threads <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip content={`${formatNumberWithCommas(getValue())} threads`}>
            <span className="text-xs">{formatNumber(getValue())}</span>
          </Tooltip>
        ),
        meta: { align: "center" },
      },
      {
        accessorKey: "utime",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User Time <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip
            content={`User CPU ticks: ${formatNumberWithCommas(getValue())}`}
          >
            <span className="text-xs">{formatNumber(getValue())}</span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "stime",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            System Time <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip
            content={`System CPU ticks: ${formatNumberWithCommas(getValue())}`}
          >
            <span className="text-xs">{formatNumber(getValue())}</span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "virt_kb",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Virtual <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const bytes = getValue() * 1024;
          return (
            <Tooltip
              content={`${formatNumberWithCommas(getValue())} KB (${formatNumberWithCommas(
                bytes,
              )} bytes)`}
            >
              <span className="text-xs">{formatFileSize(bytes)}</span>
            </Tooltip>
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "res_kb",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Resident <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const bytes = getValue() * 1024;
          return (
            <Tooltip
              content={`${formatNumberWithCommas(getValue())} KB (${formatNumberWithCommas(
                bytes,
              )} bytes)`}
            >
              <span className="text-xs">{formatFileSize(bytes)}</span>
            </Tooltip>
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "shr_kb",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Shared <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => {
          const bytes = getValue() * 1024;
          return (
            <Tooltip
              content={`${formatNumberWithCommas(getValue())} KB (${formatNumberWithCommas(
                bytes,
              )} bytes)`}
            >
              <span className="text-xs">{formatFileSize(bytes)}</span>
            </Tooltip>
          );
        },
        meta: { align: "left" },
      },
      {
        accessorKey: "read_bytes",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Disk Read <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip content={`${formatNumberWithCommas(getValue())} bytes read`}>
            <span className="text-xs">{formatFileSize(getValue())}</span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
      {
        accessorKey: "write_bytes",
        header: ({ column }) => (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Disk Write <ArrowUpDown size={14} />
          </div>
        ),
        cell: ({ getValue }) => (
          <Tooltip
            content={`${formatNumberWithCommas(getValue())} bytes written`}
          >
            <span className="text-xs">{formatFileSize(getValue())}</span>
          </Tooltip>
        ),
        meta: { align: "left" },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredProcs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!permissions.includes("server:view")) {
    return (
      <AccessDenied content="Access denied to server process management." />
    );
  }

  return (
    <div className="bg-background min-h-screen p-6 ">
      <div className="mx-auto max-w-[1920px]">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Breadcrumbs
              items={[{ name: "Server" }, { name: "Process List" }]}
            />
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Real-time Monitor
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Server Processes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitor CPU, Memory, and I/O for system processes
          </p>
        </div>

        {/* Server Selection */}
        <div className="mb-6 flex flex-col gap-4">
          <ServerSelector
            selectedServer={selectedServer}
            setSelectedServer={setSelectedServer}
            searchQuery=""
            setSearchQuery={() => {}}
            queueFilter="all"
            setQueueFilter={() => {}}
            onFetch={() => refetch()}
            isLoading={isLoading || isFetching}
            fetchText="Fetch Processes"
          />
        </div>

        {/* Search Bar - Only show when server is selected */}
        {selectedServer && !isError && (
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar Component */}
            <div className="flex-1 max-w-2xl">
              <ProcessSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                resultCount={filteredProcs.length}
              />
            </div>

            {/* Result Count - Right Side */}
            <div className="flex items-center self-end md:self-center px-3 py-1.5 transition-colors">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Total Processes:
                <span className="ml-1.5 text-sm font-bold text-foreground font-mono">
                  {filteredProcs.length}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Content Section */}
        {!selectedServer ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center shadow-sm">
            <Server className="mx-auto mb-4 h-20 w-20 text-muted-foreground/40" />
            <h3 className="text-xl font-semibold text-foreground">
              No Server Selected
            </h3>
            <p className="mt-2 text-muted-foreground">
              Please select a mailbox server to view its process list
            </p>
          </div>
        ) : isError ? (
          <DataFechError content={`${error}`} />
        ) : (
          <div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {filteredProcs.length > 0 || isLoading ? (
              <ProcessTable table={table} isLoading={isLoading || isFetching} />
            ) : (
              <NoDataFound
                content={
                  searchQuery
                    ? `No process matching "${searchQuery}"`
                    : "Server returned an empty process list"
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerProcs;
