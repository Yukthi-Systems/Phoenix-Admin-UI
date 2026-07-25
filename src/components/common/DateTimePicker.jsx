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

const DateTimePicker = ({
  value = null,
  onChange = () => {},
  label = "",
  placeholder = "Select date...",
  error = null,
  disabled = false,
  isRequired = false,
  customStyle = "",
  includeTime = true,
  minDate = null,
  maxDate = null,
  info = "",
  onValidation = null,
  isClearable = true,
  disabledFutureDates = false,
  autoApply = true,
  ...props
}) => {
  const { userTimezone } = useUserTimezone();
  
  const [selected, setSelected] = useState(value ? new Date(value) : undefined);
  const [time, setTime] = useState("09:00");
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const getTodayInUserTimezone = () => {
    const nowInUserTz = moment.tz(userTimezone);
    const dateStr = nowInUserTz.format('YYYY-MM-DD');
    const today = new Date(dateStr);
    today.setHours(23, 59, 59, 999);
    return today;
  };

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelected(date);
      setTime(
        `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
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
      const dropdownHeight = includeTime ? 380 : 320;

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

  const validateDate = (date) => {
    if (!date) return "";

    if (disabledFutureDates) {
      const todayInUserTz = getTodayInUserTimezone();
      if (date > todayInUserTz) {
        return "Date cannot be in the future";
      }
    }

    if (maxDate && date > new Date(maxDate)) {
      return "Date cannot be after maximum allowed date";
    }

    if (minDate && date < new Date(minDate)) {
      return "Date cannot be before minimum allowed date";
    }

    return "";
  };

  const applyDateTimeChange = (date, timeValue = time) => {
    if (!date) return;

    let finalDate = new Date(date);

    if (includeTime) {
      const [hour, min] = timeValue.split(":");
      finalDate.setHours(parseInt(hour), parseInt(min), 0, 0);
    }

    const error = validateDate(finalDate);
    if (error) {
      setValidationError(error);
      if (onValidation) onValidation(error);
      return false;
    }

    onChange(finalDate);
    setValidationError("");
    if (onValidation) onValidation("");
    return true;
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    setSelected(date);

    if (!includeTime) {
      const error = validateDate(date);
      if (error) {
        setValidationError(error);
        if (onValidation) onValidation(error);
        return;
      }

      onChange(date);
      setIsOpen(false);
      setValidationError("");
      if (onValidation) onValidation("");
    } else {
      const success = applyDateTimeChange(date);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (selected && includeTime) {
      applyDateTimeChange(selected, newTime);
    }
  };

  const handleApply = () => {
    if (!selected) return;

    const success = applyDateTimeChange(selected);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelected(undefined);
    setValidationError("");
    onChange(null);
    if (onValidation) onValidation("");
  };

  const getDisplayValue = () => {
    if (!selected) return placeholder;

    if (includeTime) {
      return selected.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return selected.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
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
                selected
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

          {isClearable && selected && !disabled && (
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
            } left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[250px]`}
          >
            <div className="px-3 py-3">
              <div className="calendar-wrapper">
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={handleDateSelect}
                  disabled={disabledDays.length > 0 ? disabledDays : disabled}
                  showOutsideDays={true}
                  className="rdp-compact"
                  today={getTodayInUserTimezone()}
                  {...props}
                />
              </div>

              {includeTime && (
                <div className="border-t border-border pt-3 mt-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block text-left">
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
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
              )}

              {includeTime && selected && !autoApply && (
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

              {includeTime && selected && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {autoApply
                    ? "Date and time auto-applied"
                    : 'Click "Apply Selection" to confirm'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || validationError) && (
        <p className="text-sm text-destructive mt-1 text-left flex items-center gap-1">
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
          border-radius: 50%;
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

        .rdp-selected .rdp-day_button {
          border: 1px solid hsl(var(--primary));
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }

        .rdp-chevron {
          fill: hsl(var(--primary)) !important;
          width: 16px;
          height: 16px;
        }

        .calendar-wrapper .rdp-compact .rdp-day_outside {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }

        .calendar-wrapper .rdp-compact .rdp-day_disabled {
          color: hsl(var(--muted-foreground));
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default DateTimePicker;