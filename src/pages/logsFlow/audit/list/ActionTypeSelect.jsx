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

import { Controller } from "react-hook-form";
import Select from "react-select";
import { ACTION_TYPE_GROUPS } from "@/constants/actionTypes";
import { getReactSelectStyles } from "@/utils/selectTheme";

export function ActionTypeSelectField({
  control,
  name,
  label,
  errors = {},
  placeholder = "Select action type...",
  customStyle = "",
  isClearable = true,
}) {
  const error = errors?.[name];

  return (
    <div className={`${customStyle} w-full text-left`}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-1">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            value={
              ACTION_TYPE_GROUPS.flatMap((group) => group.options).find(
                (option) => option.value === field.value,
              ) || null
            }
            options={ACTION_TYPE_GROUPS}
            placeholder={placeholder}
            onChange={(selected) => field.onChange(selected?.value || "")}
            isClearable={isClearable}
            menuPlacement="auto"
            styles={getReactSelectStyles()}
            menuPortalTarget={document.body}
            classNamePrefix="react-select"
            isSearchable={true}
          />
        )}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}
