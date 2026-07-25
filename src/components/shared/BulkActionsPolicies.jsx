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
import DropdownButton from "../common/DropdownButton";

function BulkActionsPolicies({
  selectedCount = 0,
  handleClear = () => {},
  options = [],
}) {
  return (
    <div className="flex items-center gap-2  px-1.5  py-1 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-1 xl:gap-2">
        <button
          onClick={handleClear}
          className="px-2 py-1.5 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all duration-200"
        >
          Clear
        </button>
        <DropdownButton
          label={` Bulk Actions (${selectedCount})`}
          options={options}
          variant="outline"
        />
      </div>
    </div>
  );
}

export default BulkActionsPolicies;
