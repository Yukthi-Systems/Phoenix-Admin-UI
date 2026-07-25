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

import React, { useState, useCallback, useMemo } from "react";
import { useDrop } from "react-dnd";
import {
  Server,
  Search,
  CheckSquare,
  Square,
  X,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { useGetMailboxesFromServer } from "@/hooks/useServer";
import { useDebounce } from "@/hooks/useDebounce";
import MailboxCard from "./MailBoxCard";
import ServerMigrationsModal from "./ServerMigrationLogs";

const ServerColumn = ({
  server,
  selectedMailboxes,
  selectedMailboxQuotas,
  onMailboxSelection,
  onMailboxMigration,
  onClearSelection,
  selectedCount,
  allServers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showServerMigrations, setShowServerMigrations] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const pageSize = 20;

  const { data, isLoading, isError, refetch } = useGetMailboxesFromServer(
    server.server_id,
    debouncedSearchTerm,
    page,
    pageSize,
  );

  const mailboxes = data?.data?.mailboxes || [];
  const totalPages = data?.data?.total_pages || 1;
  const totalCount = data?.data?.total_rows || 0;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "mailbox",
    drop: (item) => {
      if (item.sourceServerId !== server.server_id) {
        if (item.isMultiple) {
          onMailboxMigration(
            item.emails,
            item.sourceServerId,
            server.server_id,
            item.mailboxQuotas,
          );
        } else {
          onMailboxMigration(
            [item.email],
            item.sourceServerId,
            server.server_id,
            item.mailboxQuotas,
          );
        }
      }
    },
    canDrop: (item) => {
      return item.sourceServerId !== server.server_id && item.canMigrate;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleSelectAllToggle = useCallback(() => {
    const migratableMailboxes = mailboxes.filter((mailbox) =>
      canMailboxBeMigrated(mailbox),
    );
    const allSelected = migratableMailboxes.every(
      (mailbox) => selectedMailboxes[mailbox.email],
    );

    migratableMailboxes.forEach((mailbox) => {
      onMailboxSelection(
        mailbox.email,
        mailbox.quota_allocated,
        !allSelected,
      );
    });
  }, [mailboxes, selectedMailboxes, onMailboxSelection]);

  const canMailboxBeMigrated = useCallback((mailbox) => {
    return (
      !mailbox.is_locked &&
      (!mailbox.migration_status ||
        !["INITIALIZING", "IN_PROGRESS"].includes(mailbox.migration_status))
    );
  }, []);

  const getServerStatus = () => {
    if (!server.is_active)
      return { color: "text-destructive", label: "Inactive" };
    return { color: "text-success", label: "Active" };
  };

  const serverStatus = getServerStatus();

  const handleServerNameClick = (e) => {
    e.stopPropagation();
    setShowServerMigrations(true);
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const migratableMailboxes = mailboxes.filter((mailbox) =>
    canMailboxBeMigrated(mailbox),
  );
  const allVisibleSelected =
    migratableMailboxes.length > 0 &&
    migratableMailboxes.every((mailbox) => selectedMailboxes[mailbox.email]);

  const isDropTarget = isOver && canDrop;
  const isInvalidDropTarget = isOver && !canDrop;

  return (
    <div
      ref={drop}
      className={`
        bg-card border rounded-lg overflow-hidden transition-all duration-200
        ${isDropTarget ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20" : ""}
        ${isInvalidDropTarget ? "border-destructive bg-destructive/5" : ""}
        ${!isOver ? "border-border shadow-sm" : ""}
      `}
    >
      {/* Server Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div
            onClick={handleServerNameClick}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground truncate">
              {server.host_name}
            </h3>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              server.is_active
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            }`}
          >
            {serverStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
          <div>
            Quota: {server.quota_utilized}/{server.quota_allocated} GB
          </div>
          <div>Mailboxes: {totalCount}</div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mailboxes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllToggle}
              className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-accent rounded transition-colors"
              disabled={migratableMailboxes.length === 0}
            >
              {allVisibleSelected ? (
                <CheckSquare className="w-3 h-3" />
              ) : (
                <Square className="w-3 h-3" />
              )}
              Select All
            </button>
            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-1 text-xs px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Clear ({selectedCount})
              </button>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/50 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">Failed to load mailboxes</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : mailboxes.length === 0 ? (
          <div className="p-4 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No mailboxes found" : "No mailboxes"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {mailboxes.map((mailbox) => (
              <MailboxCard
                key={mailbox.email}
                mailbox={mailbox}
                isSelected={!!selectedMailboxes[mailbox.email]}
                onSelectionChange={(isSelected) =>
                  onMailboxSelection(
                    mailbox.email,
                    mailbox.quota_allocated,
                    isSelected,
                  )
                }
                canMigrate={canMailboxBeMigrated(mailbox)}
                sourceServerId={server.server_id}
                targetServers={allServers.filter(
                  (s) => s.server_id !== server.server_id,
                )}
                selectedMailboxes={selectedMailboxes}
                selectedMailboxQuotas={selectedMailboxQuotas}
                selectedCount={selectedCount}
                allServers={allServers}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {showServerMigrations && (
        <ServerMigrationsModal
          isOpen={showServerMigrations}
          onClose={() => setShowServerMigrations(false)}
          server={server}
          allServers={allServers}
        />
      )}
    </div>
  );
};

export default ServerColumn;
