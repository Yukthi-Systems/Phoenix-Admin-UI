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

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

const CalendarDropdown = ({
  item,
  onDownloadICS,
  onGoogleCalendar,
  onOutlookCalendar,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-fit text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 rounded-md px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="h-3.5 w-3.5" />
        <span>Add to Calendar</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              onDownloadICS();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent text-card-foreground hover:text-foreground transition-colors font-medium"
          >
            Download ICS
          </button>
          <button
            onClick={() => {
              onGoogleCalendar();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent text-card-foreground hover:text-foreground transition-colors font-medium border-t border-border"
          >
            Google Calendar
          </button>
          <button
            onClick={() => {
              onOutlookCalendar();
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent text-card-foreground hover:text-foreground transition-colors font-medium border-t border-border"
          >
            Outlook Calendar
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarDropdown;
