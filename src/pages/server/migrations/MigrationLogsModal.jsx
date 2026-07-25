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

import React, { useState } from "react";
import {
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Server,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useGetMailboxMigrationLogs } from "@/hooks/useServer";
import { Link } from "react-router-dom";
import { useUserTimezone } from "@/hooks/useTimezone";

const MigrationLogsModal = ({ isOpen, onClose, email, allServers = [] }) => {
  const [page, setPage] = useState(1);
  const [expandedMigration, setExpandedMigration] = useState(null);
  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useGetMailboxMigrationLogs(
    email,
    page,
    pageSize,
  );
  const { formatUserDateNice } = useUserTimezone();

  const migrations = data?.data?.migrations || [];
  const totalPages = data?.data?.total_pages || 1;
  const totalCount = data?.data?.total_count || 0;

  // Get server name by ID
  const getServerName = (serverId) => {
    const s = allServers.find((srv) => srv.server_id === serverId);
    return s ? s.host_name : serverId;
  };

  // Get migration status configuration
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        label: "Pending",
      },
      INITIALIZING: {
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning/20",
        label: "Initializing",
      },
      IN_PROGRESS: {
        icon: Activity,
        color: "text-primary",
        bgColor: "bg-primary/20",
        label: "In Progress",
      },
      COMPLETED: {
        icon: CheckCircle,
        color: "text-success",
        bgColor: "bg-success/20",
        label: "Completed",
      },
      FAILED: {
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/20",
        label: "Failed",
      },
    };
    return configs[status] || configs["PENDING"];
  };

  // Format time duration
  const formatDuration = (startTime, endTime) => {
    if (!endTime) return "Ongoing";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);

    if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    }
    return `${diffSeconds}s`;
  };

  // Toggle expanded migration details
  const toggleExpanded = (migrationId) => {
    setExpandedMigration(
      expandedMigration === migrationId ? null : migrationId,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Migration History
              </h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">
                  Loading migration logs...
                </span>
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Failed to Load Migration Logs
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the migration history for this
                mailbox.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : migrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Migration History
              </h3>
              <p className="text-sm text-muted-foreground">
                This mailbox has no migration records yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              {/* <div className="grid grid-cols-4 gap-4 mb-6">
                                {['COMPLETED', 'FAILED', 'IN_PROGRESS', 'INITIALIZING'].map(status => {
                                    const count = migrations.filter(m => m.migration_status === status).length;
                                    const config = getStatusConfig(status);
                                    const Icon = config.icon;

                                    return (
                                        <div key={status} className={`p-3 rounded-lg ${config.bgColor}`}>
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                                <span className="text-sm font-medium text-foreground">
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-foreground">
                                                {count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div> */}

              {/* Migration List */}
              {migrations.map((migration) => {
                const config = getStatusConfig(migration.migration_status);
                const Icon = config.icon;
                const isExpanded = expandedMigration === migration.migration_id;

                return (
                  <div
                    key={migration.migration_id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleExpanded(migration.migration_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs px-2 py-1 rounded ${config.bgColor} ${config.color} font-medium`}
                              >
                                {config.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatUserDateNice(migration.start_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Server className="w-3.5 h-3.5" />
                                <Link
                                  to={`/server/${migration.source_server_id}`}
                                  className="text-sm text-muted-foreground hover:underline hover:text-blue-600"
                                >
                                  {getServerName(migration.source_server_id)}
                                </Link>
                              </div>
                              <span>→</span>
                              <div className="flex items-center gap-1">
                                <Server className="w-3.5 h-3.5" />
                                <Link
                                  to={`/server/${migration.target_server_id}`}
                                  className="text-sm text-muted-foreground hover:underline hover:text-blue-600"
                                >
                                  {getServerName(migration.target_server_id)}
                                </Link>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {formatDuration(
                                    migration.start_time,
                                    migration.end_time,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        {/* Migration Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Migration ID
                            </h4>
                            <code className="text-xs bg-background px-2 py-1 rounded border">
                              {migration.migration_id}
                            </code>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Timeline
                            </h4>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>
                                Started:{" "}
                                {formatUserDateNice(migration.start_time)}
                              </div>
                              {migration.end_time && (
                                <div>
                                  Ended:{" "}
                                  {formatUserDateNice(migration.end_time)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Error Details */}
                        {migration.migration_details?.error && (
                          <div>
                            <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Error Details
                            </h4>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                              <div>
                                <span className="text-xs font-medium text-destructive">
                                  Message:
                                </span>
                                <p className="text-sm text-foreground mt-1">
                                  {migration?.migration_details?.error
                                    ?.message ||
                                    migration?.migration_details?.error}
                                </p>
                              </div>
                              {migration.migration_details.error
                                .possible_cause && (
                                <div>
                                  <span className="text-xs font-medium text-destructive">
                                    Possible Cause:
                                  </span>
                                  <p className="text-sm text-foreground mt-1">
                                    {
                                      migration.migration_details.error
                                        .possible_cause
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Migration Stages */}
                        {migration.migration_details?.stages && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2 text-left">
                              Migration Stages
                            </h4>
                            <div className="space-y-2">
                              {migration.migration_details.stages.map(
                                (stage, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {index + 1}
                                    </div>
                                    <p className="text-sm text-foreground">
                                      {stage}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {migrations.length} of {totalCount} migrations
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-accent rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-accent rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationLogsModal;
