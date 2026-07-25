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

import { Controller } from "react-hook-form";
import Select from "react-select";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";

export function DomainInfiniteSelectField({
  control,
  name,
  label,
  errors = {},
  url = "",
  placeholder = "Select option...",
  customStyle = "",
  required = true,
}) {
  const error = errors?.[name];

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
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

      const { domains = [], total_pages = 1 } = response.data.domains || {};

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
      setPage(pageNum);

      return newOptions;
    } catch (err) {
      console.error("Failed to load domain options", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    // Don't trigger search when clearing or when menu is closed
    if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
      return;
    }

    setSearchQuery(inputValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setTotalPages(null);
      fetchOptions(1, inputValue);
    }, 300);
  };

  const handleMenuScrollToBottom = () => {
    if (!loading && totalPages && page < totalPages) {
      fetchOptions(page + 1, searchQuery);
    }
  };

  useEffect(() => {
    setOptions([]);
    setPage(1);
    setTotalPages(null);
    setSearchQuery("");
    fetchOptions(1, "");
  }, [url]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let selectedOption = null;
        
          // Only try to find/create selected option if field has a value
          if (field.value) {
            selectedOption = options.find((opt) => opt.value === field.value);
          
            // If value exists but not in options, create a temporary option
            if (!selectedOption) {
              selectedOption = { label: field.value, value: field.value };
            }
          }
        
          // Add the selected option to display options if it's not already there
          const displayOptions = selectedOption && !options.find(opt => opt.value === selectedOption.value)
            ? [selectedOption, ...options]
            : options;

          return (
            <Select
              {...field}
              value={selectedOption}
              options={displayOptions}
              placeholder={placeholder}
              onChange={(selected) => field.onChange(selected ? selected.value : null)}
              onMenuScrollToBottom={handleMenuScrollToBottom}
              onInputChange={handleInputChange}
              isClearable
              isLoading={loading}
              menuPlacement="auto"
              styles={getReactSelectStyles()}
              menuPortalTarget={document.body}
              classNamePrefix="react-select"
            />
          );
        }}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}