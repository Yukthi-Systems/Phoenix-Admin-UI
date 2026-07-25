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

import React from "react";
import { Search, X } from "lucide-react";

/**
 * ProcessSearchBar - Reusable search component for filtering processes
 * 
 * @param {string} searchQuery - Current search query value
 * @param {function} setSearchQuery - Function to update search query
 * @param {number} resultCount - Number of filtered results
 * @param {string} placeholder - Custom placeholder text (optional)
 * @param {boolean} showResultCount - Whether to show result count (default: true)
 */
const ProcessSearchBar = ({
  searchQuery,
  setSearchQuery,
  resultCount,
  placeholder = "Search processes by name or PID...",
  showResultCount = true,
}) => {
  const handleClear = () => {
    setSearchQuery("");
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          aria-label="Search processes"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Result Count */}
      {showResultCount && searchQuery && (
        <div className="mt-2 text-xs text-muted-foreground">
          Found <span className="font-medium text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "process" : "processes"} matching{" "}
          <span className="font-medium text-foreground">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default ProcessSearchBar;

/**
 * Usage Example:
 * 
 * import ProcessSearchBar from './ProcessSearchBar';
 * 
 * const MyComponent = () => {
 *   const [searchQuery, setSearchQuery] = useState("");
 *   const filteredData = data.filter(item => 
 *     item.name.toLowerCase().includes(searchQuery.toLowerCase())
 *   );
 * 
 *   return (
 *     <ProcessSearchBar
 *       searchQuery={searchQuery}
 *       setSearchQuery={setSearchQuery}
 *       resultCount={filteredData.length}
 *     />
 *   );
 * };
 */