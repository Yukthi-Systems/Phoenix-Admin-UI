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

import {
  ArrowLeft,
  ArrowRightLeft,
  Loader2,
  Plus,
  SquarePen,
  Trash,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function SubmitButton({ isPending = false, label = "Create" }) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      className={`cosmic-button px-6 py-2.5 text-primary-foreground rounded-lg text-sm font-medium shadow-sm transition-all duration-200 transform
                 ${
                   isPending
                     ? "bg-primary/50 cursor-not-allowed scale-95"
                     : "bg-primary hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95"
                 }`}
      disabled={isPending}
    >
      {isPending ? t("Processing...") : t(label) || ""}
    </button>
  );
}

export function AddButton({
  disabled = false,
  label = "Add",
  handleClick = () => {},
  icon = true,
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`inline-flex text-nowrap items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                 ${
                   disabled
                     ? "bg-muted text-muted-foreground border-border cursor-not-allowed hover:shadow-none hover:translate-y-0"
                     : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                 }`}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon && <Plus className={`w-4 h-4 ${disabled ? "opacity-50" : ""}`} />}
      {t(label)}
    </button>
  );
}

export function BackButton({
  disabled = false,
  label = "Back",
  showLabel = false,
  hasFunction = false,
  handleClick = () => {},
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-2 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-1
                 ${
                   disabled
                     ? "text-muted-foreground cursor-not-allowed"
                     : "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-95 focus:ring-accent"
                 }`}
      disabled={disabled}
      onClick={hasFunction ? handleClick : () => navigate(-1)}
    >
      <ArrowLeft
        className={`w-4 h-4 flex-shrink-0 ${disabled ? "opacity-50" : ""}`}
      />
      {showLabel && (
        <span className={disabled ? "opacity-50" : ""}>{t(label) || ""}</span>
      )}
    </button>
  );
}

export function EditButton({
  disabled = false,
  label = "Edit",
  handleClick = () => {},
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`px-4 py-2 flex gap-2 items-center text-sm font-medium rounded-lg border transition-all duration-200 transform shadow-sm
                 ${
                   disabled
                     ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                     : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-95 dark:bg-blue-500 dark:text-white dark:border-blue-500 dark:hover:bg-blue-600 dark:hover:border-blue-600"
                 }`}
      disabled={disabled}
      onClick={handleClick}
    >
      <SquarePen size={16} className={disabled ? "opacity-50" : ""} />
      {t(label) || ""}
    </button>
  );
}

export function DeleteButton({
  disabled = false,
  label = "Delete",
  handleClick = () => {},
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`px-4 py-2 flex gap-2 items-center text-sm font-medium rounded-lg border transition-all duration-200 transform shadow-sm
                 ${
                   disabled
                     ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                     : "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 hover:shadow-md hover:scale-[1.02] active:scale-95 dark:bg-red-500 dark:text-white dark:border-red-500 dark:hover:bg-red-600 dark:hover:border-red-600"
                 }`}
      disabled={disabled}
      onClick={handleClick}
    >
      <Trash size={16} className={disabled ? "opacity-50" : ""} />
      {t(label) || ""}
    </button>
  );
}

export function TableEditButton({
  disabled = false,
  handleClick = () => {},
  tooltip = "Edit",
  label = null,
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`inline-flex  ${label ? "border border-blue-500" : ""} items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 transform shadow-sm group relative text-sm font-medium
                 ${
                   disabled
                     ? "text-muted-foreground cursor-not-allowed opacity-50"
                     : "text-blue-600 hover:text-blue-700  hover:shadow hover:scale-[1.02] active:scale-95 dark:text-blue-400 dark:hover:text-blue-300 "
                 }`}
      disabled={disabled}
      onClick={handleClick}
      title={t(tooltip)}
    >
      <SquarePen className="w-4 h-4 flex-shrink-0" />
      {label && <span>{label}</span>}
    </button>
  );
}

export function TableDeleteButton({
  disabled = false,
  handleClick = () => {},
  tooltip = "Delete",
  label = null, // Optional text label
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`inline-flex ${label ? (disabled ? "border border-border" : "border border-red-500") : ""} items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 transform shadow-sm group relative text-sm font-medium
    ${
      disabled
        ? "text-muted-foreground cursor-not-allowed opacity-50"
        : "text-red-600 hover:text-red-700   hover:shadow hover:scale-[1.02] active:scale-95 dark:text-red-400 dark:hover:text-red-300 "
    }`}
      disabled={disabled}
      onClick={handleClick}
      title={t(tooltip)}
    >
      <Trash className="w-4 h-4 flex-shrink-0" />
      {label && <span>{t(label)}</span>}
    </button>
  );
}

export function TableMoveButton({
  disabled = false,
  handleClick = () => {},
  tooltip = "Move",
  label = null, // Optional text label
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`inline-flex ${label ? (disabled ? "border border-border" : "border border-red-500") : ""} items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 transform shadow-sm group relative text-sm font-medium
    ${
      disabled
        ? "text-muted-foreground cursor-not-allowed opacity-50"
        : "text-red-600 hover:text-red-700   hover:shadow hover:scale-[1.02] active:scale-95 dark:text-red-400 dark:hover:text-red-300 "
    }`}
      disabled={disabled}
      onClick={handleClick}
      title={t(tooltip)}
    >
      <ArrowRightLeft className="w-4 h-4 flex-shrink-0" />
      {label && <span>{t(label)}</span>}
    </button>
  );
}

export function TableCancelButton({
  disabled = false,
  label = "Cancel",
  handleClick = () => {},
}) {
  const { t } = useTranslation();
  return (
    <button
      className={`px-3 h-10 py-1.5 text-xs font-medium rounded-md transition-all duration-200 transform border 
                 ${
                   disabled
                     ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                     : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-border active:scale-95"
                 }`}
      disabled={disabled}
      onClick={handleClick}
    >
      {t(label) || ""}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  disabled = false,
  handleClick = () => {},
  tooltip = "",
  label = null,
  variant = "default", // 'default', 'primary', 'secondary', 'danger'
}) {
  const getVariantStyles = () => {
    if (disabled) {
      return "text-muted-foreground cursor-not-allowed opacity-50";
    }

    switch (variant) {
      case "primary":
        return "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300";
      case "yellow":
        return "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300";
      case "success":
        return "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300";
      case "secondary":
        return "text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300";
      case "danger":
        return "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300";
      default:
        return "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300";
    }
  };

  return (
    <button
      className={`inline-flex ${
        label ? "border border-blue-500" : ""
      } items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 transform shadow-sm group relative text-sm font-medium hover:shadow hover:scale-[1.02] active:scale-95 ${getVariantStyles()}`}
      disabled={disabled}
      onClick={handleClick}
      title={tooltip}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {label && <span>{label}</span>}
    </button>
  );
}

// Generic Button Component
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = "left",
  onClick = () => {},
  type = "button",
  className = "",
  ...props
}) {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-1";

  // Size variants
  const sizeStyles = {
    xs: "px-2 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2",
    xl: "px-8 py-3 text-lg gap-3",
  };

  // Variant styles
  const variantStyles = {
    primary:
      disabled || loading
        ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-95 focus:ring-primary/50",

    secondary:
      disabled || loading
        ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        : "bg-card text-foreground border border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-sm hover:scale-[1.02] active:scale-95 focus:ring-border",

    destructive:
      disabled || loading
        ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        : "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:scale-[1.02] active:scale-95 focus:ring-destructive/50",

    success:
      disabled || loading
        ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        : "bg-success text-success-foreground hover:bg-success/90 hover:shadow-md hover:scale-[1.02] active:scale-95 focus:ring-success/50",

    warning:
      disabled || loading
        ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
        : "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-md hover:scale-[1.02] active:scale-95 focus:ring-warning/50",

    outline:
      disabled || loading
        ? "border border-border text-muted-foreground cursor-not-allowed"
        : "border border-border text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-sm hover:scale-[1.02] active:scale-95 focus:ring-border",

    ghost:
      disabled || loading
        ? "text-muted-foreground cursor-not-allowed"
        : "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-95 focus:ring-accent",

    link:
      disabled || loading
        ? "text-muted-foreground cursor-not-allowed"
        : "text-primary underline-offset-4 hover:underline hover:scale-[1.02] active:scale-95 focus:ring-primary/50",
  };

  // Loading/disabled styles
  const stateStyles = loading || disabled ? "scale-95" : "";

  // Combine all styles
  const finalClassName =
    `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${stateStyles} ${className}`.trim();

  // Icon size based on button size
  const getIconSize = (size) => {
    switch (size) {
      case "xs":
        return "w-3 h-3";
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-5 h-5";
      case "xl":
        return "w-6 h-6";
      default:
        return "w-4 h-4";
    }
  };

  const iconSize = getIconSize(size);

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className={`${iconSize} animate-spin flex-shrink-0`} />
      )}

      {Icon && iconPosition === "left" && !loading && (
        <Icon
          className={`${iconSize} flex-shrink-0 ${disabled ? "opacity-50" : ""}`}
        />
      )}

      <span className={disabled && !loading ? "opacity-50" : ""}>
        {children}
      </span>

      {Icon && iconPosition === "right" && !loading && (
        <Icon
          className={`${iconSize} flex-shrink-0 ${disabled ? "opacity-50" : ""}`}
        />
      )}
    </button>
  );
}
