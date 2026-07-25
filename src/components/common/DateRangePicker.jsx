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

import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, Clock, X, Info } from "lucide-react";
import moment from "moment-timezone";
import "react-day-picker/dist/style.css";
import { useUserTimezone } from "@/hooks/useTimezone";

const DateTimeRangePicker = ({
  value = { startDate: null, endDate: null },
  onChange = () => {},
  label = "",
  placeholder = "Select date range...",
  error = null,
  disabled = false,
  isRequired = false,
  customStyle = "",
  includeTime = true,
  maxDays = null,
  minDate = null,
  maxDate = null,
  showPresets = true,
  info = "",
  onValidation = null,
  isClearable = true,
  disabledFutureDates = false,
  autoApply = true,
  ...props
}) => {
  const { userTimezone } = useUserTimezone();
  
  const [selected, setSelected] = useState(
    value?.startDate && value?.endDate
      ? { from: new Date(value.startDate), to: new Date(value.endDate) }
      : undefined,
  );

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get current date/time in user's timezone
  const getTodayInUserTimezone = () => {
    const nowInUserTz = moment.tz(userTimezone);
    const dateStr = nowInUserTz.format('YYYY-MM-DD');
    const today = new Date(dateStr);
    today.setHours(23, 59, 59, 999);
    return today;
  };

  useEffect(() => {
    if (value?.startDate && value?.endDate) {
      setSelected({
        from: new Date(value.startDate),
        to: new Date(value.endDate),
      });

      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      setStartTime(
        `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
      );
      setEndTime(
        `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`,
      );
    } else {
      setSelected(undefined);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = includeTime ? 420 : 360;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen, includeTime]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const validateDateRange = (from, to) => {
    if (!from && !to) return "";
    if (from && !to) return "Please select end date";
    if (!from && to) return "Please select start date";

    if (from && to) {
      if (from >= to) return "Start date must be before end date";

      if (disabledFutureDates) {
        const todayInUserTz = getTodayInUserTimezone();
        if (from > todayInUserTz) return "Start date cannot be in the future";
        if (to > todayInUserTz) return "End date cannot be in the future";
      }

      if (maxDate && to > new Date(maxDate))
        return "End date cannot be after maximum allowed date";
      if (minDate && from < new Date(minDate))
        return "Start date cannot be before minimum allowed date";

      if (maxDays) {
        const daysDiff =
          (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > maxDays) return `Maximum date range is ${maxDays} days`;
      }
    }
    return "";
  };

  const applyDateTimeRangeChange = (
    fromDate,
    toDate,
    startTimeValue = startTime,
    endTimeValue = endTime,
  ) => {
    if (!fromDate || !toDate) return false;

    let finalStartDate = new Date(fromDate);
    let finalEndDate = new Date(toDate);

    if (includeTime) {
      const [startHour, startMin] = startTimeValue.split(":");
      const [endHour, endMin] = endTimeValue.split(":");

      finalStartDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
      finalEndDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

      const isSameDay =
        finalStartDate.getFullYear() === finalEndDate.getFullYear() &&
        finalStartDate.getMonth() === finalEndDate.getMonth() &&
        finalStartDate.getDate() === finalEndDate.getDate();

      if (isSameDay && finalStartDate.getTime() === finalEndDate.getTime()) {
        finalStartDate.setHours(finalStartDate.getHours() - 1);
      }
    }

    const error = validateDateRange(finalStartDate, finalEndDate);
    if (error) {
      setValidationError(error);
      if (onValidation) onValidation(error);
      return false;
    }

    onChange({
      startDate: finalStartDate,
      endDate: finalEndDate,
    });

    setValidationError("");
    if (onValidation) onValidation("");
    return true;
  };

  const handleRangeSelect = (range) => {
    setSelected(range);

    if (range?.from && range?.to) {
      if (!includeTime) {
        const error = validateDateRange(range.from, range.to);
        if (error) {
          setValidationError(error);
          if (onValidation) onValidation(error);
          return;
        }

        onChange({
          startDate: range.from,
          endDate: range.to,
        });
        setIsOpen(false);
        setValidationError("");
        if (onValidation) onValidation("");
      } else {
        applyDateTimeRangeChange(range.from, range.to);
      }
    }
  };

  const handleStartTimeChange = (e) => {
    const newTime = e.target.value;
    setStartTime(newTime);

    if (selected?.from && selected?.to && includeTime) {
      applyDateTimeRangeChange(selected.from, selected.to, newTime, endTime);
    }
  };

  const handleEndTimeChange = (e) => {
    const newTime = e.target.value;
    setEndTime(newTime);

    if (selected?.from && selected?.to && includeTime) {
      applyDateTimeRangeChange(selected.from, selected.to, startTime, newTime);
    }
  };

  const handleApply = () => {
    if (!selected?.from || !selected?.to) return;

    const success = applyDateTimeRangeChange(selected.from, selected.to);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelected(undefined);
    setValidationError("");
    onChange({ startDate: null, endDate: null });
    if (onValidation) onValidation("");
  };

  const getDisplayValue = () => {
    if (!selected?.from && !selected?.to) return placeholder;

    const formatDate = (date) => {
      if (!date) return "";
      if (includeTime) {
        return date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    };

    if (selected?.from && selected?.to) {
      return `${formatDate(selected.from)} → ${formatDate(selected.to)}`;
    }

    if (selected?.from) {
      return `${formatDate(selected.from)} → ...`;
    }

    return placeholder;
  };

  const disabledDays = [];
  if (minDate) disabledDays.push({ before: new Date(minDate) });
  if (maxDate) disabledDays.push({ after: new Date(maxDate) });

  if (disabledFutureDates) {
    const todayInUserTz = getTodayInUserTimezone();
    disabledDays.push({ after: todayInUserTz });
  }

  return (
    <div className={`${customStyle} w-full`}>
      {label && (
        <label className="block text-left text-sm font-medium text-foreground mb-1">
          {label}
          {isRequired && <span className="text-destructive"> *</span>}
        </label>
      )}

      <div className="relative">
        <div className="flex gap-2">
          <button
            ref={inputRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex-1 overflow-hidden truncate rounded-md border p-2 text-left transition-colors duration-200 bg-background text-foreground
              ${
                error || validationError
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-primary hover:border-border/80"
              }
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed bg-muted"
                  : "hover:bg-accent/50 cursor-pointer"
              }
              focus:ring-0 focus:ring-offset-0 focus:outline-none
              flex items-center justify-between gap-2`}
          >
            <span
              className={
                selected?.from || selected?.to
                  ? "text-foreground truncate"
                  : "text-muted-foreground truncate"
              }
            >
              {getDisplayValue()}
            </span>
            <div className="flex items-center gap-1">
              {includeTime && (
                <Clock className="w-4 h-4 text-muted-foreground" />
              )}
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>

          {isClearable && (selected?.from || selected?.to) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={`absolute max-w-[260px] ${
              dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } left-0 right-0 bg-card border flex items-center justify-center border-border rounded-lg shadow-lg z-50 min-w-[250px]`}
          >
            <div className="px-3 py-3">
              <div className="calendar-wrapper">
                <DayPicker
                  mode="range"
                  selected={selected}
                  onSelect={handleRangeSelect}
                  disabled={disabledDays.length > 0 ? disabledDays : disabled}
                  showOutsideDays={true}
                  className="rdp-compact"
                  today={getTodayInUserTimezone()}
                  {...props}
                />
              </div>

              {includeTime && (
                <div className="border-t border-border pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block text-left">
                        Start Time
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={startTime}
                          onChange={handleStartTimeChange}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                        <svg
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm0 20a9 9 0 110-18 9 9 0 010 18zm.5-9.8V7h-1v5.2l4.3 2.5.5-.9-3.8-2.3z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block text-left">
                        End Time
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={endTime}
                          onChange={handleEndTimeChange}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                        <svg
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm0 20a9 9 0 110-18 9 9 0 010 18zm.5-9.8V7h-1v5.2l4.3 2.5.5-.9-3.8-2.3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {includeTime && selected?.from && selected?.to && !autoApply && (
                <div className="border-t border-border pt-3 mt-3">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Apply Selection
                  </button>
                </div>
              )}

              {includeTime && selected?.from && selected?.to && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {autoApply
                    ? "Date range and times auto-applied"
                    : 'Click "Apply Selection" to confirm'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || validationError) && (
        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
          <Info className="w-4 h-4" />
          {error || validationError}
        </p>
      )}

      {!error && !validationError && info && (
        <p className="text-sm text-muted-foreground mt-1 flex gap-1 items-center">
          <Info className="w-4 h-4" />
          {info}
        </p>
      )}

      <style jsx global>{`
        .calendar-wrapper .rdp-compact {
          margin: 0;
          font-family: inherit;
        }

        .calendar-wrapper .rdp-compact .rdp-day {
          width: 32px;
          height: 32px;
        }

        .calendar-wrapper .rdp-compact .rdp-day_button {
          width: 32px;
          height: 32px;
          font-size: 13px !important;
          padding: 0;
        }

        .calendar-wrapper .rdp-compact .rdp-month {
          margin: 0;
        }

        .calendar-wrapper .rdp-compact .rdp-month_caption {
          margin-bottom: 8px;
        }

        .calendar-wrapper .rdp-compact .rdp-months {
          gap: 0;
        }

        .calendar-wrapper .rdp-compact .rdp-month_grid {
          gap: 2px;
        }

        .calendar-wrapper .rdp-compact .rdp-week {
          gap: 2px;
        }

        .calendar-wrapper .rdp-compact .rdp-weekdays {
          margin-bottom: 4px;
        }

        .calendar-wrapper .rdp-compact .rdp-nav {
          gap: 4px;
        }

        .calendar-wrapper .rdp-compact .rdp-nav_button {
          width: 28px;
          height: 28px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .rdp-today:not(.rdp-outside) {
          color: hsl(var(--primary));
        }

        .rdp-range_start .rdp-day_button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: hsl(var(--primary-foreground));
        }

        .rdp-range_end .rdp-day_button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: hsl(var(--primary-foreground));
        }

        .calendar-wrapper .rdp-compact .rdp-day_selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        .calendar-wrapper .rdp-compact .rdp-day_today:not(.rdp-day_selected) {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-weight: 500;
        }

        .calendar-wrapper .rdp-compact .rdp-day:hover:not(.rdp-day_selected) {
          background-color: hsl(var(--primary) / 0.2);
          color: hsl(var(--accent-foreground));
        }

        .calendar-wrapper .rdp-compact .rdp-range_middle {
          background-color: hsl(var(--primary) / 0.2) !important;
          color: hsl(var(--accent-foreground)) !important;
        }

        .calendar-wrapper .rdp-compact .rdp-nav_button:hover {
          background: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }

        .calendar-wrapper .rdp-compact .rdp-caption_label {
          color: hsl(var(--foreground));
          font-weight: 500;
          font-size: 14px;
        }

        .calendar-wrapper .rdp-compact .rdp-head_cell {
          color: hsl(var(--muted-foreground));
          font-size: 11px;
          font-weight: 500;
          width: 32px;
          height: 28px;
        }

        .calendar-wrapper .rdp-compact .rdp-day_outside {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }

        .rdp-range_start {
          background: hsl(var(--primary) / 0.2);
          background-color: hsl(var(--primary) / 0.2);
          border-top-left-radius: 50%;
          border-bottom-left-radius: 50%;
        }

        .rdp-chevron {
          fill: hsl(var(--primary)) !important;
          width: 16px;
          height: 16px;
        }

        .rdp-range_end {
          background: hsl(var(--primary) / 0.2);
          background-color: hsl(var(--primary) / 0.2);
          border-top-right-radius: 50%;
          border-bottom-right-radius: 50%;
        }

        .calendar-wrapper .rdp-compact .rdp-day_disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default DateTimeRangePicker;