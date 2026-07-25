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

import {
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  CheckCircle2,
  Download,
  Clock,
  Zap,
} from "lucide-react";
import { useGetMaintenanceStatus } from "@/hooks/useMaintenanceStatus";
import {
  parseISO,
  formatDistanceToNow,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useEffect, useMemo, useState } from "react";
import {
  generateICSEvent,
  generateICSCalendar,
  downloadICS,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/utils/calenderUtils";
import CalendarDropdown from "./CalenderDropdown";
import { dismissedAlertsAtom } from "@/store/maintainence";
import { useAtom } from "jotai";

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const StatusPage = () => {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetMaintenanceStatus();

  const [dismissedAlerts, setDismissedAlerts] = useAtom(dismissedAlertsAtom);
  const [activeTab, setActiveTab] = useState("current");
  const { formatUserDateTable } = useUserTimezone();

  const getTimeRemaining = (endTime) => {
    try {
      const end = parseISO(endTime);
      const now = new Date();
      const mins = differenceInMinutes(end, now);
      const hours = differenceInHours(end, now);
      const days = differenceInDays(end, now);

      if (mins < 60) return `${mins}m left`;
      if (hours < 24) return `${hours}h left`;
      return `${days}d left`;
    } catch {
      return "Unknown";
    }
  };

  const getTimeUntilStart = (startTime) => {
    try {
      const start = parseISO(startTime);
      const now = new Date();
      const mins = differenceInMinutes(start, now);
      const hours = differenceInHours(start, now);
      const days = differenceInDays(start, now);

      if (mins < 60) return `in ${mins}m`;
      if (hours < 24) return `in ${hours}h`;
      return `in ${days}d`;
    } catch {
      return "Unknown";
    }
  };

  const {
    activeItems,
    upcomingItems,
    completedItems,
    overallStatus,
    allItems,
    allUpdatesItems,
  } = useMemo(() => {
    const now = new Date();
    const statusItems = data?.data || [];

    const categorizeItems = (items) => {
      return {
        active: items.filter((item) => {
          try {
            const start = parseISO(item.start_time);
            const end = parseISO(item.end_time);
            return start < now && end > now;
          } catch {
            return false;
          }
        }),
        upcoming: items.filter((item) => {
          try {
            return parseISO(item.start_time) > now;
          } catch {
            return false;
          }
        }),
        completed: items.filter((item) => {
          try {
            return parseISO(item.end_time) < now;
          } catch {
            return false;
          }
        }),
      };
    };

    const { active, upcoming, completed } = categorizeItems(statusItems);

    const sortBySeverity = (items) => {
      return [...items].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      );
    };

    const sortByStartTimeDesc = (items) => {
      return [...items].sort((a, b) => {
        try {
          return parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime();
        } catch {
          return 0;
        }
      });
    };

    const getOverall = () => {
      if (active.some((item) => item.severity === "CRITICAL")) {
        return {
          label: "Major Outage",
          icon: AlertCircle,
          color: "text-destructive",
          indicatorColor: "bg-destructive",
        };
      } else if (active.some((item) => item.severity === "HIGH")) {
        return {
          label: "Service Degradation",
          icon: AlertTriangle,
          color: "text-warning",
          indicatorColor: "bg-warning",
        };
      } else if (active.length > 0) {
        return {
          label: "Minor Issues",
          icon: Info,
          color: "text-primary",
          indicatorColor: "bg-primary",
        };
      }
      return {
        label: "All Systems Operational",
        icon: CheckCircle2,
        color: "text-success",
        indicatorColor: "bg-success",
      };
    };

    return {
      activeItems: sortBySeverity(active),
      upcomingItems: sortBySeverity(upcoming),
      completedItems: sortBySeverity(completed),
      allItems: sortBySeverity([...active, ...upcoming]),
      allUpdatesItems: sortByStartTimeDesc(statusItems),
      overallStatus: getOverall(),
    };
  }, [data]);

  useEffect(() => {
    if (allItems.length > 0) {
      const titlesToDismiss = allItems.map((item) => item.title);
      setDismissedAlerts((prev) => [...new Set([...prev, ...titlesToDismiss])]);
    }
  }, [allItems, setDismissedAlerts]);

  if (isLoading) {
    return <DataLoading content="Loading system status..." />;
  }

  if (isError) {
    return <DataFechError content="Failed to load system status" />;
  }

  const severityConfig = {
    CRITICAL: {
      icon: AlertCircle,
      icon_color: "text-destructive",
      badge: "bg-destructive/20 text-destructive border border-destructive/30",
    },
    HIGH: {
      icon: AlertTriangle,
      icon_color: "text-warning",
      badge: "bg-warning/20 text-warning border border-warning/30",
    },
    MEDIUM: {
      icon: Info,
      icon_color: "text-primary",
      badge: "bg-primary/20 text-primary border border-primary/30",
    },
    LOW: {
      icon: Info,
      icon_color: "text-muted-foreground",
      badge: "bg-muted text-muted-foreground border border-border",
    },
  };

  const StatusCard = ({ item, isActive }) => {
    const config = severityConfig[item.severity] || severityConfig.LOW;
    const Icon = config.icon;

    const statusType = useMemo(() => {
      if (isActive !== undefined) {
        return isActive ? "active" : "upcoming";
      }
      try {
        const now = new Date();
        const start = parseISO(item.start_time);
        const end = parseISO(item.end_time);
        if (end < now) return "completed";
        if (start > now) return "upcoming";
        return "active";
      } catch {
        return "unknown";
      }
    }, [item.start_time, item.end_time, isActive]);

    return (
      <div className="bg-card border border-border rounded-lg p-3 transition-all hover:shadow-md">
        <div className="flex gap-3">
          <Icon
            className={`${config.icon_color} mt-0.5 h-5 w-5 flex-shrink-0`}
          />
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title & Badges */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-card-foreground text-sm font-semibold leading-tight">
                {item.title}
              </h3>
              <div className="flex flex-shrink-0 gap-1.5">
                <span
                  className={`${config.badge} rounded px-2 py-0.5 text-xs font-semibold`}
                >
                  {item.severity}
                </span>
                {statusType === "active" && (
                  <span className="bg-success/20 text-success border border-success/30 rounded px-2 py-0.5 text-xs font-semibold">
                    Active
                  </span>
                )}
                {statusType === "upcoming" && (
                  <span className="bg-primary/20 text-primary border border-primary/30 rounded px-2 py-0.5 text-xs font-semibold">
                    Upcoming
                  </span>
                )}
                {statusType === "completed" && (
                  <span className="bg-muted text-muted-foreground border border-border rounded px-2 py-0.5 text-xs font-semibold">
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-xs leading-relaxed">
              {item.description}
            </p>

            {/* Time Info - Compact */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatUserDateTable(item.start_time)}
                </span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">
                  {formatUserDateTable(item.end_time)}
                </span>
              </div>
              {statusType === "active" && (
                <div className="flex items-center gap-1.5">
                  <Zap className={`h-3.5 w-3.5 ${config.icon_color}`} />
                  <span className={`${config.icon_color} font-semibold`}>
                    {getTimeRemaining(item.end_time)}
                  </span>
                </div>
              )}
              {statusType === "upcoming" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">
                    Starts {getTimeUntilStart(item.start_time)}
                  </span>
                </div>
              )}
              {statusType === "completed" && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-semibold">
                    Completed
                  </span>
                </div>
              )}
            </div>

            {/* Services Impacted - Highlighted */}
            {item.affected && item.affected.length > 0 && (
              <div className={`${config.badge} rounded-md p-2`}>
                <p className="mb-1 text-xs font-semibold">Impacted Services:</p>
                <div className="flex flex-wrap gap-1">
                  {item.affected.map((service, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-card/50 text-card-foreground rounded px-2 py-0.5 text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Dropdown */}
            <CalendarDropdown
              item={item}
              onDownloadICS={() => {
                const icsContent = generateICSEvent(item);
                downloadICS(icsContent, `${item.title}.ics`);
              }}
              onGoogleCalendar={() => {
                const googleUrl = getGoogleCalendarUrl(item);
                if (googleUrl) window.open(googleUrl, "_blank");
              }}
              onOutlookCalendar={() => {
                const outlookUrl = getOutlookCalendarUrl(item);
                if (outlookUrl) window.open(outlookUrl, "_blank");
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const OverallIcon = overallStatus.icon;

  const handleDownloadAllICS = () => {
    const icsContent = generateICSCalendar(allItems);
    downloadICS(icsContent, "all-maintenance-alerts.ics");
  };

  return (
    <div className="space-y-4 text-left p-4">
      <Breadcrumbs items={[{ name: "System Status", path: "/status" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-card-foreground text-2xl font-bold">
            System Status
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Current status and maintenance information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allItems.length > 0 && (
            <button
              onClick={handleDownloadAllICS}
              className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              title="Download all alerts as calendar file"
            >
              <Download className="h-4 w-4" />
              Export All
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/80 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px focus:outline-none cursor-pointer ${
            activeTab === "current"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Current Status
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px focus:outline-none cursor-pointer ${
            activeTab === "all"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Updates
        </button>
      </div>

      {activeTab === "current" ? (
        <div className="space-y-4">
          {/* Overall Status - Indicator Bar */}
          <div className="bg-card border-border rounded-lg border overflow-hidden text-left">
            <div className={`${overallStatus.indicatorColor} h-1 w-full`} />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${overallStatus.color}`}>
                  <OverallIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className={`${overallStatus.color} text-lg font-bold`}>
                    {overallStatus.label}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {activeItems.length > 0
                      ? `${activeItems.length} active ${activeItems.length === 1 ? "issue" : "issues"}`
                      : "All services running smoothly"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Issues */}
          {activeItems.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-4 text-left">
              <h3 className="text-card-foreground mb-3 text-sm font-semibold">
                Active Issues ({activeItems.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {activeItems.map((item, idx) => (
                  <StatusCard key={idx} item={item} isActive={true} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Maintenance */}
          {upcomingItems.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-4 text-left">
              <h3 className="text-card-foreground mb-3 text-sm font-semibold">
                Upcoming Maintenance ({upcomingItems.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {upcomingItems.map((item, idx) => (
                  <StatusCard key={idx} item={item} isActive={false} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeItems.length === 0 &&
            upcomingItems.length === 0 && (
              <div className="text-muted-foreground py-8 text-center bg-card border border-border rounded-lg">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50 text-success" />
                <p className="text-sm">No active or upcoming status updates at this time</p>
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show All List */}
          {allUpdatesItems.length > 0 ? (
            <div className="bg-card border-border rounded-lg border p-4 text-left">
              <h3 className="text-card-foreground mb-3 text-sm font-semibold">
                All Status Updates ({allUpdatesItems.length})
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {allUpdatesItems.map((item, idx) => (
                  <StatusCard key={idx} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center bg-card border border-border rounded-lg">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No status updates recorded at this time</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
