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

const subToneStyles = {
  info: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const MetricsCard = ({
  label,
  value,
  icon,
  sub,
  variant = "default",
}) => {
  const variantStyles = {
    default: "border-border",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    destructive: "border-destructive/20 bg-destructive/5",
    info: "border-primary/20 bg-primary/5",
  };

  return (
    <div
      className={`bg-card border p-5 rounded-xl shadow-sm hover:shadow-md transition-all ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <p className="text-muted-foreground text-xs font-extrabold uppercase tracking-wider">
            {label}
          </p>

          <h4 className="text-3xl font-black mt-1 text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h4>

          {sub && (
            <div
              className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono ${
                subToneStyles[sub.tone || "neutral"]
              }`}
            >
              <span className="opacity-70">{sub.label}:</span>
              <span className="font-bold">{sub.value}</span>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-muted/50 rounded-xl shrink-0">
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
