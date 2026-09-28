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

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// Search box scoped to one org's direct children - rendered at the top of an
// expanded level in the org trees (list page + pickers). The list endpoint's
// `query_string` only matches within a single parent, so every level gets its
// own box rather than one global search.
const OrgChildSearch = ({
  parentName,
  onSearch,
  paddingLeft = 16,
  className = "",
}) => {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input.trim(), 300);
  const lastSentRef = useRef("");
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Only report actual changes - firing on mount would reset the caller's
  // pagination (URL-backed on the list page) for no reason.
  useEffect(() => {
    if (debouncedInput === lastSentRef.current) return;
    lastSentRef.current = debouncedInput;
    onSearchRef.current(debouncedInput);
  }, [debouncedInput]);

  return (
    <div
      className={`border-border border-b py-2 pr-4 ${className}`}
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // The pickers are rendered inside the add/edit org forms - don't
          // let Enter submit them.
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          placeholder={
            parentName
              ? `Search in ${parentName}...`
              : "Search organizations..."
          }
          className="border-border bg-background focus:ring-primary/20 w-full rounded-md border py-1.5 pr-7 pl-8 text-xs focus:ring-2 focus:outline-none"
        />
        {input && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInput("");
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-0.5"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrgChildSearch;
