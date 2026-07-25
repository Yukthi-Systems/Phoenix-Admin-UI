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

// src/components/shared/SearchBar.jsx
import { Search, X, RefreshCw } from "lucide-react";
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";
import { useUrlParam } from "@/hooks/useUrlParam";

const SearchBar = forwardRef(
  (
    {
      placeholder = "Search...",
      onSearch = () => {},
      onClear = () => {},
      onRefresh,
      showSearchButton = false,
      debounceTime = 300,
      className = "",
    },
    ref,
  ) => {
    const [urlSearch, setUrlSearch] = useUrlParam("search", "");
    const [query, setQuery] = useState(urlSearch);
    const [isFocused, setIsFocused] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const debounceTimerRef = useRef(null);

    useEffect(() => {
      if (urlSearch !== query) {
        setQuery(urlSearch);
      }
    }, [urlSearch]);

    // Debounce search
    useEffect(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch(query);
        setUrlSearch(query);
      }, debounceTime);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [query]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setQuery("");
        setUrlSearch("");
        onClear();
      },
      setValue: (value) => setQuery(value),
      getValue: () => query,
    }));

    const handleClear = () => {
      setQuery("");
      setUrlSearch("");
      onClear();
    };

    const handleChange = (e) => {
      setQuery(e.target.value);
    };

    const handleSearch = () => {
      onSearch(query);
      setUrlSearch(query);
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    const handleRefresh = async () => {
      if (!onRefresh) return;
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    };

    return (
      <div className={`flex w-full max-w-sm items-center gap-2 ${className}`}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-${query ? "20" : "4"} bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/20 focus:border-primary hover:border-border/80 disabled:bg-muted rounded-lg border py-2 transition-all duration-200 hover:shadow-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${isFocused ? "border-primary" : "border-border"} `}
          />

          {query && (
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground hover:bg-accent absolute inset-y-0 top-2 right-2 flex h-6 w-6 items-center rounded-md p-1 transition-colors duration-200"
              type="button"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            className="border-border hover:bg-accent text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors duration-200 flex-shrink-0"
            type="button"
            title="Refresh list"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}

        {showSearchButton && (
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50 ml-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus:ring-2 focus:ring-offset-1 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            type="button"
          >
            Search
          </button>
        )}
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
