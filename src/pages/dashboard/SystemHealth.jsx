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

import { Shield, AlertCircle } from "lucide-react";

const SystemHealth = ({ systemStatus }) => {
  // Extract data directly from API response
  const systemData = systemStatus?.data?.data || {};
  const overallStatus = systemStatus?.data?.status || "UNKNOWN";
  const overallMessage = systemStatus?.data?.message || "System Status Unknown";

  // System status helper functions
  const getSystemStatusName = (key) => {
    const statusMap = {
      main_db_status: "Database",
      queue_status: "Message Queue",
      cache_status: "Cache System",
      api_status: "API Services",
      notifications_status: "Notifications",
      metrics_db_status: "Metrics Database",
      logging_db_status: "Logging Database",
    };
    return (
      statusMap[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "OK":
        return "bg-success/10 text-success";
      case "ERROR":
      case "FAILED":
        return "bg-destructive/10 text-destructive";
      case "WARNING":
        return "bg-warning/10 text-warning";
      default:
        return "bg-destructive/10 text-destructive";
    }
  };

  const systemEntries = Object.entries(systemData);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
            <Shield className="h-5 w-5" />
            System Health
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(overallStatus)}`}
            >
              {systemStatus?.isError ? "Unknown" : overallMessage}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {systemStatus?.isError || systemStatus?.isLoading ? (
          <div className="flex items-center justify-center py-6 space-x-2">
            {systemStatus?.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">
                  Loading system status...
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-muted-foreground">
                  Unable to fetch system status
                </span>
              </>
            )}
          </div>
        ) : systemEntries.length === 0 ? (
          <div className="flex items-center justify-center py-6 space-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              No system status data available
            </span>
          </div>
        ) : (
          <>
            {/* Desktop view - Two row grid layout */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {systemEntries.map(([key, status]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-1 bg-muted/20 rounded-lg h-full"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${status?.toUpperCase() === "OK" ? "bg-success" : "bg-destructive"}`}
                    ></div>
                    <span className="text-sm font-medium text-card-foreground">
                      {getSystemStatusName(key)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            {/* Medium screens - Two columns */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
              {systemEntries.map(([key, status]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${status?.toUpperCase() === "OK" ? "bg-success" : "bg-destructive"}`}
                    ></div>
                    <span className="text-sm font-medium text-card-foreground">
                      {getSystemStatusName(key)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile view - Single column */}
            <div className="md:hidden grid gap-3 grid-cols-1">
              {systemEntries.map(([key, status]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${status?.toUpperCase() === "OK" ? "bg-success" : "bg-destructive"}`}
                    ></div>
                    <span className="text-sm font-medium text-card-foreground">
                      {getSystemStatusName(key)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
