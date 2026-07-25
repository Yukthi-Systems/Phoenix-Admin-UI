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
import { Infinity as InfinityIcon } from "lucide-react";

const IdentityProgress = ({ utilized, allocated, className = "" }) => {
  const utilizedCount = parseInt(utilized, 10) || 0;
  const isUnlimited = Number(allocated) === -1;

  if (isUnlimited) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-sm font-medium text-primary ${className}`}
        title={`Utilized: ${utilizedCount.toLocaleString()} / Unlimited`}
      >
        <span>{utilizedCount.toLocaleString()}</span>
        <span className="text-muted-foreground">/</span>
        <InfinityIcon className="h-3.5 w-3.5" />
      </div>
    );
  }

  const allocatedCount = parseInt(allocated, 10) || 0;
  const percentage = allocatedCount > 0 ? (utilizedCount / allocatedCount) * 100 : 0;
  const remaining = allocatedCount - utilizedCount;

  let textColor = "text-foreground";
  if (percentage > 85) {
    textColor = "text-destructive";
  } else if (percentage > 70) {
    textColor = "text-warning";
  }

  const tooltipText = `Utilized: ${utilizedCount.toLocaleString()} / Allocated: ${allocatedCount.toLocaleString()} (${remaining.toLocaleString()} remaining, ${percentage.toFixed(0)}%)`;

  return (
    <span
      className={`text-sm font-medium ${textColor} ${className}`}
      title={tooltipText}
    >
      {utilizedCount.toLocaleString()}/{allocatedCount.toLocaleString()}
    </span>
  );
};

export default IdentityProgress;
