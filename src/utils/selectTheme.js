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

/**
 * Get themed styles for react-select components
 * Uses your CSS variables for consistent theming across light/dark modes
 */
export const getReactSelectStyles = () => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? "hsl(var(--muted))" : "hsl(var(--background))",
    borderColor: state.isFocused ? "hsl(var(--primary))" : "hsl(var(--border))",
    color: "hsl(var(--foreground))",
    textAlign: "left",
    boxShadow: state.isFocused ? "0 0 0 1px hsl(var(--primary))" : "none",
    opacity: state.isDisabled ? 0.6 : 1,
    cursor: state.isDisabled ? "not-allowed" : "default",
    "&:hover": {
      borderColor: state.isDisabled ? "hsl(var(--border))" : "hsl(var(--primary))",
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
      : state.isFocused && !state.isDisabled
        ? "hsl(var(--accent))"
        : "transparent",
    color: state.isDisabled
      ? "hsl(var(--muted-foreground))"
      : state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
    cursor: state.isDisabled ? "not-allowed" : "default",
    opacity: state.isDisabled ? 0.5 : 1,
    "&:hover": !state.isDisabled
      ? {
        backgroundColor: "hsl(var(--accent))",
        color: "hsl(var(--accent-foreground))",
      }
      : undefined,
    textAlign: "left",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "hsl(var(--muted))",
    border: "1px solid hsl(var(--border))",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
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
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    "&:hover": {
      color: "hsl(var(--foreground))",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    "&:hover": {
      color: "hsl(var(--destructive))",
    },
  }),
  loadingIndicator: (provided) => ({
    ...provided,
    color: "hsl(var(--primary))",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
});
