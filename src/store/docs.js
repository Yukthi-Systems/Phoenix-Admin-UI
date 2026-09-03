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

import { atom } from "jotai";

/**
 * The documentation the current page wants the header Help button to show.
 * `{ docId: "<feature>/<flow>", step: <number> }` or `null` when the page has
 * no page-specific docs (Help then falls back to the /docs section).
 * Pages set this via the `useDocTarget` hook.
 */
export const docTargetAtom = atom(null);

/** Whether the header-triggered documentation drawer is open. */
export const docDrawerOpenAtom = atom(false);
