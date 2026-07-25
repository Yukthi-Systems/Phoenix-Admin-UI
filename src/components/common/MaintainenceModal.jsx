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

import { X, AlertCircle, AlertTriangle, Info, Wrench } from "lucide-react";
import { useAtom } from "jotai";
import {
  dismissedAlertsAtom,
  showMaintenancePopupAtom,
} from "@/store/maintainence";
import { useUserTimezone } from "@/hooks/useTimezone";
import { parseISO, isAfter } from "date-fns";
import { useNavigate } from "react-router-dom";

const MaintenancePopup = ({ statusData }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useAtom(showMaintenancePopupAtom);
  const [dismissedAlerts, setDismissedAlerts] = useAtom(dismissedAlertsAtom);
  const { formatUserDateTable } = useUserTimezone();

  if (!showPopup || !statusData?.data?.length) return null;
  const now = new Date();

  const relevantAlerts = statusData.data.filter((status) => {
    try {
      const endTime = parseISO(status.end_time);
      const isNotCompleted = isAfter(endTime, now);
      const isNotDismissed = !dismissedAlerts.includes(status.title);
      return isNotCompleted && isNotDismissed;
    } catch {
      return !dismissedAlerts.includes(status.title);
    }
  });

  if (relevantAlerts.length === 0) {
    setShowPopup(false);
    return null;
  }

  const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };

  // Sort alerts by severity
  relevantAlerts.sort((a, b) => {
    return (
      (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999)
    );
  });

  const getSeverityConfig = (severity) => {
    const configs = {
      CRITICAL: {
        icon: AlertCircle,
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        iconColor: "text-destructive",
        textColor: "text-destructive",
      },
      HIGH: {
        icon: AlertTriangle,
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
        iconColor: "text-warning",
        textColor: "text-warning",
      },
      MEDIUM: {
        icon: Info,
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
        iconColor: "text-primary",
        textColor: "text-primary",
      },
      LOW: {
        icon: Wrench,
        bgColor: "bg-muted",
        borderColor: "border-border",
        iconColor: "text-muted-foreground",
        textColor: "text-muted-foreground",
      },
    };
    return configs[severity] || configs.LOW;
  };

  const handleDismiss = (title) => {
    setDismissedAlerts([...dismissedAlerts, title]);
    if (relevantAlerts.length === 1) {
      setShowPopup(false);
    }
  };

  const handleDismissAll = () => {
    setDismissedAlerts([
      ...dismissedAlerts,
      ...relevantAlerts.map((alert) => alert.title),
    ]);
    setShowPopup(false);
  };

  const handleViewStatusPage = () => {
    setDismissedAlerts([
      ...dismissedAlerts,
      ...relevantAlerts.map((alert) => alert.title),
    ]);
    navigate("/status");
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-[100] flex items-center justify-center p-4 text-left backdrop-blur-sm">
      <div className="bg-card border-border relative w-full max-w-2xl rounded-2xl border shadow-2xl">
        <div className="border-border flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-card-foreground text-xl font-semibold">
                System Status Alerts
              </h2>
              <p className="text-muted-foreground text-sm">
                {relevantAlerts.length}{" "}
                {relevantAlerts.length === 1 ? "alert" : "alerts"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar max-h-[60vh] space-y-4 overflow-y-auto p-6">
          {relevantAlerts.map((status, index) => {
            const config = getSeverityConfig(status.severity);
            const Icon = config.icon;

            const startTime = parseISO(status.start_time);
            const isUpcoming = startTime > now;
            const statusLabel = isUpcoming ? "Upcoming" : "Active";
            const statusColor = isUpcoming ? "text-primary" : "text-warning";

            return (
              <div
                key={index}
                className={`${config.bgColor} ${config.borderColor} relative rounded-lg border p-4`}
              >
                {/* <button
                  onClick={() => handleDismiss(status.title)}
                  className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded-md p-1 transition-colors"
                  aria-label="Dismiss this alert"
                >
                  <X className="h-4 w-4" />
                </button> */}

                <div className="flex gap-3 pr-8">
                  <div className={`${config.iconColor} mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-card-foreground font-semibold">
                          {status.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {status.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`${statusColor} inline-flex items-center rounded-full border ${config.borderColor} bg-card px-2.5 py-0.5 text-xs font-bold`}
                      >
                        {statusLabel}
                      </span>
                      <span
                        className={`${config.textColor} inline-flex items-center rounded-full border ${config.borderColor} px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {status.type}
                      </span>
                      <span
                        className={`${config.textColor} inline-flex items-center rounded-full border ${config.borderColor} px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {status.severity}
                      </span>
                    </div>

                    <div className="text-muted-foreground space-y-1 text-xs">
                      <div>
                        <span className="font-medium">Start:</span>{" "}
                        {formatUserDateTable(status.start_time)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span>{" "}
                        {formatUserDateTable(status.end_time)}
                      </div>
                    </div>

                    {status.affected && status.affected.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">
                          Services Impacted:
                        </p>
                        <ul className="text-muted-foreground space-y-0.5 text-xs">
                          {status.affected.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-border flex items-center justify-between border-t p-4">
          <button
            onClick={handleViewStatusPage}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            View Full Status Page
          </button>
          <button
            onClick={handleDismissAll}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePopup;
