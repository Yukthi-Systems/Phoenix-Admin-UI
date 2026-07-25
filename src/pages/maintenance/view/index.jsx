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

import { useToastify } from "@/hooks/useToastify";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, Button, EditButton } from "@/components/common/Buttons";
import AccessDenied from "@/components/common/AccessDenied";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Server,
  User,
  Edit3,
  Activity,
  Timer,
  SquarePen,
} from "lucide-react";

const ViewMaintenanceStatus = () => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const navigate = useNavigate();
  const { maintenance_id } = useParams();
  const location = useLocation();

  const maintenanceDataFromState = location.state?.maintenanceData;
  const [maintenance, setMaintenance] = useState(null);
  const [isLoading, setIsLoading] = useState(!maintenanceDataFromState);

  useEffect(() => {
    if (maintenanceDataFromState) {
      setMaintenance(maintenanceDataFromState);
      setIsLoading(false);
    } else {
      // Simulate fetch
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [maintenanceDataFromState]);

  const handleEdit = () => {
    navigate(`/maintenance/edit/${maintenance_id}`, {
      state: { maintenanceData: maintenance },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Improved Design Configs with Dark Mode Support
  const getSeverityConfig = (severity) => {
    const config = {
      low: {
        className:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Low",
      },
      medium: {
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: <Info className="w-4 h-4" />,
        label: "Medium",
      },
      high: {
        className:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        icon: <AlertTriangle className="w-4 h-4" />,
        label: "High",
      },
      critical: {
        className: "bg-destructive/10 text-destructive border-destructive/20",
        icon: <XCircle className="w-4 h-4" />,
        label: "Critical",
      },
    };
    return (
      config[severity?.toLowerCase()] || {
        className: "bg-muted text-muted-foreground border-border",
        icon: <Info className="w-4 h-4" />,
        label: severity,
      }
    );
  };

  const getStatusConfig = (isActive) => {
    return isActive
      ? {
          className: "bg-primary/10 text-primary border-primary/20",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Active",
        }
      : {
          className: "bg-muted text-muted-foreground border-border",
          icon: <XCircle className="w-4 h-4" />,
          label: "Inactive",
        };
  };

  const calculateDuration = () => {
    if (!maintenance?.start_time || !maintenance?.end_time) return "N/A";
    const start = new Date(maintenance.start_time);
    const end = new Date(maintenance.end_time);
    const duration = end - start;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeStatus = () => {
    if (!maintenance) return null;
    const now = new Date();
    const start = new Date(maintenance.start_time);
    const end = new Date(maintenance.end_time);

    if (now < start)
      return {
        status: "Scheduled",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    if (now >= start && now <= end)
      return {
        status: "Ongoing",
        className:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 animate-pulse",
      };
    return {
      status: "Completed",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    };
  };

  if (!permissions.includes("internal_action:view")) {
    return (
      <AccessDenied content="You don't have permission to view maintenance status" />
    );
  }

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="w-full h-full px-4 py-4 overflow-hidden space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-9 w-24 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-40 w-full bg-card border border-border rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="h-64 bg-card border border-border rounded-xl animate-pulse"></div>
          </div>
          <div className="h-64 bg-card border border-border rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="bg-muted/30 p-4 rounded-full">
          <Info className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Maintenance Not Found
          </h3>
          <p className="text-muted-foreground">
            The requested record could not be located.
          </p>
        </div>
        <BackButton />
      </div>
    );
  }

  const severityConfig = getSeverityConfig(maintenance.severity);
  const statusConfig = getStatusConfig(maintenance.is_active);
  const timeStatus = getTimeStatus();

  return (
    <div className="w-full text-left h-full overflow-y-auto custom-scrollbar">
      {/* Header Section */}

      <div className="mb-3 flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[
              { name: "Maintenance" },
              { name: "Status", link: `/maintenance` },
              { name: "View Details" },
            ]}
          />
        </div>

        <div className="flex flex-row gap-2 justify-center items-center">
          {permissions.includes("internal_action:edit") && (
            <Button onClick={handleEdit} variant="primary" icon={SquarePen}>
              Edit Maintenance
            </Button>
          )}
        </div>
      </div>

      <div className="w-full mx-auto space-y-6 max-w-[1800px]">
        {/* Main Header Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {maintenance.title}
                </h1>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
                {timeStatus && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${timeStatus.className}`}
                  >
                    <Activity className="w-3 h-3" />
                    {timeStatus.status}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <span className="px-2 py-1 bg-muted rounded text-xs uppercase tracking-wider">
                  {maintenance.type || "General"}
                </span>
                <span className="text-sm">
                  • ID: {maintenance_id || "Unknown"}
                </span>
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${severityConfig.className} bg-opacity-10`}
            >
              <div className="p-1.5 bg-background/50 rounded-full shadow-sm">
                {severityConfig.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase opacity-80">
                  Severity
                </p>
                <p className="font-bold">{severityConfig.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Description
                </h2>
              </div>
              <div className="p-6">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {maintenance.description ||
                    "No detailed description provided."}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Schedule & Timeline
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Start Time
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatDate(maintenance.start_time)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      End Time
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatDate(maintenance.end_time)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-background border border-border flex flex-col items-center text-center space-y-2">
                  <div className="p-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {calculateDuration()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Affected Services */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Affected Services
                </h2>
              </div>
              <div className="p-6">
                {maintenance.affected && maintenance.affected.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {maintenance.affected.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-1.5 rounded bg-muted">
                          <Server className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Server className="w-10 h-10 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No specific services listed
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Info */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Audit Log
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium text-foreground">
                    {maintenance.created_by || "System"}
                  </span>
                </div>
                <div className="h-px bg-border w-full" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium text-foreground">
                    {formatDate(maintenance.created_at)}
                  </span>
                </div>
                {maintenance.updated_at && (
                  <>
                    <div className="h-px bg-border w-full" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(maintenance.updated_at)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMaintenanceStatus;
