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
  Database,
  ArrowDown,
  ArrowUp,
  Clock,
  Activity,
  RotateCcw,
  Download,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { uiInfoAtom } from "@/store/uiInfo";

const DiskIOMetricsChart = ({ data, isLoading }) => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    diskRead: true,
    diskWrite: true,
  });
  const [plotRevision, setPlotRevision] = useState(0);
  const uiInfoDetails = useAtomValue(uiInfoAtom);
  const isDarkMode = uiInfoDetails?.theme?.mode == "dark" ? true : false;

  const { chartData, layout, config } = useMemo(() => {
    if (!data?.metrics?.length)
      return { chartData: [], layout: {}, config: {} };

    let metrics = data.metrics;

    const timestamps = metrics.map((m) => new Date(m.interval_start));
    const diskReadValues = metrics.map((m) =>
      parseFloat(m.avg_disk_read_MBps?.toFixed(2)),
    );
    const diskWriteValues = metrics.map((m) =>
      parseFloat(m.avg_disk_write_MBps?.toFixed(2)),
    );

    // Create traces
    const traces = [];

    // Disk Write Area - Usually higher, so primary
    if (selectedMetrics.diskWrite) {
      traces.push({
        x: timestamps,
        y: diskWriteValues,
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        name: "Disk Write (MB/s)",
        line: {
          color: "hsl(38, 92%, 50%)",
          width: 2.5,
        },
        fillcolor: "hsla(38, 92%, 50%, 0.12)",
        hovertemplate:
          "<b>⬆️ Disk Write</b><br>" +
          "Write: %{y:.2f} MB/s<br>" +
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

    // Disk Read Area - Secondary
    if (selectedMetrics.diskRead) {
      traces.push({
        x: timestamps,
        y: diskReadValues,
        type: "scatter",
        mode: "lines",
        fill: "tozeroy",
        name: "Disk Read (MB/s)",
        line: {
          color: "hsl(217, 91%, 60%)",
          width: 2,
        },
        fillcolor: "hsla(217, 91%, 60%, 0.08)",
        hovertemplate:
          "<b>⬇️ Disk Read</b><br>" +
          "Read: %{y:.2f} MB/s<br>" +
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

    // Layout configuration
    const plotLayout = {
      title: {
        text: "Disk I/O Performance Overview",
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
          text: "Throughput (MB/s)",
          font: { color: "hsl(217, 91%, 60%)" },
        },
        linecolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickcolor: isDarkMode ? "#374151" : "#e5e7eb",
        tickfont: { color: "hsl(217, 91%, 60%)" },
        showgrid: false,
        ticksuffix: " MB/s",
        domain: [
          0,
          Math.max(10, Math.max(...diskReadValues, ...diskWriteValues) + 2),
        ],
        showspikes: true,
        spikethickness: 1,
        spikecolor: "hsl(217, 91%, 60%)",
        zeroline: false,
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
        l: 70,
        r: 30,
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
              "Time,Disk Read (MB/s),Disk Write (MB/s),Total I/O (MB/s)\n" +
              metrics
                .map(
                  (m) =>
                    `${new Date(m.interval_start).toISOString()},${m.avg_disk_read_MBps},${m.avg_disk_write_MBps},${(m.avg_disk_read_MBps + m.avg_disk_write_MBps).toFixed(2)}`,
                )
                .join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "disk_io_metrics.csv");
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
        filename: "disk_io_metrics",
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
      });
    }
  }, []);

  // Quick Stats Component
  const QuickStats = () => {
    if (!data?.metrics?.length) return null;

    const readValues = data.metrics.map((m) => m.avg_disk_read_MBps);
    const writeValues = data.metrics.map((m) => m.avg_disk_write_MBps);
    const avgRead = (
      readValues.reduce((a, b) => a + b, 0) / readValues.length
    ).toFixed(2);
    const avgWrite = (
      writeValues.reduce((a, b) => a + b, 0) / writeValues.length
    ).toFixed(2);
    const maxRead = Math.max(...readValues).toFixed(2);
    const maxWrite = Math.max(...writeValues).toFixed(2);

    return (
      <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-blue-500" />
          <span className="text-muted-foreground">Avg Read:</span>
          <span className="font-medium text-foreground">{avgRead} MB/s</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUp className="w-4 h-4 text-orange-500" />
          <span className="text-muted-foreground">Avg Write:</span>
          <span className="font-medium text-foreground">{avgWrite} MB/s</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Total I/O:</span>
          <span className="font-medium text-foreground">
            {(parseFloat(avgRead) + parseFloat(avgWrite)).toFixed(2)} MB/s
          </span>
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
              {key === "diskRead" ? "Read" : "Write"}
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
            <span>Loading disk I/O metrics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.metrics?.length) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <Database className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No I/O Data Available
          </h3>
          <p className="text-sm text-muted-foreground">
            Disk read and write performance metrics will appear here
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
            Disk I/O Performance Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            Disk read and write throughput activity metrics
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
            {data.total_records} total records • I/O throughput in MB/s
          </span>
          <span className="flex items-center gap-2">
            <Download className="w-3 h-3" />
            Write activity typically higher than read
          </span>
        </div>
      </div>
    </div>
  );
};

export default DiskIOMetricsChart;
