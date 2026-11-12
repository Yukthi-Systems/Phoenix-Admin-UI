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

// These forms take an Email Identity's credentials, never the logged-in
// admin's, so browser/password-manager autofill would put the wrong
// account in. Callers pass autoComplete="off" (text) or "new-password"
// (password - browsers ignore "off" there); these cover 1Password/LastPass.
const NO_PASSWORD_MANAGER = { "data-1p-ignore": true, "data-lpignore": "true" };
import { AlertCircle, Eye, EyeClosed, Loader } from "lucide-react";

const inputClass = (hasError) =>
  `cosmic-input w-full rounded-lg border px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none ${
    hasError
      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
      : "border-border focus:border-primary focus:ring-primary/20"
  }`;

export const FieldError = ({ error }) =>
  error ? (
    <p className="text-destructive flex items-center gap-1 text-sm">
      <span className="bg-destructive h-1 w-1 shrink-0 rounded-full" />
      {error.message}
    </p>
  ) : null;

export const TextField = ({
  id,
  label,
  error,
  registration,
  ...inputProps
}) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-card-foreground block text-sm font-medium"
    >
      {label}
    </label>
    <input
      id={id}
      {...NO_PASSWORD_MANAGER}
      className={inputClass(error)}
      {...inputProps}
      {...registration}
    />
    <FieldError error={error} />
  </div>
);

export const PasswordField = ({
  id,
  label,
  error,
  registration,
  autoComplete,
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-card-foreground block text-sm font-medium"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...NO_PASSWORD_MANAGER}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${inputClass(error)} pr-12`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 transition-colors"
        >
          {visible ? (
            <EyeClosed className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <FieldError error={error} />
    </div>
  );
};

export const ErrorBanner = ({ message }) =>
  message ? (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  ) : null;

export const SubmitButton = ({
  pending,
  disabled,
  icon: Icon,
  label,
  pendingLabel,
}) => {
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`cosmic-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
        isDisabled
          ? "bg-primary/50 text-primary-foreground cursor-not-allowed opacity-60"
          : "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
      }`}
    >
      {pending ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export const LinkButton = ({ onClick, icon: Icon, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span>{children}</span>
  </button>
);
