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

import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

// Store global cooldown timestamp
export const queueActionCooldownAtom = atomWithStorage(
  "mailq_action_cooldown",
  null,
  undefined,
  { getOnInit: true },
);

// Write atom to set global cooldown
export const setCooldownAtom = atom(null, (get, set) => {
  set(queueActionCooldownAtom, Date.now());
});

// Helper function to check if cooldown is active
export const checkCooldownActive = (lastAction) => {
  if (!lastAction) return false;
  const COOLDOWN_DURATION = 60 * 1000;
  return Date.now() - lastAction < COOLDOWN_DURATION;
};

// Helper function to get remaining seconds
export const getRemainingSeconds = (lastAction) => {
  if (!lastAction) return 0;
  const COOLDOWN_DURATION = 60 * 1000;
  const remaining = COOLDOWN_DURATION - (Date.now() - lastAction);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};
