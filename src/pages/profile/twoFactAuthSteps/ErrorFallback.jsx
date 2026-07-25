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

import { CloudOff } from "lucide-react";
import React from "react";

function ErrorFallback({ onCancel = () => {} }) {
  return (
    <div className=" w-full h-[60vh] text-primary flex flex-col justify-center items-center gap-3">
      <CloudOff size={65} />
      <p className=" w-4/12 text-gray-700">
        Sorry something went wrong. Please try again later
      </p>
      <button
        className=" w-1/12 bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium cursor-pointer"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}

export default ErrorFallback;
