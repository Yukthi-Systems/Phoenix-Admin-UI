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

import { RotateCcw } from "lucide-react";

function DataErrorWithReload({ content = "No Data found" }) {
  const handleRetry = () => {
    window.location.reload();
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-base text-muted-foreground font-semibold">
        {content || ""}
      </p>
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 border border-red-300 rounded hover:bg-red-200"
        onClick={handleRetry}
      >
        <RotateCcw />
        Retry
      </button>
    </div>
  );
}

export default DataErrorWithReload;
