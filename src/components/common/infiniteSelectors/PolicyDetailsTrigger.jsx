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

import { Info } from "lucide-react";

function PolicyDetailsTrigger({ label, hasValue, onClick }) {
  if (!label && !hasValue) return null;

  return (
    <div className="flex items-center justify-between mb-1">
      {label && (
        <label className="block text-sm font-medium text-card-foreground">
          {label}
        </label>
      )}
      {hasValue && (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          View details
        </button>
      )}
    </div>
  );
}

export default PolicyDetailsTrigger;
