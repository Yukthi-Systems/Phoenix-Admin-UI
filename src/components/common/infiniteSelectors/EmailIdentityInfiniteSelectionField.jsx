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
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";

export function EmailIdentityInfiniteSelectionField({
  control,
  name,
  label,
  errors = {},
  domain_name = "",
  placeholder = "Select email identity...",
  customStyle = "",
  existingMailboxEmails = [],
}) {
  const error = errors?.[name];

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const fetchOptions = async (pageNum = 1, query = "") => {
    if (!domain_name || loading || (totalPages && pageNum > totalPages)) return;

    setLoading(true);
    try {
      const queryParam = query ? encodeURIComponent(query) : "";
      const apiUrl = `${API_URL}/identities/list/${domain_name}/${pageNum}/100?query=${queryParam}`;

      const response = await axios.get(apiUrl, {
        timeout: 5000,
        withCredentials: true,
        headers: {
          "X-Csrf-Token": adminStore.get(csrfTokenAtom),
          "Content-Type": "application/json",
        },
      });

      const { identities = [], total_count = 0 } = response.data?.data || {};
      const calculatedTotalPages = Math.ceil(total_count / 100) || 1;

      const filteredIdentities = identities.filter(
        (item) => !existingMailboxEmails.includes(item.email)
      );

      const newOptions = filteredIdentities.map((item) => ({
        label: item.email,
        value: item.email,
        isDisabled: !item.is_enabled,
      }));

      if (pageNum === 1 || query !== searchQuery) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(calculatedTotalPages);
      setPage(pageNum);
      setSearchQuery(query);
    } catch (err) {
      console.error("Failed to load email identity options", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
      return;
    }

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
    if (domain_name) {
      setOptions([]);
      setPage(1);
      setTotalPages(null);
      setSearchQuery("");
      fetchOptions(1, "");
    }
  }, [domain_name]);

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
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let selectedOption = null;

          if (field.value) {
            selectedOption = options.find((opt) => opt.value === field.value);

            if (!selectedOption) {
              selectedOption = {
                label: field.value,
                value: field.value,
              };
            }
          }

          const displayOptions =
            selectedOption &&
              !options.find((opt) => opt.value === selectedOption.value)
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
