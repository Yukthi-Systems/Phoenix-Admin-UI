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

// src/store/userInfo.js
import { atomWithStorage } from "jotai/utils";

export const userInfoAtom = atomWithStorage("user_info", {}, undefined, {
  getOnInit: true,
});

export const selectedOrganizationAtom = atomWithStorage(
  "selected_organization",
  {},
  undefined,
  {
    getOnInit: true,
  },
);

export const parentOrgAtom = atomWithStorage(
  "parent_org",
  {},
  undefined,
  {
    getOnInit: true,
  },
);
