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

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  MoreVertical,
  Trash2,
  PauseCircle,
  RefreshCw,
} from "lucide-react";
import RecipientDetails from "./Details";
import TableActionsDropdown from "@/components/common/TableActionDropdown";
import { SERVER_ACTIONS } from "@/constants/constants";

const QueueTableRow = ({
  item,
  isExpanded,
  onToggleExpand,
  isSelected,
  onToggleSelect,
  onMessageAction,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getQueueStatusConfig = (queueName) => {
    const config = {
      active: { color: "text-success", bg: "bg-success/10", label: "Active" },
      deferred: {
        color: "text-destructive",
        bg: "bg-destructive/10",
        label: "Deferred",
      },
      hold: { color: "text-warning", bg: "bg-warning/10", label: "Hold" },
    };
    return config[queueName] || config.hold;
  };

  const statusConfig = getQueueStatusConfig(item.queue_name);

  return (
    <>
      <tr className="hover:bg-muted/20 group transition-colors">
        <td className="px-2 py-3 lg:px-4" style={{ width: "3%" }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(item.queue_id, e.target.checked)}
            className="border-border h-4 w-4 cursor-pointer rounded"
          />
        </td>
        <td className="px-2 py-3 lg:px-4 xl:px-6" style={{ width: "16%" }}>
          <div
            className="flex cursor-pointer items-center gap-1.5 lg:gap-2"
            onClick={onToggleExpand}
          >
            <div className="flex-shrink-0 transition-transform duration-200">
              {isExpanded ? (
                <ChevronUp className="text-muted-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
              )}
            </div>
            <span className="text-foreground hover:text-primary truncate font-mono text-xs transition-colors lg:text-sm">
              {item.queue_id}
            </span>
          </div>
        </td>
        <td className="px-2 py-3 lg:px-4 xl:px-6" style={{ width: "12%" }}>
          <div
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium lg:px-2 lg:py-1 ${statusConfig.bg} ${statusConfig.color} min-w-0`}
          >
            <div
              className={`mr-1 h-1.5 w-1.5 flex-shrink-0 rounded-full lg:mr-1.5 lg:h-2 lg:w-2 ${statusConfig.color.replace("text-", "bg-")}`}
            />
            <span className="hidden text-xs md:inline">
              {statusConfig.label}
            </span>
            <span className="text-xs md:hidden">
              {statusConfig.label.charAt(0)}
            </span>
          </div>
        </td>
        <td className="px-2 py-3 lg:px-4 xl:px-6" style={{ width: "35%" }}>
          <div className="min-w-0 xl:max-w-[300px] 2xl:max-w-lg">
            <span
              className="text-foreground block text-left text-xs lg:text-sm"
              title={item.sender}
              style={{ wordBreak: "break-all" }}
            >
              {item.sender || "N/A"}
            </span>
          </div>
        </td>
        <td
          className="px-2 py-3 text-center lg:px-4 xl:px-6"
          style={{ width: "9%" }}
        >
          <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium whitespace-nowrap lg:px-2 lg:py-1">
            {item.recipients?.length || 0}
          </span>
        </td>
        <td
          className="px-2 py-3 text-center lg:px-4 xl:px-6"
          style={{ width: "9%" }}
        >
          <span className="text-muted-foreground text-xs whitespace-nowrap lg:text-sm">
            {formatSize(item.message_size)}
          </span>
        </td>
        <td
          className="px-2 py-3 text-center lg:px-4 xl:px-6"
          style={{ width: "11%" }}
        >
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDate(item.arrival_time)}
          </span>
        </td>
        <td className="px-2 py-3 text-center lg:px-4" style={{ width: "5%" }}>
          <TableActionsDropdown
            height={150}
            actions={[
              {
                id: SERVER_ACTIONS.REMOVE_MESSAGE,
                label: "Remove Message",
                icon: Trash2,
                variant: "danger",
                onClick: () =>
                  onMessageAction(SERVER_ACTIONS.REMOVE_MESSAGE, item.queue_id),
              },
              {
                id: SERVER_ACTIONS.HOLD_MESSAGE,
                label: "Hold Message",
                icon: PauseCircle,
                variant: "warning",
                onClick: () =>
                  onMessageAction(SERVER_ACTIONS.HOLD_MESSAGE, item.queue_id),
              },
              {
                id: SERVER_ACTIONS.REQUEUE_MESSAGE,
                label: "Requeue Message",
                icon: RefreshCw,
                variant: "success",
                onClick: () =>
                  onMessageAction(
                    SERVER_ACTIONS.REQUEUE_MESSAGE,
                    item.queue_id,
                  ),
              },
            ]}
          />
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="8" className="bg-muted/5 border-border border-t p-0">
            <RecipientDetails recipients={item.recipients || []} />
          </td>
        </tr>
      )}
    </>
  );
};

const QueueTable = ({
  filteredData,
  expandedRows,
  onToggleExpand,
  selectedMessages,
  onToggleSelect,
  onMessageAction,
  onBulkAction,
  onClearSelection,
}) => {
  const [tableSearch, setTableSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const searchFilteredData = useMemo(() => {
    if (!tableSearch.trim()) return filteredData;
    const query = tableSearch.toLowerCase();
    return filteredData.filter((item) => {
      const matchesQueueId = item.queue_id?.toLowerCase().includes(query);
      const matchesSender = item.sender?.toLowerCase().includes(query);
      const matchesRecipients = item.recipients?.some(
        (recipient) =>
          recipient.address?.toLowerCase().includes(query) ||
          recipient.delay_reason?.toLowerCase().includes(query),
      );
      return matchesQueueId || matchesSender || matchesRecipients;
    });
  }, [filteredData, tableSearch]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return searchFilteredData;
    return [...searchFilteredData].sort((a, b) => {
      let aValue, bValue;
      switch (sortConfig.key) {
        case "queue_id":
          aValue = a.queue_id || "";
          bValue = b.queue_id || "";
          break;
        case "status":
          aValue = a.queue_name || "";
          bValue = b.queue_name || "";
          break;
        case "sender":
          aValue = a.sender || "";
          bValue = b.sender || "";
          break;
        case "recipients":
          aValue = a.recipients?.length || 0;
          bValue = b.recipients?.length || 0;
          break;
        case "size":
          aValue = a.message_size || 0;
          bValue = b.message_size || 0;
          break;
        case "arrival_time":
          aValue = a.arrival_time || 0;
          bValue = b.arrival_time || 0;
          break;
        default:
          return 0;
      }
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [searchFilteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return (
        <ArrowUpDown className="text-muted-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
      );
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="text-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
    ) : (
      <ArrowDown className="text-foreground h-3.5 w-3.5 lg:h-4 lg:w-4" />
    );
  };

  // Select all works on currently visible (sorted/filtered) data only
  const allSelected =
    sortedData.length > 0 &&
    sortedData.every((item) => selectedMessages.has(item.queue_id));
  const someSelected =
    sortedData.some((item) => selectedMessages.has(item.queue_id)) &&
    !allSelected;

  const handleSelectAll = (checked) => {
    const newSelected = new Set(selectedMessages);
    if (checked) {
      sortedData.forEach((item) => newSelected.add(item.queue_id));
    } else {
      sortedData.forEach((item) => newSelected.delete(item.queue_id));
    }
    onToggleSelect(null, null, newSelected);
  };

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border border-b p-3 lg:p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-muted-foreground h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search queue ID, sender, recipients..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="text-foreground bg-background border-border focus:ring-primary focus:border-primary block w-full rounded-md border py-2 pr-10 pl-10 text-sm focus:ring-2 focus:outline-none"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
              </button>
            )}
          </div>
          {selectedMessages.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {selectedMessages.size} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                <X className="h-4 w-4" />
              </button>
              {[
                {
                  id: SERVER_ACTIONS.REMOVE_MESSAGE,
                  label: "Remove",
                  icon: Trash2,
                  className:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                },
                {
                  id: SERVER_ACTIONS.HOLD_MESSAGE,
                  label: "Hold",
                  icon: PauseCircle,
                  className:
                    "bg-warning text-warning-foreground hover:bg-warning/90",
                },
                {
                  id: SERVER_ACTIONS.REQUEUE_MESSAGE,
                  label: "Requeue",
                  icon: RefreshCw,
                  className:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onBulkAction(action.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${action.className}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {sortedData.length !== filteredData.length && (
          <p className="text-muted-foreground mt-2 text-xs">
            Showing {sortedData.length} of {filteredData.length} results
          </p>
        )}
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[80vh] min-h-[400px]">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted/30 border-border border-b">
            <tr>
              <th
                className="px-2 py-2.5 lg:px-4 lg:py-3"
                style={{ width: "3%" }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="border-border h-4 w-4 cursor-pointer rounded"
                />
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-left text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "16%" }}
                onClick={() => handleSort("queue_id")}
              >
                <div className="flex items-center gap-1 lg:gap-2">
                  <span>Queue ID</span>
                  {getSortIcon("queue_id")}
                </div>
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-center text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "12%" }}
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <span>Status</span>
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-left text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "35%" }}
                onClick={() => handleSort("sender")}
              >
                <div className="flex items-center gap-1 lg:gap-2">
                  <span>Sender</span>
                  {getSortIcon("sender")}
                </div>
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-center text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "9%" }}
                onClick={() => handleSort("recipients")}
              >
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <span className="hidden md:inline">Recipients</span>
                  <span className="md:hidden">Rcpt</span>
                  {getSortIcon("recipients")}
                </div>
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-center text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "9%" }}
                onClick={() => handleSort("size")}
              >
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <span>Size</span>
                  {getSortIcon("size")}
                </div>
              </th>
              <th
                className="text-foreground hover:bg-muted/50 cursor-pointer px-2 py-2.5 text-center text-xs font-semibold transition-colors lg:px-4 lg:py-3 lg:text-sm xl:px-6"
                style={{ width: "11%" }}
                onClick={() => handleSort("arrival_time")}
              >
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  <span className="hidden lg:inline">Arrival</span>
                  <span className="lg:hidden">Time</span>
                  {getSortIcon("arrival_time")}
                </div>
              </th>
              <th
                className="text-foreground px-2 py-2.5 text-center text-xs font-semibold lg:px-4 lg:py-3 lg:text-sm"
                style={{ width: "5%" }}
              ></th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8" />
                    <span>
                      No results found{tableSearch && ` for "${tableSearch}"`}
                    </span>
                    {tableSearch && (
                      <button
                        onClick={() => setTableSearch("")}
                        className="text-primary text-sm hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <QueueTableRow
                  key={item.queue_id}
                  item={item}
                  isExpanded={expandedRows.has(item.queue_id)}
                  onToggleExpand={() => onToggleExpand(item.queue_id)}
                  isSelected={selectedMessages.has(item.queue_id)}
                  onToggleSelect={onToggleSelect}
                  onMessageAction={onMessageAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueTable;
