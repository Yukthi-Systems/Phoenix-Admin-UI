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

import React, { useState, useEffect } from "react";
import {
  X,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { servers } from "./ServerSelector";
import { SearchMailQueue } from "@/api/mailQ";
import { formatDuration } from "@/utils/numberFormat";

const FetchAllModal = ({ isOpen, onClose }) => {
  const [serverResults, setServerResults] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [sortBy, setSortBy] = useState("total"); // 'name', 'total', 'active', 'deferred', 'size'

  useEffect(() => {
    if (isOpen && !isFetching && Object.keys(serverResults).length === 0) {
      startFetchAll();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setServerResults({});
      setIsFetching(false);
    }
  }, [isOpen]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  };

  const calculateServerStats = (serverData) => {
    const stats = {
      total: serverData.length,
      active: serverData.filter((m) => m.queue_name === "active").length,
      deferred: serverData.filter((m) => m.queue_name === "deferred").length,
      hold: serverData.filter((m) => m.queue_name === "hold").length,
      totalSize: serverData.reduce(
        (sum, m) => sum + (parseInt(m.message_size) || 0),
        0,
      ),
      totalRecipients: serverData.reduce(
        (sum, m) => sum + (m.recipients?.length || 0),
        0,
      ),
      arrivalTimes: serverData
        .map((m) => m.arrival_time)
        .filter(Boolean)
        .map((t) => t * 1000),
    };

    if (stats.total > 0) {
      stats.averageRecipients = (stats.totalRecipients / stats.total).toFixed(
        1,
      );
    }

    if (stats.arrivalTimes.length > 0) {
      stats.arrivalTimes.sort((a, b) => a - b);
      stats.earliestArrival = stats.arrivalTimes[0];
      stats.latestArrival = stats.arrivalTimes[stats.arrivalTimes.length - 1];
      stats.timeSpanMinutes = Math.round(
        (stats.latestArrival - stats.earliestArrival) / 60000,
      );
    }

    return stats;
  };

  const startFetchAll = async () => {
    setIsFetching(true);
    setServerResults({});

    const initialState = {};
    servers.forEach((server) => {
      initialState[server.url] = {
        status: "loading",
        data: [],
        stats: null,
        server: server,
      };
    });
    setServerResults(initialState);

    const fetchPromises = servers.map(async (server) => {
      try {
        const result = await SearchMailQueue(server.url);
        const serverData = result?.data || [];
        const stats = calculateServerStats(serverData);

        setServerResults((prev) => ({
          ...prev,
          [server.url]: {
            status: "success",
            data: serverData,
            stats: stats,
            server: server,
          },
        }));
      } catch (error) {
        setServerResults((prev) => ({
          ...prev,
          [server.url]: {
            status: "error",
            data: [],
            stats: null,
            server: server,
            error: error.message,
          },
        }));
      }
    });

    await Promise.allSettled(fetchPromises);
    setIsFetching(false);
  };

  const getAggregateStats = () => {
    const results = Object.values(serverResults);
    const successfulResults = results.filter((r) => r.status === "success");

    const total = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.total || 0),
      0,
    );
    const active = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.active || 0),
      0,
    );
    const deferred = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.deferred || 0),
      0,
    );
    const hold = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.hold || 0),
      0,
    );
    const totalSize = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.totalSize || 0),
      0,
    );
    const totalRecipients = successfulResults.reduce(
      (sum, r) => sum + (r.stats?.totalRecipients || 0),
      0,
    );

    return {
      total,
      active,
      deferred,
      hold,
      totalSize,
      totalRecipients,
      averageRecipients: total > 0 ? (totalRecipients / total).toFixed(1) : 0,
      serversComplete: results.filter((r) => r.status !== "loading").length,
      serversSuccess: successfulResults.length,
      serversFailed: results.filter((r) => r.status === "error").length,
      serversTotal: servers.length,
    };
  };

  // Sort server results
  const getSortedServers = () => {
    const entries = Object.entries(serverResults);

    return entries.sort((a, b) => {
      const [, resultA] = a;
      const [, resultB] = b;

      // Handle loading/error states - put them at the end
      if (resultA.status === "loading") return 1;
      if (resultB.status === "loading") return -1;
      if (resultA.status === "error") return 1;
      if (resultB.status === "error") return -1;

      switch (sortBy) {
        case "name":
          return resultA.server.name.localeCompare(resultB.server.name);
        case "total":
          return (resultB.stats?.total || 0) - (resultA.stats?.total || 0);
        case "active":
          return (resultB.stats?.active || 0) - (resultA.stats?.active || 0);
        case "deferred":
          return (
            (resultB.stats?.deferred || 0) - (resultA.stats?.deferred || 0)
          );
        case "size":
          return (
            (resultB.stats?.totalSize || 0) - (resultA.stats?.totalSize || 0)
          );
        default:
          return 0;
      }
    });
  };

  const aggregateStats = getAggregateStats();
  const hasResults =
    Object.values(serverResults).some((r) => r.status !== "loading") &&
    !isFetching;
  const progressPercentage =
    (aggregateStats.serversComplete / aggregateStats.serversTotal) * 100;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isFetching) {
      onClose();
    }
  };

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "total", label: "Total Messages" },
    { value: "active", label: "Active" },
    { value: "deferred", label: "Deferred" },
    { value: "size", label: "Size" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <div className="fixed top-1/2 left-1/2 z-[9999] max-h-[90vh] w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-xl border border-border bg-card text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card p-3">
          <div className="flex flex-1 items-center gap-2.5">
            <Server className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h2 className="text-left text-lg font-semibold text-foreground">
                All Servers Queue Status
              </h2>
              {isFetching && (
                <p className="text-xs text-muted-foreground">
                  Fetching {aggregateStats.serversComplete}/
                  {aggregateStats.serversTotal}
                </p>
              )}
              {!isFetching && hasResults && (
                <p className="text-xs text-muted-foreground">
                  {aggregateStats.serversSuccess} successful,{" "}
                  {aggregateStats.serversFailed} failed
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isFetching}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {isFetching && (
          <div className="px-4 pt-3 pb-2">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {aggregateStats.serversComplete} / {aggregateStats.serversTotal}
              </span>
              <span className="font-medium text-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-3">
          {/* Server List */}
          {Object.keys(serverResults).length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Server Details
                  </h3>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          Sort: {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={startFetchAll}
                  disabled={isFetching}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetching ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Server className="h-3 w-3" />
                  )}
                  Refetch All
                </button>
              </div>

              {/* 2-Column Grid Layout */}
              <div className="grid  grid-cols-1 md:grid-cols-2 gap-2.5 lg:grid-cols-3">
                {getSortedServers().map(([url, result]) => (
                  <div
                    key={url}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    {/* Server Header */}
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {result.server.name}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({result.server.id})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === "loading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {result.status === "success" && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                        {result.status === "error" && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>

                    {result.status === "success" && result.stats && (
                      <div className="grid grid-cols-2 gap-x-6 text-sm">
                        {/* LEFT COLUMN */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-semibold text-foreground">
                              {result.stats.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Active:
                            </span>
                            <span className="font-semibold text-success">
                              {result.stats.active}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Deferred:
                            </span>
                            <span className="font-semibold text-destructive">
                              {result.stats.deferred}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hold:</span>
                            <span className="font-semibold text-warning">
                              {result.stats.hold}
                            </span>
                          </div>
                          {result.stats.earliestArrival &&
                            result.stats.latestArrival && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Time Span:
                                </span>
                                <span className="font-semibold text-primary">
                                  {formatDuration(result.stats.timeSpanMinutes)}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-semibold text-foreground">
                              {formatBytes(result.stats.totalSize)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Recipients:
                            </span>
                            <span className="font-semibold text-foreground">
                              {result.stats.totalRecipients}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Avg/Msg:
                            </span>
                            <span className="font-semibold text-foreground">
                              {result.stats.averageRecipients}
                            </span>
                          </div>
                          {result.stats.earliestArrival && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Earliest:
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatDateTime(result.stats.earliestArrival)}
                              </span>
                            </div>
                          )}
                          {result.stats.latestArrival && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Latest:
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatDateTime(result.stats.latestArrival)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {result.status === "error" && (
                      <p className="text-sm text-destructive">
                        {result.error || "Failed to fetch data"}
                      </p>
                    )}

                    {result.status === "loading" && (
                      <p className="text-sm text-muted-foreground">
                        Loading...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FetchAllModal;
