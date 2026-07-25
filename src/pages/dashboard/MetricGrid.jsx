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

// src/components/dashboard/MetricsGrid.jsx
import { HardDrive, Globe, Mail, Users, AlertCircle } from "lucide-react";
import { formatNumber, formatPercentage } from "@/utils/numberFormat";

const MetricsGrid = ({
  processedData,
  organizationSpace,
  domains,
  mailboxesSpace,
  totalUsers,
}) => {
  // Enhanced Metric Card Component
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    loading,
    error,
    subValue,
    errorMessage,
  }) => (
    <div className="bg-card border border-border rounded-lg shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative z-10 p-6">
        <div className="flex items-center w-full justify-between mb-4">
          <div className="flex items-center justify-center w-full space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="space-y-3">
              <div className="h-8 w-20 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          ) : error ? (
            <div className="space-y-2">
              {/* <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div> */}
              <p className="text-xs text-muted-foreground">
                {errorMessage || "Failed to load data"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-card-foreground leading-none">
                {value || "0"}
              </div>
              {subValue && (
                <p className="text-sm text-muted-foreground leading-tight">
                  {subValue}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Organization Space"
        value={`${processedData.orgQuotaAllocated} GB`}
        subValue={`${processedData.orgQuotaUtilized} GB used (${formatPercentage(processedData.orgQuotaUtilized, processedData.orgQuotaAllocated)})`}
        icon={HardDrive}
        loading={organizationSpace.isLoading}
        error={organizationSpace.isError}
        errorMessage="Failed to load organization space data"
      />

      <MetricCard
        title="Total Domains"
        value={formatNumber(processedData.totalDomains)}
        subValue={`${processedData.totalActiveDomains} active, ${processedData.totalInactiveDomains} inactive`}
        icon={Globe}
        loading={domains?.isLoading}
        error={domains?.isError}
        errorMessage="Failed to load domains data"
      />

      <MetricCard
        title="Total Mailboxes"
        value={formatNumber(processedData.totalMailboxes)}
        subValue={`${processedData.totalActiveMailboxes} active, ${processedData.totalInactiveMailboxes} inactive`}
        icon={Mail}
        loading={mailboxesSpace.isLoading}
        error={mailboxesSpace.isError}
        errorMessage="Failed to load mailboxes data"
      />

      <MetricCard
        title="Total Users"
        value={formatNumber(processedData.totalUsersCount)}
        subValue="System users"
        icon={Users}
        loading={totalUsers.isLoading}
        error={totalUsers.isError}
        errorMessage="Failed to load users data"
      />
    </div>
  );
};

export default MetricsGrid;
