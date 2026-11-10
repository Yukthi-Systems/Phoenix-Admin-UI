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

// Chat, Files and Tasks & Calendar config GETs when the org has never saved
// settings: the backend raises a 404 inside its own try block, its blanket
// `except Exception` re-wraps it as a 424 "Failed to fetch ...: {e}", and
// because All_Exceptions never passes its message to Exception, {e} is empty.
// So the client receives e.g. "Oops! Failed to fetch tasks service settings: "
// with nothing after the colon. A genuine failure (DB error etc.) carries the
// underlying error text there instead, so it is not mistaken for this case.
export const isServiceConfigMissing = (response) => {
  if (response?.status !== 424) return false;
  const message = response?.data?.message || "";
  return /do(es)? not exist/i.test(message) || /:\s*$/.test(message);
};
