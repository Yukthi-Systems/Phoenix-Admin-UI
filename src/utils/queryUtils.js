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

// While a paginated list moves to another page, page size or search, keep the
// rows already on screen instead of dropping back to the loading state. Only
// applies when the scope (the queryKey up to the paging params) is unchanged,
// so rows from another org/domain/server never show up under the new one.
export const keepPreviousPage = (scope) => (previousData, previousQuery) => {
  const previousKey = previousQuery?.queryKey || [];
  const sameScope = scope.every((part, i) => previousKey[i] === part);
  return sameScope ? previousData : undefined;
};
