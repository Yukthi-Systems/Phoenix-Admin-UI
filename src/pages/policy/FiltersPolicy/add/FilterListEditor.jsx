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
import { X, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Buttons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_REGEX =
  /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

const FiltersListEditor = ({
  list = [],
  setList,
  placeholder = "Add entry...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput) return;

    // Validate Input (Must be valid Email OR Valid Domain)
    const isEmail = EMAIL_REGEX.test(trimmedInput);
    const isDomain = DOMAIN_REGEX.test(trimmedInput);

    if (!isEmail && !isDomain) {
      setError("Please enter a valid email address or domain name.");
      return;
    }

    if (list.includes(trimmedInput)) {
      setError("This entry already exists in the list.");
      return;
    }

    setList([...list, trimmedInput]);
    setInputValue("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  return (
    <div className="w-full space-y-3 text-left">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              error
                ? "border-destructive focus:ring-destructive/50"
                : "border-border"
            }`}
          />
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          variant="primary"
          className="shrink-0"
          disabled={!inputValue.trim()}
          icon={Plus}
        >
          Add
        </Button>
      </div>

      {error && (
        <div className="flex items-center text-xs text-destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}

      <div className="bg-muted/30 rounded-md border border-border p-2 min-h-[100px] max-h-[300px] overflow-y-auto">
        {list.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic py-8">
            No entries added yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {list.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive focus:outline-none"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {item}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-right text-xs text-muted-foreground">
        Total entries: {list.length}
      </div>
    </div>
  );
};

export default FiltersListEditor;
