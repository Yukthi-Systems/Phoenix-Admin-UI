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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SingleServerSelector from "./ServerSingleSelector";
import { useGetServerMetrics } from "@/hooks/useDashboard";
import { Loader2, AlertCircle, Calendar, BarChart3, Clock } from "lucide-react";
import ServerMetricsChart from "./CpuChart";
import MemoryMetricsChart from "./MemoryChart";
import DiskMetricsChart from "./DiskChart";
import NetworkMetricsChart from "./NetworkChart";
import DiskIOMetricsChart from "./DiskIOChart";
import DateTimeRangePicker from "@/components/common/DateRangePicker";
import * as yup from "yup";
import { useUserTimezone } from "@/hooks/useTimezone";
import moment from "moment-timezone";

// Validation schema for the form
const validationSchema = yup.object({
  date_range: yup
    .object({
      startDate: yup.date().required("Start date is required"),
      endDate: yup.date().required("End date is required"),
    })
    .required("Date range is required"),
});

const ServerMetricsPage = () => {
  const [server, setServer] = useState(null);
  const [dateValidationError, setDateValidationError] = useState("");
  const { userTimezone } = useUserTimezone();

  // Get default date range (last 1 hour) formatted as local dates
  // that match the User's Timezone wall-clock time
  const getDefaultDateRange = () => {
    const nowInUserTz = moment.tz(userTimezone);
    const oneHourAgoInUserTz = nowInUserTz.clone().subtract(1, "hour");

    // Create strings without timezone info to force "Local" Date objects
    // that visually match the User Timezone time
    const nowStr = nowInUserTz.format("YYYY-MM-DDTHH:mm:ss");
    const oneHourAgoStr = oneHourAgoInUserTz.format("YYYY-MM-DDTHH:mm:ss");

    return {
      startDate: new Date(oneHourAgoStr),
      endDate: new Date(nowStr),
    };
  };

  // Helper to convert the "Fake Local" dates back to real UTC for the API
  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    // Interpret the local date object as if it is in the user's timezone (keep wall-clock time)
    const startMoment = moment(dateRange.startDate).tz(userTimezone, true);
    const endMoment = moment(dateRange.endDate).tz(userTimezone, true);

    return {
      from_date: startMoment.utc().toISOString(),
      to_date: endMoment.utc().toISOString(),
    };
  };

  // React Hook Form setup
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date_range: getDefaultDateRange(),
    },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const dateRange = watch("date_range");

  // Initialize API dates
  const [apiDates, setApiDates] = useState(() =>
    convertDateRangeForAPI(getDefaultDateRange()),
  );

  const { data, isLoading, isError, refetch } = useGetServerMetrics(
    server?.server_id,
    apiDates.from_date,
    apiDates.to_date,
  );

  // Date validation function
  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "Please select valid dates";
    }

    const from = moment(startDate);
    const to = moment(endDate);
    const now = moment(); // Browser local now (used for future check)

    // Check for valid objects
    if (!from.isValid() || !to.isValid()) {
      return "Please select valid dates";
    }

    if (from.isSameOrAfter(to)) {
      return "From date must be before To date";
    }

    // Since startDate/endDate are "Fake Local" representing User TZ,
    // we should ideally compare against a "Fake Local" Now for consistency,
    // but simple future check is usually enough.
    // To be strictly correct with the "Fake Local" pattern:
    const nowInUserTzStr = moment
      .tz(userTimezone)
      .format("YYYY-MM-DDTHH:mm:ss");
    const nowFakeLocal = moment(new Date(nowInUserTzStr));

    if (to.isAfter(nowFakeLocal.add(1, "minute"))) {
      // Add 1 min tolerance for clock skew
      return "To date cannot be in the future";
    }

    const hoursDiff = to.diff(from, "hours", true);
    const daysDiff = to.diff(from, "days", true);

    if (hoursDiff < 1) {
      return "Minimum time range is 1 hour";
    }

    // STRICT 7 Day Limit
    if (daysDiff > 7) {
      return "Maximum time range is 7 days";
    }

    return "";
  };

  // Update API dates when date range changes
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      // Validate the local dates first
      const validationError = validateDateRange(
        dateRange.startDate,
        dateRange.endDate,
      );
      setDateValidationError(validationError);

      // If validation passes, convert to UTC for API using the timezone logic
      if (!validationError) {
        const converted = convertDateRangeForAPI(dateRange);
        setApiDates(converted);
      }
    }
  }, [dateRange, userTimezone]); // Added userTimezone dependency

  // Refetch when server or dates change (only if validation passes)
  useEffect(() => {
    if (
      server?.server_id &&
      apiDates.from_date &&
      apiDates.to_date &&
      !dateValidationError
    ) {
      refetch();
    }
  }, [server?.server_id, apiDates, dateValidationError, refetch]);

  // Quick preset buttons - Apply Buffer for 7 Days
  const handleQuickPreset = (hours) => {
    const nowInUserTz = moment.tz(userTimezone);
    let fromTime = nowInUserTz.clone().subtract(hours, "hours");

    // Convert to "Fake Local" strings for the DatePicker value
    const nowStr = nowInUserTz.format("YYYY-MM-DDTHH:mm:ss");
    const fromStr = fromTime.format("YYYY-MM-DDTHH:mm:ss");

    setValue("date_range", {
      startDate: new Date(fromStr),
      endDate: new Date(nowStr),
    });

    setDateValidationError(""); // Clear any existing errors
  };

  // Handle date range validation from picker
  const handleDateValidation = (error) => {
    setDateValidationError(error);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-4 shadow-sm">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 text-left">
              Select Server
            </label>
            <SingleServerSelector onChange={setServer} />
          </div>

          {/* Date Range Picker */}
          {server && (
            <div>
              <Controller
                name="date_range"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DateTimeRangePicker
                    disabledFutureDates
                    value={value}
                    onChange={onChange}
                    label="Date Range"
                    placeholder="Select date range..."
                    includeTime={true}
                    maxDays={7} // UI Restriction
                    onValidation={handleDateValidation}
                    error={dateValidationError}
                    info={`Range: 1 hour minimum, 7 days maximum (${userTimezone})`}
                    isClearable={false}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Quick Preset Buttons */}
        {server && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-muted-foreground mb-2 text-left">
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
                title="Last 7 Days (minus 10 min buffer)"
              >
                Last 7 Days
              </button>
            </div>
          </div>
        )}

        {/* Validation Error Display */}
        {server && dateValidationError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-2">
            <AlertCircle className="w-4 h-4" />
            <span>{dateValidationError}</span>
          </div>
        )}

        {/* Loading and Error States */}
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

        {/* Date Range Info - Shows the actual selected dates */}
        {server && dateRange?.startDate && dateRange?.endDate && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>
              Selected:{" "}
              {moment(dateRange.startDate).format("DD MMM YYYY, hh:mm A")} -{" "}
              {moment(dateRange.endDate).format("DD MMM YYYY, hh:mm A")}
            </span>
          </div>
        )}

        {/* Validation Info */}
        {server && !dateValidationError && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Valid range: 1 hour minimum, 7 days maximum</span>
          </div>
        )}
      </div>

      {/* Charts Section */}
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
