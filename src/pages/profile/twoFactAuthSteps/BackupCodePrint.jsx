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

import React, { forwardRef } from "react";

const BackupCodePrint = forwardRef(({ codes = [], orgName = "" }, ref) => {
  return (
    <div ref={ref} className="p-6 font-sans">
      <h1 className="text-2xl font-bold text-center mb-8">
        {orgName ? `${orgName} - Backup Codes` : "Backup Codes"}
      </h1>
      <div className="grid grid-cols-2 gap-4 w-[400px] mx-auto border p-4 rounded">
        {codes.length > 0 ? (
          codes.map((code, idx) => (
            <p key={idx} className="text-lg font-semibold text-gray-800">
              {code || "-"}
            </p>
          ))
        ) : (
          <p className="col-span-2 text-sm text-gray-500 text-center">
            No backup codes available
          </p>
        )}
      </div>
    </div>
  );
});

export default BackupCodePrint;
