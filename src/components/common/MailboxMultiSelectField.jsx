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

import { useEffect, useState, useRef } from "react";
import CreatableSelect from "react-select/creatable";
// eslint-disable-next-line no-unused-vars -- used via <components.Option> below
import { components } from "react-select";
import { X } from "lucide-react";
import { getMailboxes } from "@/api/mailbox";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { useToastify } from "@/hooks/useToastify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckboxOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => {}}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span>{props.label}</span>
    </div>
  </components.Option>
);

/**
 * Multi-select email picker: lists the domain's existing mailboxes (paginated,
 * searchable, with checkboxes) and also lets the user type in and add
 * arbitrary extra emails not in that list. Selected emails are shown in a
 * removable pill list below the dropdown. Plain controlled component
 * (value/onChange), so it drops into either local useState or a
 * react-hook-form Controller.
 */
export function MailboxMultiSelectField({
  label,
  domainName,
  value = [],
  onChange,
  placeholder = "Select a mailbox or type an email...",
  errors = {},
  name = "",
  customStyle = "",
}) {
  const error = errors?.[name];
  const toast = useToastify();

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);
  // Search strings that returned zero mailboxes for this domain. Any new
  // search that starts with one of these prefixes is guaranteed to also
  // return zero results (it's a stricter filter), so we skip the API call.
  const emptyPrefixesRef = useRef([]);

  const fetchOptions = async (pageNum = 1, query = "") => {
    if (!domainName || (totalPages && pageNum > totalPages)) return;

    const normalizedQuery = query.trim().toLowerCase();
    if (
      pageNum === 1 &&
      normalizedQuery &&
      emptyPrefixesRef.current.some((prefix) =>
        normalizedQuery.startsWith(prefix),
      )
    ) {
      setOptions([]);
      setTotalPages(1);
      setPage(1);
      setSearchQuery(query);
      return;
    }

    setLoading(true);
    try {
      const data = await getMailboxes(domainName, pageNum, 50, query);
      const mailboxList = data?.mailboxes || [];
      const total = data?.total_pages || 1;

      if (pageNum === 1 && mailboxList.length === 0 && normalizedQuery) {
        emptyPrefixesRef.current = [
          ...emptyPrefixesRef.current.filter(
            (prefix) => !prefix.startsWith(normalizedQuery),
          ),
          normalizedQuery,
        ];
      }

      const newOptions = mailboxList.map((item) => ({
        label: item.email,
        value: item.email,
      }));

      setOptions((prev) =>
        pageNum === 1 ? newOptions : [...prev, ...newOptions],
      );
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
    if (
      actionMeta.action === "input-blur" ||
      actionMeta.action === "menu-close"
    ) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
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
    emptyPrefixesRef.current = [];
    if (domainName) {
      fetchOptions(1, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainName]);

  // Reconcile already-selected emails that aren't on the currently loaded
  // options page (custom/typed emails, or edit-mode values before fetch lands)
  const selectedOptions = (value || []).map((email) => {
    const existing = options.find(
      (opt) => opt.value.toLowerCase() === email.toLowerCase(),
    );
    return existing || { label: email, value: email };
  });

  const addEmails = (emails) => {
    const existingLower = new Set((value || []).map((e) => e.toLowerCase()));
    const toAdd = emails.filter((e) => !existingLower.has(e.toLowerCase()));
    if (toAdd.length) {
      onChange?.([...(value || []), ...toAdd]);
    }
  };

  const handleChange = (selected) => {
    onChange?.((selected || []).map((opt) => opt.value));
  };

  const handleCreate = (inputValue) => {
    const trimmed = inputValue.trim();
    if (!emailRegex.test(trimmed)) {
      toast("error", "Enter a valid email address");
      return;
    }
    if (
      (value || []).some(
        (email) => email.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast("error", "This email has already been added");
      return;
    }
    setOptions((prev) =>
      prev.some((opt) => opt.value.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, { label: trimmed, value: trimmed }],
    );
    addEmails([trimmed]);
  };

  const removeEmail = (email) => {
    onChange?.((value || []).filter((e) => e !== email));
  };

  const selectStyles = {
    ...getReactSelectStyles(),
    control: (provided, state) => ({
      ...getReactSelectStyles().control(provided, state),
      minHeight: "42px",
      borderRadius: "6px",
      fontSize: "1rem",
    }),
    option: (provided, state) => ({
      ...getReactSelectStyles().option(provided, state),
      // Softer highlight for selected mailboxes — the checkbox already
      // conveys selection, so a solid primary block reads too harsh here.
      backgroundColor: state.isSelected
        ? "hsl(var(--primary) / 0.12)"
        : state.isFocused && !state.isDisabled
          ? "hsl(var(--accent))"
          : "transparent",
      color: state.isDisabled
        ? "hsl(var(--muted-foreground))"
        : "hsl(var(--foreground))",
    }),
  };

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-2 text-left">
          {label}
        </label>
      )}
      <div className="mb-4">
        <CreatableSelect
          isMulti
          value={selectedOptions}
          options={options}
          placeholder={placeholder}
          onChange={handleChange}
          onCreateOption={handleCreate}
          isValidNewOption={(inputValue) => inputValue.trim().length > 0}
          formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
          onMenuScrollToBottom={handleMenuScrollToBottom}
          onInputChange={handleInputChange}
          isLoading={loading}
          menuPlacement="auto"
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          controlShouldRenderValue={false}
          components={{ Option: CheckboxOption }}
          styles={selectStyles}
          menuPortalTarget={document.body}
          classNamePrefix="react-select"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}

      <div className="space-y-3 border rounded p-2">
        {(value || []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">
              Select a mailbox or type an email above
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">
                {value.length} {value.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => onChange?.([])}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {value.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 bg-card border border-border/50 rounded-full px-3 py-1.5
                                hover:border-border hover:shadow-sm transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                      {email}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="p-0.5 text-destructive hover:bg-destructive/20 rounded-full transition-colors duration-200"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MailboxMultiSelectField;
