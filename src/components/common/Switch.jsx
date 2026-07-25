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
import { useController } from "react-hook-form";

export function Switch({
  label = "",
  control, // Need control from useForm
  register,
  errors = {},
  name = "",
  customStyle = "",
  disabled = false,
  isRequired = false,
  description = "",
  defaultChecked = false,
  // Dynamic labels
  falseLabel = null,
  falseSublabel = null,
  trueLabel = null,
  trueSublabel = null,
  ...props
}) {
  const error = errors[name];

  // Use useController to get the current value from react-hook-form
  const {
    field: { value, onChange, onBlur, ref },
  } = useController({
    name,
    control,
    defaultValue: defaultChecked,
  });

  const handleChange = (e) => {
    onChange(e.target.checked);
  };

  // Determine what label and description to show based on form value
  const getCurrentLabel = () => {
    if (value && trueLabel) return trueLabel;
    if (!value && falseLabel) return falseLabel;
    return label; // fallback to original label
  };

  const getCurrentDescription = () => {
    if (value && trueSublabel) return trueSublabel;
    if (!value && falseSublabel) return falseSublabel;
    return description; // fallback to original description
  };

  return (
    <div className={`${customStyle} w-full`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={disabled}
              checked={value || false}
              onChange={handleChange}
              onBlur={onBlur}
              ref={ref}
              {...props}
            />
            <div
              className={`relative w-11 h-6 bg-muted border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer 
                            peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] 
                            after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                            peer-checked:bg-primary transition-colors duration-200
                            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
            ></div>
          </label>
        </div>

        <div className="flex-1">
          {getCurrentLabel() && (
            <label className="block text-sm font-medium text-foreground  text-left">
              {getCurrentLabel()}
              {isRequired && <span className="text-destructive"> *</span>}
            </label>
          )}
          {getCurrentDescription() && (
            <p className="text-xs text-muted-foreground mt-1 text-left">
              {getCurrentDescription()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1 text-left">
          {error.message}
        </p>
      )}
    </div>
  );
}
