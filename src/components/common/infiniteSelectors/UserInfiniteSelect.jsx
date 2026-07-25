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
import { useEffect, useState } from "react";
import axios from "axios";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "X-Csrf-Token": adminStore.get(csrfTokenAtom),
});

export function UserInfiniteSelectField({
  control,
  name,
  label,
  errors = {},
  organization_id,
  placeholder = "Select user...",
  customStyle = "",
  isMulti = false,
}) {
  const error = errors?.[name];

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (pageNum = 1) => {
    if (loading || (totalPages && pageNum > totalPages) || !organization_id)
      return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/user/list/${organization_id}/${pageNum}?limit=50`,
        {
          timeout: 5000,
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      const { users_list = [], total_pages = 1 } = response.data || {};

      const newOptions = users_list.map((user) => ({
        label: `${user.display_name} (${user.user_name})`,
        value: user.user_id,
        userName: user.user_name,
        isActive: user.is_active,
      }));

      if (pageNum === 1) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total_pages);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load user options", err);
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
    if (organization_id) {
      setOptions([]);
      setPage(1);
      setTotalPages(null);
      fetchOptions(1);
    }
  }, [organization_id]);

  const formatOptionLabel = ({ label, isActive }) => (
    <div className="flex items-center justify-between w-full">
      <span>{label}</span>
      {isActive !== undefined && (
        <span
          className={`text-xs px-2 py-1 rounded ${
            isActive
              ? "bg-success text-success-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      )}
    </div>
  );

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let displayValue;
          let displayOptions = [...options];

          if (isMulti) {
            const selectedValues = field.value || [];
            displayValue = options.filter((opt) =>
              selectedValues.includes(opt.value)
            );

            // Add missing selected values
            const missingValues = selectedValues.filter(
              (val) => !options.find((opt) => opt.value === val)
            );
            if (missingValues.length > 0) {
              const missingOptions = missingValues.map((val) => ({
                label: `User ID: ${val}`,
                value: val,
              }));
              displayValue = [...displayValue, ...missingOptions];
              displayOptions = [...missingOptions, ...displayOptions];
            }
          } else {
            // Single select mode
            displayValue = null;

            // Only try to find/create selected option if field has a value
            if (field.value) {
              displayValue = options.find((opt) => opt.value === field.value);
              
              // If value exists but not in options, create a temporary option
              if (!displayValue) {
                displayValue = {
                  label: `User ID: ${field.value}`,
                  value: field.value,
                };
                displayOptions = [displayValue, ...displayOptions];
              }
            }
          }

          return (
            <Select
              {...field}
              value={displayValue}
              options={displayOptions}
              placeholder={placeholder}
              onChange={(selected) => {
                if (isMulti) {
                  field.onChange(
                    selected && selected.length > 0 
                      ? selected.map((item) => item.value) 
                      : []
                  );
                } else {
                  field.onChange(selected ? selected.value : null);
                }
              }}
              onMenuScrollToBottom={handleMenuScrollToBottom}
              isMulti={isMulti}
              isClearable
              isLoading={loading}
              menuPlacement="auto"
              styles={getReactSelectStyles()}
              menuPortalTarget={document.body}
              classNamePrefix="react-select"
              formatOptionLabel={formatOptionLabel}
              isDisabled={!organization_id}
            />
          );
        }}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
      {!organization_id && (
        <p className="text-sm text-muted-foreground mt-1">
          Organization ID is required to load users
        </p>
      )}
    </div>
  );
}