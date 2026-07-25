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

import React, { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Cpu, Activity, TrendingUp, Clock } from "lucide-react";

const ServerMetricsChart = ({ data, isLoading }) => {
  const chartData = useMemo(() => {
    if (!data?.metrics?.length) return [];

    let metrics = data.metrics;

    if (metrics.length > 50) {
      const step = Math.ceil(metrics.length / 40);
      metrics = metrics.filter((_, index) => index % step === 0);

      if (!metrics.includes(data.metrics[data.metrics.length - 1])) {
        metrics.push(data.metrics[data.metrics.length - 1]);
      }
    }

    return metrics.map((metric, index) => ({
      time: new Date(metric.interval_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullTime: new Date(metric.interval_start).toLocaleString(),
      cpu: parseFloat(metric.avg_cpu_percent?.toFixed(2)),
      load1: parseFloat(metric.avg_load_avg_1?.toFixed(2)),
      load5: parseFloat(metric.avg_load_avg_5?.toFixed(2)),
      load15: parseFloat(metric.avg_load_avg_15?.toFixed(2)),
      index,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl min-w-48">
          <div className="font-medium text-foreground mb-3 text-sm flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {data.fullTime}
          </div>
          <div className="space-y-2">
            {/* CPU Usage */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">CPU Usage</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.cpu}%
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">
                  Load Avg 1m
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.load1}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">
                  Load Avg 5m
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.load5}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">
                  Load Avg 15m
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {data.load15}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const QuickStats = () => {
    if (!chartData.length) return null;

    const cpuValues = chartData.map((d) => d.cpu);
    const load1Values = chartData.map((d) => d.load1);
    const avgCpu = (
      cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
    )?.toFixed(1);
    const maxCpu = Math.max(...cpuValues)?.toFixed(1);
    const avgLoad1 = (
      load1Values.reduce((a, b) => a + b, 0) / load1Values.length
    )?.toFixed(2);

    return (
      <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">CPU Avg:</span>
          <span className="font-medium text-foreground">{avgCpu}%</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-destructive" />
          <span className="text-muted-foreground">CPU Peak:</span>
          <span className="font-medium text-foreground">{maxCpu}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-muted-foreground">Load Avg:</span>
          <span className="font-medium text-foreground">{avgLoad1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Points:</span>
          <span className="font-medium text-foreground">
            {chartData.length}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-80">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.metrics?.length) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No Data Available
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a server and date range to view metrics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Performance Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            CPU usage and system load metrics (hover for all values)
          </p>
        </div>

        {/* Updated Legend for all 4 metrics */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary"></div>
            <span className="text-muted-foreground">CPU %</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></div>
            <span className="text-muted-foreground">Load 1m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500"></div>
            <span className="text-muted-foreground">Load 5m</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500"></div>
            <span className="text-muted-foreground">Load 15m</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Chart with all 4 metrics */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 10,
            }}
          >
            {/* Subtle Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.2}
              vertical={false}
            />

            {/* Clean X Axis */}
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickMargin={8}
            />

            {/* Left Y Axis - CPU */}
            <YAxis
              yAxisId="cpu"
              orientation="left"
              stroke="hsl(var(--primary))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(value)}%`}
              domain={["dataMin - 2", "dataMax + 5"]}
              width={35}
              tickCount={6}
            />

            {/* Right Y Axis - Load */}
            <YAxis
              yAxisId="load"
              orientation="right"
              stroke="hsl(142, 71%, 45%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 0.1", "dataMax + 0.2"]}
              width={35}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* CPU Area Chart with soft background */}
            <Area
              yAxisId="cpu"
              type="monotone"
              dataKey="cpu"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "hsl(var(--primary))",
                strokeWidth: 2,
              }}
            />

            {/* Load Average 1m - Primary visible line with soft area */}
            <Area
              yAxisId="load"
              type="monotone"
              dataKey="load1"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="hsl(142, 71%, 45%)"
              fillOpacity={0.08}
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
            />

            {/* Load Average 5m - Subtle line, visible on hover */}
            <Line
              yAxisId="load"
              type="monotone"
              dataKey="load5"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              dot={false}
              activeDot={{ r: 3, stroke: "hsl(38, 92%, 50%)", strokeWidth: 2 }}
            />

            {/* Load Average 15m - Subtle line, visible on hover */}
            <Line
              yAxisId="load"
              type="monotone"
              dataKey="load15"
              stroke="hsl(0, 62%, 50%)"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              dot={false}
              activeDot={{ r: 3, stroke: "hsl(0, 62%, 50%)", strokeWidth: 2 }}
            />

            {/* Reference line for high CPU */}
            <ReferenceLine
              yAxisId="cpu"
              y={80}
              stroke="hsl(var(--destructive))"
              strokeDasharray="2 4"
              strokeOpacity={0.4}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Minimal Footer Info */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {data.total_records} total records • {data.interval} intervals
          </span>
          <span>
            {chartData.length < data.total_records &&
              `Showing ${chartData.length} of ${data.total_records} points`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServerMetricsChart;
