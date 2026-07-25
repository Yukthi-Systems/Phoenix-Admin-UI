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
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Shield,
} from "lucide-react";

const StatusBadge = ({
  status,
  variant = "default",
  size = "sm",
  showIcon = true,
  customText,
  className = "",
}) => {
  // Define status configurations
  const statusConfig = {
    active: {
      label: "Active",
      icon: CheckCircle,
      colors: "bg-success/20 text-success border-success/30",
    },
    inactive: {
      label: "Inactive",
      icon: XCircle,
      colors: "bg-muted text-muted-foreground border-border",
    },
    paid: {
      label: "Paid",
      icon: CheckCircle,
      colors: "bg-success/20 text-success border-success/30",
    },
    unpaid: {
      label: "Unpaid",
      icon: XCircle,
      colors: "bg-muted text-muted-foreground border-border",
    },
    pending: {
      label: "Pending",
      icon: Clock,
      colors: "bg-warning/20 text-warning border-warning/30",
    },
    error: {
      label: "Error",
      icon: AlertTriangle,
      colors: "bg-destructive/20 text-destructive border-destructive/30",
    },
    success: {
      label: "Success",
      icon: CheckCircle,
      colors: "bg-success/20 text-success border-success/30",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      colors: "bg-success/20 text-success border-success/30",
    },
    warning: {
      label: "Warning",
      icon: AlertTriangle,
      colors: "bg-warning/20 text-warning border-warning/30",
    },
    info: {
      label: "Info",
      icon: Info,
      colors: "bg-accent text-accent-foreground border-border",
    },
    verified: {
      label: "Verified",
      icon: Shield,
      colors: "bg-success/20 text-success border-success/30",
    },
    // Boolean-based statuses
    true: {
      label: "Active",
      icon: CheckCircle,
      colors: "bg-success/20 text-success border-success/30",
    },
    false: {
      label: "Inactive",
      icon: XCircle,
      colors: "bg-muted text-muted-foreground border-border",
    },
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      container: "px-1.5 py-0.5 text-xs",
      icon: "w-3 h-3",
    },
    sm: {
      container: "px-2 py-1 text-xs",
      icon: "w-4 h-4",
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      container: "px-4 py-2 text-sm",
      icon: "w-5 h-5",
    },
  };

  // Get configuration based on status
  const config = statusConfig[String(status)] || statusConfig.inactive;
  const sizeStyles = sizeConfig[size] || sizeConfig.sm;
  const IconComponent = config.icon;

  // Variant styles
  const variantStyles = {
    default: `inline-flex items-center gap-1.5 rounded-full font-medium border ${config.colors}`,
    pill: `inline-flex items-center gap-1.5 rounded-full font-medium ${config.colors}`,
    rounded: `inline-flex items-center gap-1.5 rounded-lg font-medium border ${config.colors}`,
    square: `inline-flex items-center gap-1.5 rounded font-medium border ${config.colors}`,
    minimal: `inline-flex items-center gap-1.5 font-medium ${config.colors.replace(/bg-\S+/g, "").replace(/border-\S+/g, "")}`,
  };

  const finalClasses =
    `${variantStyles[variant]} ${sizeStyles.container} ${className}`.trim();

  return (
    <span className={finalClasses}>
      {showIcon && <IconComponent className={sizeStyles.icon} />}
      <span>{customText || config.label}</span>
    </span>
  );
};

export default StatusBadge;
