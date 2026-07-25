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

import React, { useEffect, useState } from "react";
import SingleServerSelector from "./ServerSingleSelector";
import { useGetServerMetrics } from "@/hooks/useDashboard";
import { ControlledInput } from "@/components/common/Inputs";
import {
  Loader2,
  AlertCircle,
  Server,
  Calendar,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  toDateTimeLocalStringDefault,
  toDateTimeLocalStringDefaultReduce,
  toLocalISOString,
} from "@/utils/dateFormat";
import ServerMetricsChart from "./CpuChart";
import MemoryMetricsChart from "./MemoryChart";
import DiskMetricsChart from "./DiskChart";
import NetworkMetricsChart from "./NetworkChart";
import DiskIOMetricsChart from "./DiskIOChart";

const ServerMetricsPage = () => {
  const [server, setServer] = useState(null);
  const [dateValidationError, setDateValidationError] = useState("");

  // Values shown in inputs (in datetime-local format)
  const [fromDateInput, setFromDateInput] = useState(
    toDateTimeLocalStringDefaultReduce(60),
  );
  const [toDateInput, setToDateInput] = useState(
    toDateTimeLocalStringDefault(new Date()),
  ); // now

  // Values sent to API (ISO with timezone)
  const [fromDate, setFromDate] = useState(
    toLocalISOString(new Date(fromDateInput)),
  );
  const [toDate, setToDate] = useState(toLocalISOString(new Date(toDateInput)));

  const { data, isLoading, isError, refetch } = useGetServerMetrics(
    server?.server_id,
    fromDate,
    toDate,
  );

  // Date validation function
  const validateDateRange = (fromDateTime, toDateTime) => {
    const fromDate = new Date(fromDateTime);
    const toDate = new Date(toDateTime);
    const now = new Date();

    // Check if dates are valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return "Please select valid dates";
    }

    // Check if from date is before to date
    if (fromDate >= toDate) {
      return "From date must be before To date";
    }

    // Check if to date is in the future
    if (toDate > now) {
      return "To date cannot be in the future";
    }

    // Calculate time difference in milliseconds
    const timeDiff = toDate.getTime() - fromDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Check minimum range (1 hour)
    if (hoursDiff < 1) {
      return "Minimum time range is 1 hour";
    }

    // Check maximum range (7 days)
    if (daysDiff > 7) {
      return "Maximum time range is 7 days";
    }

    return ""; // No error
  };

  // Refetch when server or dates change (only if validation passes)
  useEffect(() => {
    if (server?.server_id && fromDate && toDate) {
      const validationError = validateDateRange(fromDate, toDate);
      setDateValidationError(validationError);

      if (!validationError) {
        refetch();
      }
    }
  }, [server?.server_id, fromDate, toDate]);

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDateInput(value);
    const isoDate = toLocalISOString(new Date(value));
    setFromDate(isoDate);

    // Validate immediately
    const validationError = validateDateRange(isoDate, toDate);
    setDateValidationError(validationError);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDateInput(value);
    const isoDate = toLocalISOString(new Date(value));
    setToDate(isoDate);

    // Validate immediately
    const validationError = validateDateRange(fromDate, isoDate);
    setDateValidationError(validationError);
  };

  // Quick preset buttons
  const handleQuickPreset = (hours) => {
    const now = new Date();
    const fromTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const fromValue = toDateTimeLocalStringDefault(fromTime);
    const toValue = toDateTimeLocalStringDefault(now);

    setFromDateInput(fromValue);
    setToDateInput(toValue);
    setFromDate(toLocalISOString(fromTime));
    setToDate(toLocalISOString(now));
    setDateValidationError(""); // Clear any existing errors
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-card border rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Server Metrics
            </h1>
          </div>
          {server && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium text-foreground">
                {server.host_name}
              </span>
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Server Selection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 text-left">
              Select Server
            </label>
            <SingleServerSelector onChange={setServer} />
          </div>

          {/* Date Range */}
          {server && (
            <>
              <div>
                <ControlledInput
                  type="datetime-local"
                  label="From Date"
                  value={fromDateInput}
                  onChange={handleFromDateChange}
                  step={0.01}
                  name="from_date"
                />
              </div>
              <div>
                <ControlledInput
                  type="datetime-local"
                  label="To Date"
                  value={toDateInput}
                  onChange={handleToDateChange}
                  step={0.01}
                  name="to_date"
                />
              </div>
            </>
          )}
        </div>

        {/* Quick Preset Buttons */}
        {server && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Quick Time Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickPreset(1)}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                Last 1 Hour
              </button>
              <button
                onClick={() => handleQuickPreset(6)}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                Last 6 Hours
              </button>
              <button
                onClick={() => handleQuickPreset(24)}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                Last 24 Hours
              </button>
              <button
                onClick={() => handleQuickPreset(72)}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                Last 3 Days
              </button>
              <button
                onClick={() => handleQuickPreset(168)}
                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              >
                Last 7 Days
              </button>
            </div>
          </div>
        )}

        {/* Date Validation Error */}
        {server && dateValidationError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-2">
            <AlertCircle className="w-4 h-4" />
            <span>{dateValidationError}</span>
          </div>
        )}

        {/* Status Messages - Compact */}
        {server && !dateValidationError && (
          <div className="mt-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Loading metrics...</span>
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to load metrics</span>
              </div>
            )}

            {!isLoading &&
              !isError &&
              data &&
              Object.keys(data).length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>No data available for selected range</span>
                </div>
              )}
          </div>
        )}

        {/* Date Range Info */}
        {server && !dateValidationError && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Valid range: 1 hour minimum, 7 days maximum</span>
          </div>
        )}
      </div>

      {/* Chart Components - Only show if no validation errors */}
      {server && !isError && !dateValidationError && (
        <>
          <ServerMetricsChart data={data?.data} isLoading={isLoading} />

          <MemoryMetricsChart data={data?.data} isLoading={isLoading} />

          <DiskMetricsChart data={data?.data} isLoading={isLoading} />

          <DiskIOMetricsChart data={data?.data} isLoading={isLoading} />

          <NetworkMetricsChart data={data?.data} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default ServerMetricsPage;
