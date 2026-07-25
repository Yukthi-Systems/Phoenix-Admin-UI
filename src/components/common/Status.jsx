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

import { CheckCircle, XCircle } from "lucide-react";

export function ActiveStatus({ align = "justify-center" }) {
  return (
    <div className={`flex ${align} gap-2 items-center`}>
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-green-600 text-sm font-medium">Active</span>
    </div>
  );
}

export function InactiveStatus({ align = "justify-center" }) {
  return (
    <div className={`flex ${align} gap-2 items-center`}>
      <XCircle className="w-4 h-4 text-red-500" />
      <span className="text-red-600 text-sm font-medium">Inactive</span>
    </div>
  );
}
