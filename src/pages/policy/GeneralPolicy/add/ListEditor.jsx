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

import { useState } from "react";
import { X, Plus, Edit2, Save } from "lucide-react";
import { useToastify } from "@/hooks/useToastify";

const ListEditor = ({
  label,
  list,
  setList,
  placeholder = "",
  type = "text",
  domainLists = [],
}) => {
  const toast = useToastify();
  const [newItem, setNewItem] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateDomain = (domain) => {
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[A-Za-z]{2,}$/;
    return domainRegex.test(domain);
  };

  const validateEntry = (value, entryType) => {
    if (entryType === "email") {
      return validateEmail(value);
    } else if (entryType === "domain") {
      return validateDomain(value);
    }
    return true;
  };

  // Extract domain from email
  const extractDomainFromEmail = (email) => {
    const parts = email.split("@");
    return parts.length === 2 ? parts[1] : null;
  };

  // Check if email domain exists in any domain list
  const isEmailDomainInDomainLists = (email) => {
    const domain = extractDomainFromEmail(email);
    if (!domain) return false;

    return domainLists.some((domainList) =>
      domainList.some((domainItem) => domainItem === domain),
    );
  };

  // Process comma-separated values and return valid items
  const processCommaSeparatedValues = (input) => {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
      .filter((item) => validateEntry(item, type));
  };

  const addItem = () => {
    const trimmed = newItem.trim();

    if (!trimmed) {
      toast(
        "error",
        `${type === "email" ? "Email" : type === "domain" ? "Domain" : "Entry"} cannot be empty`,
      );
      return;
    }

    // Check if input contains commas
    if (trimmed.includes(",")) {
      let itemsToAdd = processCommaSeparatedValues(trimmed);

      if (itemsToAdd.length === 0) {
        toast(
          "error",
          `No valid ${type === "email" ? "emails" : type === "domain" ? "domains" : "entries"} found`,
        );
        return;
      }

      // For emails: check if any email domains are in domain lists
      if (type === "email" && domainLists.length > 0) {
        const emailsWithDomainConflict = itemsToAdd.filter((email) =>
          isEmailDomainInDomainLists(email),
        );
        if (emailsWithDomainConflict.length > 0) {
          const conflictDomains = [
            ...new Set(emailsWithDomainConflict.map(extractDomainFromEmail)),
          ];
          toast(
            "error",
            `Cannot add emails from domains already in domain lists: ${conflictDomains.join(", ")}`,
          );
          return;
        }
      }

      // Remove duplicates from the input itself first
      const uniqueItems = [...new Set(itemsToAdd)];
      const duplicateCount = itemsToAdd.length - uniqueItems.length;

      // Now filter out items that already exist in the list
      const finalItemsToAdd = uniqueItems.filter(
        (item) => !list.includes(item),
      );

      if (finalItemsToAdd.length === 0) {
        if (duplicateCount > 0) {
          toast(
            "error",
            `All ${type === "email" ? "emails" : type === "domain" ? "domains" : "entries"} are duplicates or already in the list`,
          );
        } else {
          toast(
            "error",
            `All ${type === "email" ? "emails" : type === "domain" ? "domains" : "entries"} are already in the list`,
          );
        }
        return;
      }

      // Show warnings if duplicates were removed
      if (duplicateCount > 0) {
        toast(
          "warning",
          `Removed ${duplicateCount} duplicate${duplicateCount > 1 ? "s" : ""} from input`,
        );
      }

      setList([...list, ...finalItemsToAdd]);
      setNewItem("");

      toast(
        "success",
        `Added ${finalItemsToAdd.length} ${type === "email" ? "email" : type === "domain" ? "domain" : "entry"}${finalItemsToAdd.length > 1 ? "s" : ""}`,
      );

      return;
    }

    // Single item processing
    if (!validateEntry(trimmed, type)) {
      toast(
        "error",
        `Please enter a valid ${type === "email" ? "email address" : type === "domain" ? "domain" : "entry"}`,
      );
      return;
    }

    // For emails: check if email domain is in any domain list
    if (type === "email" && domainLists.length > 0) {
      if (isEmailDomainInDomainLists(trimmed)) {
        const domain = extractDomainFromEmail(trimmed);
        toast(
          "error",
          `Cannot add email from domain '${domain}' which is already in domain list`,
        );
        return;
      }
    }

    if (list.includes(trimmed)) {
      toast(
        "error",
        `Duplicate ${type === "email" ? "email" : type === "domain" ? "domain" : "entry"} not allowed`,
      );
      return;
    }

    setList([...list, trimmed]);
    setNewItem("");
    toast(
      "success",
      `Added ${type === "email" ? "email" : type === "domain" ? "domain" : "entry"} successfully`,
    );
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const saveEdit = (index) => {
    const trimmed = editValue.trim();

    if (!trimmed) {
      toast(
        "error",
        `${type === "email" ? "Email" : type === "domain" ? "Domain" : "Entry"} cannot be empty`,
      );
      return;
    }

    // For edit mode, don't allow comma-separated values
    if (trimmed.includes(",")) {
      toast(
        "error",
        "Cannot edit multiple values at once. Please enter a single value.",
      );
      return;
    }

    if (!validateEntry(trimmed, type)) {
      toast(
        "error",
        `Please enter a valid ${type === "email" ? "email address" : type === "domain" ? "domain" : "entry"}`,
      );
      return;
    }

    // For emails: check if email domain is in any domain list (only if the value changed)
    if (type === "email" && domainLists.length > 0 && list[index] !== trimmed) {
      if (isEmailDomainInDomainLists(trimmed)) {
        const domain = extractDomainFromEmail(trimmed);
        toast(
          "error",
          `Cannot update email to domain '${domain}' which is already in domain list`,
        );
        return;
      }
    }

    if (list.includes(trimmed) && list[index] !== trimmed) {
      toast(
        "error",
        `Duplicate ${type === "email" ? "email" : type === "domain" ? "domain" : "entry"} not allowed`,
      );
      return;
    }

    const updated = [...list];
    updated[index] = trimmed;
    setList(updated);
    setEditIndex(null);
    setEditValue("");
    toast(
      "success",
      `Updated ${type === "email" ? "email" : type === "domain" ? "domain" : "entry"} successfully`,
    );
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return `Enter ${type === "email" ? "emails" : type === "domain" ? "domains" : "entries"} separated by commas`;
  };

  return (
    <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground px-2 text-left text-base font-medium">
        {label}
      </legend>

      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="text-card-foreground placeholder:text-muted-foreground border-border focus:border-primary focus:ring-primary w-full rounded-md border bg-card p-2 
                     transition-colors duration-200 focus:outline-none focus:ring-1"
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 font-medium 
                   transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="text-sm">No entries added yet</p>
            <p className="mt-1 text-xs">
              Add{" "}
              {type === "email"
                ? "email addresses"
                : type === "domain"
                  ? "domains"
                  : "entries"}
              {type !== "text" && " separated by commas"} using the input above
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-card-foreground text-sm font-medium">
                {list.length} {list.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => setList([])}
                className="text-destructive hover:text-destructive/80 text-xs transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="bg-muted/30 border-border max-h-48 overflow-y-auto rounded-lg border p-3">
              <div className="flex flex-wrap gap-2">
                {list.map((item, idx) => (
                  <div key={idx} className="group relative">
                    {editIndex === idx ? (
                      <div className="border-primary flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 shadow-sm">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="min-w-0 border-none bg-transparent text-sm outline-none focus:ring-0"
                          style={{
                            width: `${Math.max(editValue.length * 8 + 20, 120)}px`,
                          }}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") saveEdit(idx);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <div className="ml-1 flex gap-0.5">
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="text-success hover:bg-success/20 rounded-full p-0.5 transition-colors duration-200"
                            title="Save"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-muted-foreground hover:bg-muted rounded-full p-0.5 transition-colors duration-200"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-border/50 hover:border-border flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 
                                    transition-all duration-200 hover:shadow-sm"
                      >
                        <span className="text-card-foreground whitespace-nowrap text-sm font-medium">
                          {item}
                        </span>

                        <div className="ml-1 flex gap-0.5  transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => {
                              setEditIndex(idx);
                              setEditValue(item);
                            }}
                            className="text-primary hover:bg-primary/20 rounded-full p-0.5 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(idx)}
                            className="text-destructive hover:bg-destructive/20 rounded-full p-0.5 transition-colors duration-200"
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </fieldset>
  );
};

export default ListEditor;
