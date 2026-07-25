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
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  Wrench,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { parseISO, isAfter } from "date-fns";
import { dismissedAlertsAtom } from "@/store/maintainence";
import { useUserTimezone } from "@/hooks/useTimezone";

const MaintenanceHeaderAlert = ({ statusData }) => {
  const [dismissedAlerts, setDismissedAlerts] = useAtom(dismissedAlertsAtom);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedIndices, setViewedIndices] = useState(new Set([0]));
  const navigate = useNavigate();
  const { formatUserDateTable } = useUserTimezone();

  if (!statusData?.data?.length) return null;

  const now = new Date();
  const relevantAlerts = statusData.data.filter((status) => {
    try {
      const endTime = parseISO(status.end_time);
      const isNotCompleted = isAfter(endTime, now);
      const isDismissed = dismissedAlerts.includes(status.title);
      return isNotCompleted && !isDismissed;
    } catch {
      return false;
    }
  });

  if (relevantAlerts.length === 0) return null;

  const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

  // Sort alerts by severity
  relevantAlerts.sort((a, b) => {
    return (
      (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999)
    );
  });

  const currentAlert = relevantAlerts[currentIndex];

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % relevantAlerts.length;
    setCurrentIndex(nextIndex);
    setViewedIndices((prev) => new Set([...prev, nextIndex]));
    setExpandedAlert(null);
  };

  const goToPrevious = () => {
    const prevIndex =
      (currentIndex - 1 + relevantAlerts.length) % relevantAlerts.length;
    setCurrentIndex(prevIndex);
    setViewedIndices((prev) => new Set([...prev, prevIndex]));
    setExpandedAlert(null);
  };

  const handleDismiss = () => {
    const viewedAlertTitles = Array.from(viewedIndices).map(
      (idx) => relevantAlerts[idx].title,
    );
    setDismissedAlerts([...dismissedAlerts, ...viewedAlertTitles]);
    setCurrentIndex(0);
    setViewedIndices(new Set([0]));
    setExpandedAlert(null);
  };

  const toggleExpand = () => {
    setExpandedAlert(isExpanded ? null : currentAlert.title);
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      CRITICAL: {
        icon: AlertCircle,
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        iconColor: "text-destructive",
        textColor: "text-destructive",
        hoverBg: "hover:bg-destructive/20",
      },
      HIGH: {
        icon: AlertTriangle,
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
        iconColor: "text-warning",
        textColor: "text-warning",
        hoverBg: "hover:bg-warning/20",
      },
      MEDIUM: {
        icon: Info,
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
        iconColor: "text-primary",
        textColor: "text-primary",
        hoverBg: "hover:bg-primary/20",
      },
      LOW: {
        icon: Wrench,
        bgColor: "bg-muted",
        borderColor: "border-border",
        iconColor: "text-muted-foreground",
        textColor: "text-muted-foreground",
        hoverBg: "hover:bg-accent",
      },
    };
    return configs[severity] || configs.LOW;
  };

  const config = getSeverityConfig(currentAlert.severity);
  const Icon = config.icon;

  const startTime = parseISO(currentAlert.start_time);
  const isUpcoming = isAfter(startTime, now);
  const statusLabel = isUpcoming ? "Upcoming" : "Active Now";
  const statusBadgeColor = isUpcoming
    ? "bg-primary/20 text-primary"
    : "bg-warning/20 text-warning";

  const isExpanded = expandedAlert === currentAlert.title;

  return (
    // Added bg-card to ensure opacity doesn't show elements underneath, shadow-md for elevation
    <div className="bg-card w-full ">
      {" "}
      <div
        className={`relative ${config.bgColor} ${config.borderColor} rounded-md border shadow-lg transition-all duration-200`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-start gap-4 text-left">
            <div className={`${config.iconColor} mt-1 flex-shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>

            <div
              className="min-w-0 flex-1 cursor-pointer space-y-2"
              onClick={toggleExpand}
            >
              <div className="flex flex-wrap items-center gap-2 text-left">
                <h3 className="text-card-foreground text-left text-base leading-tight font-semibold">
                  {currentAlert.title}
                </h3>

                <span
                  className={`${statusBadgeColor} inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase`}
                >
                  {statusLabel}
                </span>

                <span
                  className={`${config.textColor} inline-flex items-center rounded-md border ${config.borderColor} bg-card px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase`}
                >
                  {currentAlert.severity}
                </span>
              </div>

              <p className="text-muted-foreground text-left text-sm leading-relaxed">
                {currentAlert.description}
              </p>

              {isExpanded && (
                <div
                  className="border-border bg-card shadow-sm space-y-3 rounded-lg border p-3 text-left z-10 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-left text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">
                        Start:
                      </span>
                      <span className="text-card-foreground font-mono">
                        {formatUserDateTable(currentAlert.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">
                        End:
                      </span>
                      <span className="text-card-foreground font-mono">
                        {formatUserDateTable(currentAlert.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">
                        Type:
                      </span>
                      <span className="text-card-foreground">
                        {currentAlert.type}
                      </span>
                    </div>
                  </div>

                  {currentAlert.affected &&
                    currentAlert.affected.length > 0 && (
                      <div className="space-y-2 text-left">
                        <p className="text-card-foreground text-left text-xs font-semibold tracking-wide uppercase">
                          Services Impacted
                        </p>
                        <ul className="grid gap-2 text-xs sm:grid-cols-2">
                          {currentAlert.affected.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-muted-foreground flex items-start gap-2 text-left"
                            >
                              <span
                                className={`${config.iconColor} mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full`}
                              />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => {
                  handleDismiss();
                  navigate("/status");
                }}
                className="text-primary hover:bg-primary/10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                View Status
              </button>

              {relevantAlerts.length > 1 && (
                <div className="bg-background/80 border border-border flex items-center gap-1 rounded-md px-2 py-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="text-foreground hover:bg-accent rounded-md p-1 transition-colors"
                    aria-label="Previous alert"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-muted-foreground min-w-max px-1 text-xs font-medium">
                    {currentIndex + 1} of {relevantAlerts.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="text-foreground hover:bg-accent rounded-md p-1 transition-colors"
                    aria-label="Next alert"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
                aria-label="Toggle details"
                title="View details"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {/* High Visibility Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className={`text-foreground ${config.hoverBg} border border-transparent hover:border-${config.borderColor} rounded-md p-1.5 transition-all duration-200`}
                aria-label={`Dismiss ${viewedIndices.size} viewed ${viewedIndices.size === 1 ? "alert" : "alerts"}`}
                title={`Dismiss ${viewedIndices.size} viewed ${viewedIndices.size === 1 ? "alert" : "alerts"}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHeaderAlert;
