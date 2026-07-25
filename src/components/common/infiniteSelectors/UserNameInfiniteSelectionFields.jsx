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

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";

import axios from "axios";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";

export function UserNameInfiniteSelectionFields({
  value,
  onChange,
  name,
  label,
  error = "",
  url = "",
  placeholder = "Select option...",
  customStyle = "",
  returnId = false,
  isMulti = false, // Add multi-select support
}) {
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (pageNum = 1) => {
    if (loading || (totalPages && pageNum > totalPages)) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}${url}/${pageNum}?limit=50`, {
        timeout: 5000,
        withCredentials: true,
        headers: {
          "X-Csrf-Token": adminStore.get(csrfTokenAtom),
          "Content-Type": "application/json",
        },
      });

      const { users_list = [], total_pages = 1 } = response?.data || {};

      const newOptions = users_list.map((item) => ({
        label: item.user_name,
        value: item.user_name,
        id: item.user_id,
      }));

      if (pageNum === 1) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total_pages);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load options", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuScrollToBottom = () => {
    if (!loading && totalPages && page < totalPages) {
      fetchOptions(page + 1);
    }
  };

  useEffect(() => {
    setOptions([]);
    setPage(1);
    setTotalPages(null);
    fetchOptions(1);
  }, [url]);

  // Handle multi-select and single-select values
  let selectedOption;
  let displayOptions = [...options];

  if (isMulti) {
    const valueArray = Array.isArray(value) ? value : value ? [value] : [];
    selectedOption = valueArray
      .map((val) =>
        options.find((opt) => (returnId ? opt.id === val : opt.value === val)),
      )
      .filter(Boolean);

    // Add missing values as placeholder options
    const missingOptions = [];
    valueArray.forEach((val) => {
      if (
        !selectedOption.find((opt) =>
          returnId ? opt.id === val : opt.value === val,
        )
      ) {
        const missingOption = returnId
          ? { label: `User ID: ${val}`, value: val, id: val }
          : { label: val, value: val };
        selectedOption.push(missingOption);
        missingOptions.push(missingOption);
      }
    });

    if (missingOptions.length > 0) {
      displayOptions = [...missingOptions, ...displayOptions];
    }
  } else {
    // Single select mode
    selectedOption = null;

    // Only try to find/create selected option if value exists
    if (value) {
      selectedOption = options.find((opt) =>
        returnId ? opt.id === value : opt.value === value,
      );

      // If value exists but not in options, create a temporary option
      if (!selectedOption) {
        selectedOption = returnId
          ? { label: `User ID: ${value}`, value: value, id: value }
          : { label: value, value: value };
        displayOptions = [selectedOption, ...displayOptions];
      }
    }
  }

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label}
        </label>
      )}
      <Select
        name={name}
        value={selectedOption}
        options={displayOptions}
        placeholder={placeholder}
        onChange={(selected) => {
          if (isMulti) {
            onChange(
              selected && selected.length > 0
                ? returnId
                  ? selected.map((s) => s.id)
                  : selected.map((s) => s.value)
                : []
            );
          } else {
            onChange(selected ? (returnId ? selected.id : selected.value) : null);
          }
        }}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        isClearable
        isMulti={isMulti}
        isLoading={loading}
        menuPlacement="auto"
        styles={getReactSelectStyles()}
        menuPortalTarget={document.body}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}