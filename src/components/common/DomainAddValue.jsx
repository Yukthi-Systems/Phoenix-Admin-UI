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
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";

export function DomainInfiniteAddField({
  label,
  url = "",
  placeholder = "Select option...",
  customStyle = "",
  onChange = () => {},
  value = [], // selected domain strings
}) {
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
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

      if (pageNum === 1 || query !== searchQuery) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total_pages);
      setPage(pageNum + 1);
    } catch (err) {
      console.error("Failed to load domain options", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOptions([]);
    setPage(1);
    setTotalPages(null);
    setSelectedOption(null);
    if (url) fetchOptions(1);
  }, [url]);

  const handleAddOption = () => {
    if (!selectedOption || value.includes(selectedOption.value)) return;
    onChange([...value, selectedOption.value]);
    setOptions((prev) =>
      prev.filter((opt) => opt.value !== selectedOption.value),
    );
    setSelectedOption(null);
  };

  const handleRemove = (domain) => {
    onChange(value.filter((val) => val !== domain));
    setOptions((prev) => [...prev, { label: domain, value: domain }]);
  };

  return (
    <div className={customStyle}>
      {label && (
        <label className="block text-sm text-left font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <Select
          className="flex-1"
          options={options}
          placeholder={placeholder}
          value={selectedOption}
          onChange={(option) => setSelectedOption(option)}
          onMenuScrollToBottom={() => fetchOptions(page)}
          isClearable
          isLoading={loading}
          isDisabled={loading}
          styles={getReactSelectStyles()}
          menuPlacement="auto"
          classNamePrefix="react-select"
        />
        <button
          type="button"
          onClick={handleAddOption}
          disabled={!selectedOption}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>

      {value?.length > 0 && (
        <ul className="flex flex-wrap gap-2 mt-3">
          {value.map((val) => (
            <li
              key={val}
              className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm border border-border"
            >
              <span className="text-foreground">{val}</span>
              <button
                type="button"
                onClick={() => handleRemove(val)}
                className="hover:text-destructive hover:bg-accent rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${val}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}