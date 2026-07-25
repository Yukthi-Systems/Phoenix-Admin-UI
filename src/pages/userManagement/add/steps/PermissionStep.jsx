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

import PermissionTables from "../PermissionTable";

const PermissionsStep = ({
  setValue,
  watch,
  optionsPermission,
  handleAdd,
  template,
}) => {
  return (
    <div className="space-y-6 !text-left">
      <PermissionTables
        setValue={setValue}
        watch={watch}
        showDropdown={true}
        optionsPermission={optionsPermission}
        handleAdd={handleAdd}
        template={template}
      />

      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              Permission Templates
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              You can quickly assign multiple permissions by selecting a
              permission template from the dropdown. Templates are predefined
              sets of permissions for common roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsStep;
