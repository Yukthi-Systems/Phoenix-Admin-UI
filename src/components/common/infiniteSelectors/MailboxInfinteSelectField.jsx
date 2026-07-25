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

// src/components/Common/infiniteSelectors/MailboxInfiniteSelectField.jsx
import { Controller } from "react-hook-form";
import Select from "react-select";
import { useEffect, useState, useRef } from "react";
import { getMailboxes } from "@/api/mailbox"; // Importing the existing API function
import { getReactSelectStyles } from "@/utils/selectTheme";

export function MailboxInfiniteSelectField({
  control,
  name,
  label,
  domainName,
  errors = {},
  placeholder = "Select destination mailbox...",
  customStyle = "",
  onMailboxSelect, // Callback to handle side effects (like setting prefix)
}) {
  const error = errors?.[name];

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const fetchOptions = async (pageNum = 1, query = "") => {
    if ((loading && pageNum > 1) || (totalPages && pageNum > totalPages) || !domainName) return;

    setLoading(true);
    try {
      // Using the existing getMailboxes API: (domain_name, page, pageSize, query)
      const data = await getMailboxes(domainName, pageNum, 50, query);
      
      const mailboxList = data?.mailboxes || [];
      const total = data?.total_pages || 1;

      const newOptions = mailboxList.map((item) => ({
        label: item.email,
        value: item.email, // We use full email as value
        original: item
      }));

      if (pageNum === 1) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total);
      setPage(pageNum);
      setSearchQuery(query);
    } catch (err) {
      console.error("Failed to load mailboxes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    // Don't trigger search when clearing or when menu is closed
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
    if (domainName) {
      setOptions([]);
      setPage(1);
      setTotalPages(null);
      setSearchQuery("");
      fetchOptions(1, "");
    }
  }, [domainName]);

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
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
          
            // Fallback if initial value isn't in loaded options
            if (!selectedOption) {
              selectedOption = {
                label: field.value,
                value: field.value,
              };
            }
          }

          return (
            <Select
              {...field}
              value={selectedOption}
              options={options}
              placeholder={placeholder}
              onChange={(selected) => {
                field.onChange(selected ? selected.value : null);
                if (onMailboxSelect && selected) {
                  onMailboxSelect(selected);
                }
              }}
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