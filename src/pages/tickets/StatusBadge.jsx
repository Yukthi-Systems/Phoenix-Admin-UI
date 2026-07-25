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

import React from "react";
import { CheckCircle, Clock, Circle, HelpCircle } from "lucide-react";

const StatusBadge = ({ 
  status, 
  variant = "default", 
  className = "" 
}) => {
  // Normalize status for case-insensitive matching
  const normalizedStatus = status?.toString().toLowerCase().replace(" ", "_") || "unknown";

  const statusConfig = {
    // 1. OPEN -> Primary Theme Color (Blue/Indigo defined in CSS)
    open: {
      label: "Open",
      icon: Circle,
      // Uses --primary variable with opacity for background, solid for text
      colors: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
    },
    
    // 2. IN PROGRESS -> Warning Theme Color (Orange/Yellow defined in CSS)
    in_progress: {
      label: "In Progress",
      icon: Clock,
      // Uses --warning variable
      colors: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
    },
    
    // 3. RESOLVED -> Success Theme Color (Green defined in CSS)
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      // Uses --success variable
      colors: "bg-success/10 text-success border-success/20 hover:bg-success/20"
    },

    // Fallback for unknown statuses
    unknown: {
      label: status || "Unknown",
      icon: HelpCircle,
      colors: "bg-muted text-muted-foreground border-border hover:bg-muted/80"
    }
  };

  const config = statusConfig[normalizedStatus] || statusConfig.unknown;
  const IconComponent = config.icon;

  // Variant styles for flexibility
  const variants = {
    default: "border",
    pill: "border rounded-full",
    flat: "border-transparent bg-opacity-50"
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors duration-200
        ${config.colors}
        ${variants[variant] || variants.default}
        ${className}
      `.trim()}
    >
      <IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

export default StatusBadge;