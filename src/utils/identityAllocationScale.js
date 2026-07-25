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

// Shared log-scale slider helpers for email identity allocation controls.
//
// When there's no real parent cap to bound a linear slider with, deriving a
// max from the current value causes the track to keep rescaling under the
// thumb mid-drag (a "moving target" slider). Instead we use a fixed
// logarithmic scale from 1 to 1,000,000 so both small (hundreds) and large
// (lakhs) allocations stay comfortably draggable on the same, stable track.
export const LOG_SLIDER_MIN = 1;
export const LOG_SLIDER_MAX = 1000000;
export const LOG_SLIDER_RESOLUTION = 1000;

const LOG_LOW = Math.log10(LOG_SLIDER_MIN);
const LOG_HIGH = Math.log10(LOG_SLIDER_MAX);

export const identitiesToLogPosition = (value) => {
  const clamped = Math.min(
    LOG_SLIDER_MAX,
    Math.max(LOG_SLIDER_MIN, value || LOG_SLIDER_MIN),
  );
  return Math.round(
    ((Math.log10(clamped) - LOG_LOW) / (LOG_HIGH - LOG_LOW)) * LOG_SLIDER_RESOLUTION,
  );
};

export const logPositionToIdentities = (position) => {
  const logValue = LOG_LOW + (position / LOG_SLIDER_RESOLUTION) * (LOG_HIGH - LOG_LOW);
  return Math.max(1, Math.round(Math.pow(10, logValue)));
};

export const ABSOLUTE_IDENTITY_PRESETS = [100, 500, 1000, 5000, 10000, 50000, 100000];
