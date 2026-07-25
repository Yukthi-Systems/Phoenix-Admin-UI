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

import { sanitizeInput } from "@/utils/purify";
import { Eye, EyeClosed, Info } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export function Input({
  label = "",
  type = "text",
  register,
  errors = {},
  name = "",
  customStyle = "",
  disabled = false,
  icon = null,
  info = "",
  borderColor = "",
  placeholder = "",
  isRequired = false,
  enableSanitization = true,
  ...props
}) {
  const { t } = useTranslation();
  const error = getNestedError(errors, name);
  const inputRef = useRef(null);

  const getBorderColor = () => {
    if (error) return "border border-destructive";
    if (borderColor) return borderColor;
    return " border-border";
  };

  const handleInput = (e) => {
    if (enableSanitization) {
      const cursorPosition = e.target.selectionStart;
      const originalValue = e.target.value;
      const sanitizedValue = sanitizeInput(originalValue);

      if (sanitizedValue !== originalValue) {
        e.target.value = sanitizedValue;
        const newCursorPosition = Math.max(
          0,
          cursorPosition - (originalValue.length - sanitizedValue.length),
        );
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        }, 0);
      }
    }
  };

  const registerProps = register ? register(name) : {};

  return (
    <div className={`${customStyle && customStyle} w-full`}>
      <label className="text-card-foreground block text-left text-sm font-medium">
        {t(label) || ""}
        {isRequired ? <span className="text-red-500"> *</span> : ""}
      </label>
      <div className="relative">
        <input
          ref={(el) => {
            inputRef.current = el;
            if (registerProps.ref) {
              if (typeof registerProps.ref === "function") {
                registerProps.ref(el);
              } else {
                registerProps.ref.current = el;
              }
            }
          }}
          placeholder={t(placeholder)}
          type={type}
          className={`mt-1 w-full rounded-md border ${getBorderColor()} bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted placeholder:text-muted-foreground p-2 transition-colors duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pr-8" : ""} `}
          disabled={disabled}
          name={registerProps.name}
          onChange={registerProps.onChange}
          onBlur={registerProps.onBlur}
          autoComplete="off"
          onInput={handleInput}
          {...props}
        />
        {icon && (
          <div className="absolute top-1/2 right-2 mt-0.5 -translate-y-1/2 transform">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-destructive mt-1 text-sm text-left">
          {error.message}
        </p>
      )}
      {!error && info && (
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm text-left">
          {" "}
          <Info className="h-4 w-4" />
          {info}
        </p>
      )}
    </div>
  );
}

