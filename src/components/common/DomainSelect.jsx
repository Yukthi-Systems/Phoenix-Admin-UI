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

import Select from "react-select";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { API_URL } from "@/constants/constants";

export function DomainInfiniteSelect({
  value,
  onChange,
  label,
  error = "",
  url = "",
  placeholder = "Select option...",
  customStyle = "",
  required = true,
}) {
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const fetchOptions = async (pageNum = 1, query = "") => {
    if (loading || (totalPages && pageNum > totalPages)) return;

    setLoading(true);
    try {
      const queryParam = query ? `${encodeURIComponent(query)}` : "";
      const response = await axios.get(
        `${API_URL}${url}?page=${pageNum}&limit=50&query=${queryParam}`,
        {
          timeout: 5000,
          withCredentials: true,
          headers: {
            "X-Csrf-Token": adminStore.get(csrfTokenAtom),
            "Content-Type": "application/json",
          },
        },
      );

      const { domains = [], total_pages = 1 } = response.data?.domains || {};

      const newOptions = domains.map((item) => ({
        label: item.domain_name,
        value: item.domain_name,
      }));

      if (pageNum === 1) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total_pages);
      setPage(pageNum + 1);

      return newOptions;
    } catch (err) {
      console.error("Failed to load domain options", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle search input with debouncing
  const handleInputChange = (inputValue) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout to trigger search after 300ms
    debounceRef.current = setTimeout(() => {
      // Reset pagination and fetch with new query
      setPage(1);
      setTotalPages(null);
      fetchOptions(1, inputValue);
    }, 300);
  };

  // Handle select change
  const handleChange = (selectedOption) => {
    onChange(selectedOption?.value || "");
  };

  // Get current value for Select component
  const getCurrentValue = () => {
    return options.find((opt) => opt.value === value) || null;
  };

  // Initial load and when URL changes
  useEffect(() => {
    setOptions([]);
    setPage(1);
    setTotalPages(null);
    setSearchQuery("");
    fetchOptions(1, "");
  }, [url]);

  // Get custom dark mode styles for react-select
  const getSelectStyles = () => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "hsl(var(--background))",
      borderColor: state.isFocused
        ? "hsl(var(--primary))"
        : "hsl(var(--border))",
      color: "hsl(var(--foreground))",
      boxShadow: state.isFocused ? "0 0 0 1px hsl(var(--primary))" : "none",
      "&:hover": {
        borderColor: "hsl(var(--primary))",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "6px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
          ? "hsl(var(--accent))"
          : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      "&:hover": {
        backgroundColor: "hsl(var(--accent))",
        color: "hsl(var(--accent-foreground))",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
    input: (provided) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <Select
        value={getCurrentValue()}
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
        onMenuScrollToBottom={() => fetchOptions(page, searchQuery)}
        onInputChange={handleInputChange}
        isClearable
        isLoading={loading}
        menuPlacement="auto"
        styles={getSelectStyles()}
        menuPortalTarget={document.body}
        classNamePrefix="react-select"
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
