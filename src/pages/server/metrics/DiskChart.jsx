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

import React, { useMemo, useState, useCallback } from "react";
import Plot from "react-plotly.js";
import {
  HardDrive,
  Activity,
  TrendingUp,
  Clock,
  RotateCcw,
  Download,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { uiInfoAtom } from "@/store/uiInfo";

const PlotlyDiskMetricsChart = ({ data, isLoading }) => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    diskUsed: true,
    diskFree: true,
    diskPercent: true,
  });
  const [plotRevision, setPlotRevision] = useState(0);
  const uiInfoDetails = useAtomValue(uiInfoAtom);
  const isDarkMode = uiInfoDetails?.theme?.mode == "dark" ? true : false;

  const { chartData, layout, config } = useMemo(() => {
    if (!data?.metrics?.length)
      return { chartData: [], layout: {}, config: {} };

    let metrics = data.metrics;

    const timestamps = metrics.map((m) => new Date(m.interval_start));
    const diskTotalValues = metrics.map((m) =>
      parseFloat(m.avg_disk_total_gb?.toFixed(0)),
    );
    const diskUsedValues = metrics.map((m) =>
      parseFloat(m.avg_disk_used_gb?.toFixed(1)),
    );
    const diskFreeValues = metrics.map((m) =>
      parseFloat(m.avg_disk_free_gb?.toFixed(0)),
    );
    const diskPercentValues = metrics.map((m) =>
      parseFloat(m.avg_disk_percent?.toFixed(2)),
    );

    // Create traces
    const traces = [];

    // Disk Used Storage Area
    if (selectedMetrics.diskUsed) {
      traces.push({
        x: timestamps,
        y: diskUsedValues,
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        name: "Used Storage (GB)",
        yaxis: "y",
        line: {
          color: "hsl(0, 62%, 50%)",
          width: 2.5,
        },
        fillcolor: "hsla(0, 62%, 50%, 0.12)",
        hovertemplate:
          "<b>🔴 Used Storage</b><br>" +
          "Used: %{y:.1f} GB<br>" +
          "<extra></extra>",
        hoverlabel: {
          bgcolor: isDarkMode
            ? "rgba(23, 23, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          bordercolor: isDarkMode
            ? "rgba(75, 85, 99, 0.5)"
            : "rgba(203, 213, 225, 0.8)",
          font: {
            color: isDarkMode ? "#ffffff" : "#1f2937",
            family: "system-ui, -apple-system, sans-serif",
          },
        },
      });
    }

    // Disk Free Storage Area
    if (selectedMetrics.diskFree) {
      traces.push({
        x: timestamps,
        y: diskFreeValues,
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        name: "Free Storage (GB)",
        yaxis: "y",
        line: {
          color: "hsl(142, 71%, 45%)",
          width: 2,
        },
        fillcolor: "hsla(142, 71%, 45%, 0.08)",
        hovertemplate:
          "<b>🟢 Free Storage</b><br>" +
          "Free: %{y:.0f} GB<br>" +
          "<extra></extra>",
        hoverlabel: {
          bgcolor: isDarkMode
            ? "rgba(23, 23, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          bordercolor: isDarkMode
            ? "rgba(75, 85, 99, 0.5)"
            : "rgba(203, 213, 225, 0.8)",
          font: {
            color: isDarkMode ? "#ffffff" : "#1f2937",
            family: "system-ui, -apple-system, sans-serif",
          },
        },
      });
    }

    // Disk Usage Percentage Line
    if (selectedMetrics.diskPercent) {
      traces.push({
        x: timestamps,
        y: diskPercentValues,
        type: "scatter",
        mode: "lines",
        name: "Usage (%)",
        yaxis: "y2",
        line: {
          color: "hsl(271, 91%, 65%)",
          width: 2.5,
        },
        opacity: 0.9,
        hovertemplate:
          "<b>🟣 Disk Usage</b><br>" +
          "Usage: %{y:.2f}%<br>" +
          "<extra></extra>",
        hoverlabel: {
          bgcolor: isDarkMode
            ? "rgba(23, 23, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          bordercolor: isDarkMode
            ? "rgba(75, 85, 99, 0.5)"
            : "rgba(203, 213, 225, 0.8)",
          font: {
            color: isDarkMode ? "#ffffff" : "#1f2937",
            family: "system-ui, -apple-system, sans-serif",
          },
        },
      });
    }

    // High usage threshold line (85%)
    traces.push({
      x: timestamps,
      y: new Array(timestamps.length).fill(85),
      type: "scatter",
      mode: "lines",
      name: "High Usage Warning",
      yaxis: "y2",
      line: {
        color: "hsl(0, 62%, 50%)",
        width: 1.5,
        dash: "dash",
      },
      opacity: 0.4,
      hoverinfo: "skip",
      showlegend: false,
    });

    // Layout configuration
    const plotLayout = {
      title: {
        text: "Disk Storage Usage Overview",
        font: {
          size: 16,
          color: isDarkMode ? "#ffffff" : "#1f2937",
          family: "system-ui, -apple-system, sans-serif",
        },
        x: 0.02,
      },
      xaxis: {
        title: {
          text: "Time",
          font: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
        },
        linecolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickcolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickfont: { color: isDarkMode ? "#9ca3af" : "#6b7280" },
        showgrid: false,
        showspikes: true,
        spikethickness: 1,
        spikecolor: isDarkMode ? "#8b5cf6" : "#7c3aed",
        spikesnap: "cursor",
        spikemode: "across",
      },
      yaxis: {
        title: {
          text: "Storage (GB)",
          font: { color: "hsl(0, 62%, 50%)" },
        },
        side: "right",
        linecolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickcolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickfont: { color: "hsl(0, 62%, 50%)" },
        showgrid: false,
        ticksuffix: " GB",
        domain: [0, Math.max(100, Math.max(...diskTotalValues) + 50)],
        showspikes: true,
        spikethickness: 1,
        spikecolor: "hsl(0, 62%, 50%)",
        zeroline: false,
        width: 45,
      },
      yaxis2: {
        title: {
          text: "Usage (%)",
          font: { color: "hsl(271, 91%, 65%)" },
        },
        overlaying: "y",
        side: "left",
        tickfont: { color: "hsl(271, 91%, 65%)" },
        showgrid: false,
        zeroline: false,
        ticksuffix: "%",
        domain: [0, Math.max(100, Math.max(...diskPercentValues) + 2)],
        width: 40,
      },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "system-ui, -apple-system, sans-serif",
        color: isDarkMode ? "#ffffff" : "#1f2937",
      },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "right",
        x: 1,
        bgcolor: "rgba(0,0,0,0)",
        font: { color: isDarkMode ? "#ffffff" : "#1f2937" },
      },
      hovermode: "x unified",
      hoverlabel: {
        bgcolor: isDarkMode
          ? "rgba(23, 23, 23, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        bordercolor: isDarkMode
          ? "rgba(75, 85, 99, 0.5)"
          : "rgba(203, 213, 225, 0.8)",
        font: {
          color: isDarkMode ? "#ffffff" : "#1f2937",
          family: "system-ui, -apple-system, sans-serif",
        },
      },
      margin: {
        l: 60,
        r: 60,
        t: 80,
        b: 50,
      },
    };

    // Configuration
    const plotConfig = {
      displayModeBar: true,
      modeBarButtonsToAdd: [
        {
          name: "Download Data",
          icon: {
            width: 1792,
            height: 1792,
            path: "M1344 1344q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h465l135 136q58 56 136 56t136-56l136-136h464q40 0 68 28t28 68zm-325-569q17 41-14 70l-448 448q-18 19-45 19t-45-19l-448-448q-31-29-14-70 17-39 59-39h256v-448q0-26 19-45t45-19h256q26 0 45 19t19 45v448h256q42 0 59 39z",
          },
          click: function (gd) {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              "Time,Total Storage (GB),Used Storage (GB),Free Storage (GB),Usage (%)\n" +
              metrics
                .map(
                  (m) =>
                    `${new Date(m.interval_start).toISOString()},${m.avg_disk_total_gb},${m.avg_disk_used_gb},${m.avg_disk_free_gb},${m.avg_disk_percent}`,
                )
                .join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "disk_metrics.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
        },
      ],
      modeBarButtonsToRemove: [],
      displaylogo: false,
      toImageButtonOptions: {
        format: "png",
        filename: "disk_metrics",
        height: 500,
        width: 1000,
        scale: 2,
      },
      responsive: true,
    };

    return {
      chartData: traces,
      layout: plotLayout,
      config: plotConfig,
    };
  }, [data, selectedMetrics, isDarkMode]);

  const toggleMetric = useCallback((metric) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
    setPlotRevision((prev) => prev + 1);
  }, []);

  const resetView = useCallback(() => {
    const plotElement = document.querySelector(".js-plotly-plot");
    if (plotElement) {
      window.Plotly.relayout(plotElement, {
        "xaxis.autorange": true,
        "yaxis.autorange": true,
        "yaxis2.autorange": true,
      });
    }
  }, []);

  // Quick Stats Component
  const QuickStats = () => {
    if (!data?.metrics?.length) return null;

    const diskUsedValues = data.metrics.map((m) => m.avg_disk_used_gb);
    const diskPercentValues = data.metrics.map((m) => m.avg_disk_percent);
    const avgUsed = (
      diskUsedValues.reduce((a, b) => a + b, 0) / diskUsedValues.length
    ).toFixed(1);
    const avgPercent = (
      diskPercentValues.reduce((a, b) => a + b, 0) / diskPercentValues.length
    ).toFixed(1);
    const totalDisk = data.metrics[0]
      ? data.metrics[0].avg_disk_total_gb.toFixed(1)
      : 0;

    return (
      <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-500" />
          <span className="text-muted-foreground">Total Capacity:</span>
          <span className="font-medium text-foreground">{totalDisk} GB</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <span className="text-muted-foreground">Avg Used:</span>
          <span className="font-medium text-foreground">{avgUsed} GB</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span className="text-muted-foreground">Avg Usage:</span>
          <span className="font-medium text-foreground">{avgPercent}%</span>
        </div>
      </div>
    );
  };

  const ControlPanel = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show:</span>
          {Object.entries(selectedMetrics).map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                enabled
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary"
              }`}
            >
              {key === "diskUsed"
                ? "Used"
                : key === "diskFree"
                  ? "Free"
                  : "Usage %"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={resetView}
          className="p-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-80">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading disk metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.metrics?.length) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <HardDrive className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No Disk Data Available
          </h3>
          <p className="text-sm text-muted-foreground">
            Disk usage and capacity metrics will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 text-left">
            Disk Storage Usage Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Storage capacity utilization and available space metrics
          </p>
        </div>
      </div>

      <QuickStats />
      <ControlPanel />

      <div className="h-96 w-full border border-border rounded-lg overflow-hidden">
        <Plot
          data={chartData}
          layout={layout}
          config={config}
          revision={plotRevision}
          style={{ width: "100%", height: "100%" }}
          useResizeHandler={true}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {data.total_records} total records • Storage capacity in GB
          </span>
          <span className="flex items-center gap-2">
            <Download className="w-3 h-3" />
            Use toolbar to download chart or export data
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlotlyDiskMetricsChart;
