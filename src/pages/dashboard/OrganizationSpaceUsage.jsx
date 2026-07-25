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

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { AlertCircle, Info, Activity } from "lucide-react";

const OrganizationSpaceUsage = ({
  processedData,
  organizationSpace,
  theme,
}) => {
  const ChartCard = ({
    title,
    children,
    loading,
    error,
    errorMessage,
    info,
  }) => (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            {title}
          </h3>
          {info && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              <Info className="h-3 w-3" />
              <span>{info}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="h-64 w-full rounded bg-muted animate-pulse" />
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {errorMessage || "Error loading chart data"}
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );

  // Empty Chart Component
  const EmptyChart = ({ message = "No data available" }) => (
    <div className="h-64 flex flex-col items-center justify-center space-y-3">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground text-sm">{message}</span>
    </div>
  );

  return (
    <ChartCard
      title="Organization Space Usage"
      loading={organizationSpace.isLoading}
      error={organizationSpace.isError}
      errorMessage="Failed to load organization space data"
    >
      {processedData.orgSpaceBreakdown.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={processedData.orgSpaceBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value} GB`}
              outerRadius={100}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {processedData.orgSpaceBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--card-foreground))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{
                color: "hsl(var(--card-foreground))",
                fontSize: "12px",
                fontWeight: "500",
              }}
              formatter={(value, name) => [`${value} GB`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="No organization space data" />
      )}
    </ChartCard>
  );
};

export default OrganizationSpaceUsage;