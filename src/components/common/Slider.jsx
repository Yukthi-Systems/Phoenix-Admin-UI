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

import React from 'react';

/**
 * A theme-aware range slider component.
 * Uses strict HSL variables for coloring to match the application theme.
 *
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step increment
 * @param {number} value - Current value
 * @param {function} onChange - Callback (e) => void
 * @param {boolean} disabled - Disabled state
 */
export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  disabled = false,
  className = '',
}) {
  // Calculate percentage for track fill and thumb position
  // Clamp percentage between 0 and 100 to prevent visual glitches
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100)
  );

  return (
    <div
      className={`relative flex w-full touch-none select-none items-center h-5 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {/* Visual Track Background */}
      <div className="bg-muted relative h-2 w-full grow rounded-full overflow-hidden">
        {/* Visual Track Fill */}
        <div
          className="bg-primary h-full transition-all duration-75 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Visual Thumb */}
      <div
        className="border-primary bg-background absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 shadow transition-all duration-75 ease-out hover:scale-110"
        style={{
          left: `calc(${percentage}% - 10px)`, // Offset by half thumb width
        }}
      />

      {/* Interactive Input (Invisible) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-disabled={disabled}
      />
    </div>
  );
}

export default Slider;