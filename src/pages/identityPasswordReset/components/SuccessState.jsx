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

import { CheckCircle } from "lucide-react";

const SuccessState = ({ email }) => (
  <div className="space-y-4 text-center">
    <div className="bg-success/10 border-success/20 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border">
      <CheckCircle className="text-success h-7 w-7" />
    </div>
    <div className="space-y-1">
      <p className="text-card-foreground text-lg font-semibold">
        Password changed
      </p>
      {email && (
        <p className="text-muted-foreground text-sm break-all">{email}</p>
      )}
    </div>
    <p className="text-muted-foreground text-sm">
      Use your new password the next time you sign in.
    </p>
  </div>
);

export default SuccessState;