export function InputOnly({
  label = "",
  type = "text",
  name = "",
  customStyle = "",
  disabled = false,
  icon = null,
  borderColor = "",
  placeholder = "",
  isRequired = false,
  ...props
}) {
  const { t } = useTranslation();

  const getBorderColor = () => {
    if (borderColor) return borderColor;
    return " border-border";
  };

  return (
    <div className={`${customStyle && customStyle} w-full`}>
      <label className="text-card-foreground block text-left text-sm font-medium">
        {t(label) || ""}
        {isRequired ? <span className="text-red-500"> *</span> : ""}
      </label>
      <div className="relative">
        <input
          name={name}
          placeholder={t(placeholder)}
          type={type}
          className={`mt-1 w-full rounded-md border ${getBorderColor()} bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted placeholder:text-muted-foreground p-2 transition-colors duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${icon ? "pr-8" : ""} `}
          disabled={disabled}
          {...props}
          autoComplete="off"
        />
        {icon && (
          <div className="absolute top-1/2 right-2 mt-0.5 -translate-y-1/2 transform">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Checkbox({
  label = "",
  register,
  errors = {},
  name = "",
  customStyle = "",
  disabled = false,
}) {
  const { t } = useTranslation();
  return (
    <div className={`${customStyle && customStyle} flex items-center`}>
      <div className={`flex w-full items-center space-x-2`}>
        <input
          type="checkbox"
          disabled={disabled}
          className={`border-border text-primary focus:ring-primary bg-background h-5 w-5 rounded-sm border transition-colors duration-200 focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50`}
          {...register(name)}
        />
        <label className="text-foreground text-sm font-medium">
          {t(label) || ""}
        </label>
      </div>
      {errors[name] && (
        <p className="text-destructive mt-1 text-sm">{errors[name].message}</p>
      )}
    </div>
  );
}

export function PasswordInput({
  label = "Password",
  register,
  errors = {},
  name = "",
  customStyle = "",
  disabled = false,
  placeholder = "",
  isRequired = false,
  enableSanitization = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const error = getNestedError(errors, name);
  const { t } = useTranslation();
  const inputRef = useRef(null);

  // Handle sanitization on input
  const handleInput = (e) => {
    if (enableSanitization) {
      const cursorPosition = e.target.selectionStart;
      const originalValue = e.target.value;
      const sanitizedValue = sanitizeInput(originalValue);

      if (sanitizedValue !== originalValue) {
        e.target.value = sanitizedValue;
        // Restore cursor position
        const newCursorPosition = Math.max(
          0,
          cursorPosition - (originalValue.length - sanitizedValue.length),
        );
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        }, 0);
      }
    }
  };

  const registerProps = register ? register(name) : {};

  return (
    <div className={`${customStyle && customStyle} w-full`}>
      <label className="text-card-foreground block text-left text-sm font-medium">
        {t(label) || ""}
        {isRequired ? <span className="text-red-500"> *</span> : ""}
      </label>
      <div className="relative mt-1">
        <input
          ref={(el) => {
            inputRef.current = el;
            if (registerProps.ref) {
              if (typeof registerProps.ref === "function") {
                registerProps.ref(el);
              } else {
                registerProps.ref.current = el;
              }
            }
          }}
          placeholder={t(placeholder)}
          type={showPassword ? "text" : "password"}
          className="border-border bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted placeholder:text-muted-foreground w-full rounded-md border p-2 pr-10 transition-colors duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          name={registerProps.name}
          onChange={registerProps.onChange}
          onBlur={registerProps.onBlur}
          onInput={handleInput}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-muted-foreground hover:text-card-foreground absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeClosed className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-destructive text-left mt-1 text-sm">{error.message}</p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  register,
  options = [],
  errors = {},
  customStyle = "",
  placeholder = "",
  isRequired = false,
}) {
  const error = getNestedError(errors, name);
  const { t } = useTranslation();
  return (
    <div className={`${customStyle && customStyle} w-full`}>
      <label className="text-card-foreground block text-left text-sm font-medium">
        {t(label) || ""}
        {isRequired ? <span className="text-red-500"> *</span> : ""}
      </label>
      <select
        {...register(name)}
        className="border-border bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted mt-2 w-full rounded-md border py-2.5 px-2 text-sm transition-colors duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {t(placeholder)}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-card text-card-foreground text-sm"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-destructive mt-1 text-sm">{error.message}</p>
      )}
    </div>
  );
}

export function TextArea({
  label = "",
  register,
  errors = {},
  name = "",
  customStyle = "",
  disabled = false,
  info = "",
  borderColor = "",
  placeholder = "",
  rows = 4,
  isRequired = false,
  enableSanitization = true,
  ...props
}) {
  const error = getNestedError(errors, name);
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  const getBorderColor = () => {
    if (error) return "border border-destructive";
    if (borderColor) return borderColor;
    return " border-border";
  };

  // Handle sanitization on input
  const handleInput = (e) => {
    if (enableSanitization) {
      const cursorPosition = e.target.selectionStart;
      const originalValue = e.target.value;
      const sanitizedValue = sanitizeInput(originalValue);

      if (sanitizedValue !== originalValue) {
        e.target.value = sanitizedValue;
        // Restore cursor position
        const newCursorPosition = Math.max(
          0,
          cursorPosition - (originalValue.length - sanitizedValue.length),
        );
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        }, 0);
      }
    }
  };

  const registerProps = register ? register(name) : {};

  return (
    <div className={`${customStyle && customStyle} w-full`}>
      {label && (
        <label className="text-card-foreground block text-left text-sm font-medium">
          {t(label) || ""}
          {isRequired ? <span className="text-red-500"> *</span> : ""}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            if (registerProps.ref) {
              if (typeof registerProps.ref === "function") {
                registerProps.ref(el);
              } else {
                registerProps.ref.current = el;
              }
            }
          }}
          placeholder={t(placeholder)}
          rows={rows}
          className={`mt-1 w-full rounded-md border ${getBorderColor()} bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted placeholder:text-muted-foreground resize-vertical min-h-[80px] p-2 transition-colors duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={disabled}
          name={registerProps.name}
          onChange={registerProps.onChange}
          onBlur={registerProps.onBlur}
          onInput={handleInput}
          {...props}
        />
      </div>
      {error && (
        <p className="text-destructive mt-1 text-sm text-left">{error.message}</p>
      )}
      {!error && info && (
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <Info className="h-4 w-4" />
          {info}
        </p>
      )}
    </div>
  );
}

export function ControlledInput({
  label = "",
  type = "text",
  value,
  onChange,
  error = null,
  customStyle = "",
  disabled = false,
  icon = null,
  info = "",
  placeholder = "",
  min,
  max,
  step,
  isRequired = false,
  ...props
}) {
  const { t } = useTranslation();
  // Updated classes using your project's CSS custom properties
  const inputClasses = `
    mt-1 w-full rounded-md border p-2 transition-colors duration-200
    bg-background text-foreground placeholder:text-muted-foreground
    ${error
      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
      : "border-border focus:border-primary hover:border-border/80"
    }
    ${disabled ? "opacity-50 cursor-not-allowed bg-muted" : "hover:bg-accent/50"
    }
    focus:ring-2 focus:ring-offset-0 focus:outline-none
    ${icon ? "pr-8" : ""}
    ${type === "datetime-local" ? "text-sm" : ""}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className={`${customStyle} w-full`}>
      {label && (
        <label className="text-foreground block text-left text-sm font-medium">
          {t(label) || ""}
          {isRequired ? <span className="text-red-500"> *</span> : ""}
        </label>
      )}
      <div className="relative">
        <input
          placeholder={t(placeholder)}
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
          disabled={disabled}
          {...props}
          autoComplete="off"
        />
        {icon && (
          <div className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 transform">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-destructive mt-1 flex items-center gap-1 text-sm">
          <Info className="h-4 w-4" />
          {error}
        </p>
      )}
      {!error && info && (
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <Info className="h-4 w-4" />
          {info}
        </p>
      )}
    </div>
  );
}

export function SelectFieldOnly({
  label,
  name,
  options = [],
  customStyle = "",
  placeholder = "",
  isRequired = false,
  onChange,
  value,
}) {
  const { t } = useTranslation();
  const selectedOption = options.find((opt) => opt.value === value) || null;
  const handleChange = (selected) => {
    onChange(selected?.target?.value ? selected?.target?.value : null);
  };
  return (
    <div className={`${customStyle && customStyle} w-full`}>
      <label className="text-card-foreground block text-left text-sm font-medium">
        {t(label) || ""}
        {isRequired ? <span className="text-red-500"> *</span> : ""}
      </label>
      <select
        value={selectedOption?.value || null}
        name={name}
        onChange={(selected) => handleChange(selected)}
        className="border-border bg-card text-card-foreground focus:border-primary focus:ring-primary disabled:bg-muted mt-1 w-full rounded-md border p-2 text-sm transition-colors duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placeholder && <option value="">{t(placeholder)}</option>}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-card text-card-foreground text-sm"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Validation helper function
export function getNestedError(obj, path) {
  return path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);
}
