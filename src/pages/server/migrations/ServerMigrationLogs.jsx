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
  Mail,
  ArrowRight,
  User,
} from "lucide-react";
import {
  useGetMigrationsFromSourceServer,
  useGetServerMigrationStats,
} from "@/hooks/useServer";
import { Link } from "react-router-dom";
import { useUserTimezone } from "@/hooks/useTimezone";

const ServerMigrationsModal = ({
  isOpen,
  onClose,
  server,
  allServers = [],
}) => {
  const [page, setPage] = useState(1);
  const [expandedMigration, setExpandedMigration] = useState(null);
  const pageSize = 15;

  const { data, isLoading, isError, refetch } =
    useGetMigrationsFromSourceServer(server?.server_id, page, pageSize);

  const { data: statsResponse, isLoading: isStatsLoading } =
    useGetServerMigrationStats(server?.server_id);

  // Extract stats from API response
  const stats = statsResponse?.data || {};
  const totalMigrations = stats.total_migrations || 0;
  const completedMigrations = stats.completed_migrations || 0;
  const failedMigrations = stats.failed_migrations || 0;
  const inProgressMigrations = stats.in_progress_migrations || 0;
  const initializingMigrations = stats.initializing_migrations || 0;
  const { formatUserDateNice } = useUserTimezone();

  const migrations = data?.data?.migrations || [];
  const totalPages = data?.data?.total_pages || 1;
  const totalCount = data?.data?.total_count || 0;

  const getServerName = (serverId) => {
    const s = allServers.find((srv) => srv.server_id === serverId);
    return s ? s.host_name : serverId;
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted/20",
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

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return "N/A";

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

  const toggleExpanded = (migrationId) => {
    setExpandedMigration(
      expandedMigration === migrationId ? null : migrationId,
    );
  };

  const migrationsByEmail = migrations.reduce((acc, migration) => {
    if (!acc[migration.email]) {
      acc[migration.email] = [];
    }
    acc[migration.email].push(migration);
    return acc;
  }, {});

  // Create stats array for rendering
  const statusStats = [
    {
      status: "COMPLETED",
      count: completedMigrations,
      config: getStatusConfig("COMPLETED"),
    },
    {
      status: "FAILED",
      count: failedMigrations,
      config: getStatusConfig("FAILED"),
    },
    {
      status: "IN_PROGRESS",
      count: inProgressMigrations,
      config: getStatusConfig("IN_PROGRESS"),
    },
    {
      status: "INITIALIZING",
      count: initializingMigrations,
      config: getStatusConfig("INITIALIZING"),
    },
  ];

  if (!isOpen || !server) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground text-left">
                Server Migration History
              </h2>
              <p className="text-sm text-muted-foreground">
                {server.host_name} • All outgoing migrations
              </p>
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
                  Loading server migrations...
                </span>
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Failed to Load Server Migrations
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the migration history for this
                server.
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
                This server has no outgoing migration records yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className={`p-4 rounded-lg bg-muted`}>
                  <div className="flex items-center gap-2 mb-2 justify-center">
                    <span className="text-sm font-medium text-foreground">
                      Total Migrations
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {isStatsLoading ? (
                      <div className="animate-pulse bg-muted-foreground/20 h-8 w-8 rounded mx-auto"></div>
                    ) : (
                      totalMigrations
                    )}
                  </div>
                </div>

                {statusStats.map(({ status, count, config }) => {
                  const Icon = config.icon;

                  return (
                    <div
                      key={status}
                      className={`p-4 rounded-lg ${config.bgColor}`}
                    >
                      <div className="flex items-center gap-2 mb-2 justify-center">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className="text-sm font-medium text-foreground">
                          {config.label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {isStatsLoading ? (
                          <div className="animate-pulse bg-muted-foreground/20 h-8 w-8 rounded mx-auto"></div>
                        ) : (
                          count
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                {migrations.map((migration) => {
                  const config = getStatusConfig(migration.migration_status);
                  const Icon = config.icon;
                  const isExpanded =
                    expandedMigration === migration.migration_id;

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
                          <div className="flex items-center gap-4">
                            <Icon className={`w-5 h-5 ${config.color}`} />

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">
                                  {migration.email}
                                </span>
                              </div>

                              <ArrowRight className="w-4 h-4 text-muted-foreground" />

                              <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-muted-foreground" />
                                <Link
                                  to={`/server/${migration.target_server_id}`}
                                  className="text-sm text-muted-foreground hover:underline hover:text-blue-600"
                                >
                                  {getServerName(migration.target_server_id)}
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}
                              >
                                {config.label}
                              </span>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatUserDateNice(migration.start_time)}
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
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                          {/* Migration Details */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">
                                Migration ID
                              </h4>
                              <code className="text-xs bg-background px-2 py-1 rounded border block">
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
                                <div>
                                  Duration:{" "}
                                  {formatDuration(
                                    migration.start_time,
                                    migration?.end_time,
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">
                                Target Server
                              </h4>
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/server/${migration.target_server_id}`}
                                  className="text-sm text-muted-foreground hover:underline hover:text-blue-600"
                                >
                                  {getServerName(migration.target_server_id)}
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Created By */}
                          {migration.migration_details?.created_by && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Created By
                              </h4>
                              <p className="text-sm text-muted-foreground text-left">
                                {migration.migration_details.created_by}
                              </p>
                            </div>
                          )}

                          {/* Error Details */}
                          {migration.migration_details?.error && (
                            <div>
                              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                                {typeof migration.migration_details.error ===
                                "string" ? (
                                  <p className="text-sm text-foreground">
                                    {migration.migration_details.error}
                                  </p>
                                ) : (
                                  <>
                                    <div>
                                      <span className="text-xs font-medium text-destructive">
                                        Message:
                                      </span>
                                      <p className="text-sm text-foreground mt-1">
                                        {
                                          migration.migration_details.error
                                            .message
                                        }
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
                                    {migration.migration_details.error
                                      .possible_status && (
                                      <div>
                                        <span className="text-xs font-medium text-destructive">
                                          Possible Status:
                                        </span>
                                        <div className="flex gap-2 mt-1">
                                          {migration.migration_details.error.possible_status.map(
                                            (status) => (
                                              <span
                                                key={status}
                                                className="text-xs px-2 py-1 bg-muted rounded"
                                              >
                                                {status}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {migration.migration_details?.stages && (
                            <div>
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
            </div>
          )}
        </div>

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

export default ServerMigrationsModal;
