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

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { UserNameInfiniteSelectionFields } from "@/components/common/infiniteSelectors/UserNameInfiniteSelectionFields";

const FilterDropdown = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  organizationId,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border text-left">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-2">
          {(filters.assigned_to ||
            filters.ticket_status ||
            filters.ticket_id) && (
            <button
              onClick={onClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter Fields */}
      <div className="space-y-4 text-left">
        {/* Ticket ID Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ticket ID
          </label>
          <input
            type="text"
            value={filters.ticket_id || ""}
            onChange={(e) => onFilterChange("ticket_id", e.target.value)}
            placeholder="Enter ticket ID..."
            className="w-full h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground"
          />
        </div>

        {/* Assigned To Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Assigned To
          </label>
          <UserNameInfiniteSelectionFields
            name="assigned_to"
            label=""
            url={`/user/list/${organizationId}`}
            placeholder="Select user..."
            value={filters.assigned_to}
            onChange={(value) => onFilterChange("assigned_to", value)}
            isClearable={true}
            onClear={() => onFilterChange("assigned_to", "")}
            returnId={true}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <select
            value={filters.ticket_status}
            onChange={(e) => onFilterChange("ticket_status", e.target.value)}
            className="w-full h-11 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN-PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
