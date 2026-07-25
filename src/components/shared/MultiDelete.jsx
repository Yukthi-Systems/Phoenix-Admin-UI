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

import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { Trash2 } from "lucide-react";
import React from "react";

function MultiDelete({
  selectedCount = 0,
  handleClear = () => {},
  handleClick = () => {},
  permission = "",
}) {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  return (
    <div className="flex items-center gap-2  px-1.5  py-1 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-1 xl:gap-2">
        <button
          onClick={handleClear}
          className="px-2 py-1.5 text-xs xl:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all duration-200"
        >
          Clear
        </button>
        {permission && permissions.includes(permission) && (
          <button
            onClick={handleClick}
            className="flex items-center gap-1.5 px-2 text-nowrap py-1.5 text-xs xl:text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Trash2 size={12} className="xl:w-4 xl:h-4" />
            Delete ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}

export default MultiDelete;
