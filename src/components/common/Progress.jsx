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

const ProgressBar = ({
  utilized,
  allocated,
  showValues = true,
  className = "",
}) => {
  const utilizedGb = parseFloat(utilized);
  const allocatedGb = parseFloat(allocated);
  const percentage = allocatedGb > 0 ? (utilizedGb / allocatedGb) * 100 : 0;
  const remainingGb = allocatedGb - utilizedGb;

  // Determine color based on percentage
  let barColor = "bg-primary";
  let textColor = "text-primary";
  if (percentage > 85) {
    barColor = "bg-destructive";
    textColor = "text-destructive";
  } else if (percentage > 70) {
    barColor = "bg-warning";
    textColor = "text-warning";
  }

  const tooltipText = `Utilized: ${utilizedGb.toFixed(2)} GB / Allocated: ${allocatedGb.toFixed(2)} GB (${remainingGb.toFixed(2)} GB remaining)`;

  return (
    <div className={`w-full max-w-[280px] ${className}`} title={tooltipText}>
      {/* Progress Bar with Percentage */}
      <div className="flex items-center gap-2 mb-1">
        <div className="relative flex-1 h-2 bg-muted  border-[0.5px] border-border/40 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className={`text-xs font-medium min-w-max ${textColor}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Values Display - Compact Two Line */}
      {showValues && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {utilizedGb.toFixed(2)} GB / {allocatedGb.toFixed(2)} GB
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
