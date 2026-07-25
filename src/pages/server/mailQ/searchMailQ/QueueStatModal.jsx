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

import React from "react";
import {
  X,
  Mail,
  Clock,
  Database,
  Activity,
  Calendar,
  TrendingUp,
  Package,
} from "lucide-react";
import { formatDuration } from "@/utils/numberFormat";

const QueueStatsModal = ({ isOpen, onClose, filteredData }) => {
  if (!isOpen) return null;

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const stats = {
      total: filteredData.length,
      active: 0,
      deferred: 0,
      hold: 0,
      totalSize: 0,
      totalRecipients: 0,
      arrivalTimes: [],
      senderDomains: {},
      recipientDomains: {},
      averageSize: 0,
      averageRecipients: 0,
    };

    filteredData.forEach((item) => {
      // Queue type counts
      if (item.queue_name === "active") stats.active++;
      else if (item.queue_name === "deferred") stats.deferred++;
      else if (item.queue_name === "hold") stats.hold++;

      // Total size
      if (item.message_size) {
        stats.totalSize += parseInt(item.message_size) || 0;
      }

      // Recipient count
      if (item.recipients) {
        stats.totalRecipients += item.recipients.length;
      }

      // Arrival times (timestamps are in seconds, convert to milliseconds)
      if (item.arrival_time) {
        stats.arrivalTimes.push(item.arrival_time * 1000);
      }
    });

    // Calculate averages
    if (stats.total > 0) {
      stats.averageSize = Math.round(stats.totalSize / stats.total);
      stats.averageRecipients = (stats.totalRecipients / stats.total).toFixed(
        1,
      );
    }

    // Calculate arrival time range
    if (stats.arrivalTimes.length > 0) {
      stats.arrivalTimes.sort((a, b) => a - b);
      stats.earliestArrival = stats.arrivalTimes[0];
      stats.latestArrival = stats.arrivalTimes[stats.arrivalTimes.length - 1];

      // Calculate time span in minutes
      stats.timeSpanMinutes = Math.round(
        (stats.latestArrival - stats.earliestArrival) / 60000,
      );
    }

    return stats;
  };

  const stats = calculateStats();

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  };

  // Calculate percentage
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="bg-card border-border fixed top-1/2 left-1/2 z-[9999] max-h-[85vh] w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-xl border shadow-2xl">
        {/* Header */}
        <div className="border-border bg-card sticky top-0 z-10 flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-primary h-6 w-6" />
            <div>
              <h2 className="text-foreground text-2xl font-semibold text-left">
                Queue Statistics
              </h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Comprehensive mail queue analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-accent rounded-lg p-2 transition-colors"
            title="Close"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(85vh-100px)] overflow-y-auto p-6">
          {/* Overview Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Messages */}
            <div className="from-primary/10 to-primary/5 border-primary/20 rounded-lg border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center justify-between">
                <Mail className="text-primary h-5 w-5" />
                <span className="text-primary text-3xl font-bold">
                  {stats.total}
                </span>
                <div className="min-w-5"></div>
              </div>
              <p className="text-foreground text-sm font-medium">
                Total Messages
              </p>
              <p className="text-muted-foreground mt-1 text-xs">in queue</p>
            </div>

            {/* Active Queue */}
            <div className="from-success/10 to-success/5 border-success/20 rounded-lg border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center justify-between">
                <Activity className="text-success h-5 w-5" />
                <span className="text-success text-3xl font-bold">
                  {stats.active}
                </span>
                <div className="min-w-5"></div>
              </div>
              <p className="text-foreground text-sm font-medium">Active</p>
              <p className="text-success mt-1 text-xs">
                {getPercentage(stats.active, stats.total)}% of total
              </p>
            </div>

            {/* Deferred Queue */}
            <div className="from-destructive/10 to-destructive/5 border-destructive/20 rounded-lg border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center justify-between">
                <Clock className="text-destructive h-5 w-5" />
                <span className="text-destructive text-3xl font-bold">
                  {stats.deferred}
                </span>
                <div className="min-w-5"></div>
              </div>
              <p className="text-foreground text-sm font-medium">Deferred</p>
              <p className="text-destructive mt-1 text-xs">
                {getPercentage(stats.deferred, stats.total)}% of total
              </p>
            </div>

            {/* Hold Queue */}
            <div className="from-warning/10 to-warning/5 border-warning/20 rounded-lg border bg-gradient-to-br p-4">
              <div className="mb-2 flex items-center justify-between">
                <Package className="text-warning h-5 w-5" />
                <span className="text-warning text-3xl font-bold">
                  {stats.hold}
                </span>
                <div className="min-w-5"></div>
              </div>
              <p className="text-foreground text-sm font-medium">Hold</p>
              <p className="text-warning mt-1 text-xs">
                {getPercentage(stats.hold, stats.total)}% of total
              </p>
            </div>
          </div>

          {/* Size and Recipients Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Size Statistics */}
            <div className="bg-muted/30 border-border rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <Database className="text-primary h-5 w-5" />
                <h3 className="text-foreground text-lg font-semibold">
                  Size Statistics
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Accumulated Size
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {formatBytes(stats.totalSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Average Message Size
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {formatBytes(stats.averageSize)}
                  </span>
                </div>
                <div className="bg-border my-2 h-px" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Recipients
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {stats.totalRecipients}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Avg Recipients/Message
                  </span>
                  <span className="text-foreground text-sm font-semibold">
                    {stats.averageRecipients}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Statistics */}
            <div className="bg-muted/30 border-border rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                <h3 className="text-foreground text-lg font-semibold">
                  Time Range
                </h3>
              </div>
              {stats.earliestArrival && stats.latestArrival ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Earliest Arrival
                    </p>
                    <p className="text-foreground text-sm font-semibold">
                      {formatDateTime(stats.earliestArrival)}
                    </p>
                  </div>
                  <div className="bg-border my-2 h-px" />
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Latest Arrival
                    </p>
                    <p className="text-foreground text-sm font-semibold">
                      {formatDateTime(stats.latestArrival)}
                    </p>
                  </div>
                  <div className="bg-border my-2 h-px" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Time Span
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {formatDuration(stats.timeSpanMinutes)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No arrival time data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueueStatsModal;
