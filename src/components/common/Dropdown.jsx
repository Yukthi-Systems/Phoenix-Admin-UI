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
import { useAtomValue } from "jotai";
import { themeAtom } from "@/store/theme";

// Helper function to get nested error from react-hook-form errors object
const getNestedError = (errors, name) => {
  return name.split(".").reduce((obj, key) => obj?.[key], errors);
};

// Get custom styles for react-select
const getSelectStyles = () => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "hsl(var(--background))",
    borderColor: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
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
      : "hsl(var(--card-foreground))",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "hsl(var(--primary))",
    borderRadius: "4px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "hsl(var(--primary-foreground))",
    fontSize: "12px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "hsl(var(--primary-foreground))",
    "&:hover": {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
  }),
  input: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
});

const ReactSelect = ({
  control,
  name,
  label,
  errors = {},
  options = [],
  placeholder = "Select option...",
  customStyle = "",
  required = false,
  onChange = null,
  isMulti = false, // Add multi-select support
  ...props
}) => {
  const error = getNestedError(errors, name);

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const handleChange = (selectedOption) => {
            if (isMulti) {
              // For multi-select, return array of values
              const values = selectedOption
                ? selectedOption.map((option) => option.value)
                : [];
              field.onChange(values);
              if (onChange) {
                onChange(selectedOption);
              }
            } else {
              // For single select, return single value
              field.onChange(selectedOption?.value || "");
              if (onChange) {
                onChange(selectedOption);
              }
            }
          };

          // Handle field value for multi-select vs single select
          const getFieldValue = () => {
            if (isMulti) {
              // For multi-select, find all matching options
              if (Array.isArray(field.value)) {
                return options.filter((option) =>
                  field.value.includes(option.value),
                );
              }
              return [];
            } else {
              // For single select, find single matching option
              return (
                options.find((option) => option.value === field.value) || null
              );
            }
          };

          return (
            <Select
              {...field}
              {...props}
              value={getFieldValue()}
              options={options}
              placeholder={placeholder}
              onChange={handleChange}
              isMulti={isMulti}
              isClearable
              styles={getSelectStyles()}
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
};

export default ReactSelect;
