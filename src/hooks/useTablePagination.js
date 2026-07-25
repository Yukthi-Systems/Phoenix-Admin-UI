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

import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { PER_PAGE } from "@/constants/constants";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo";

/**
 * Custom hook to sync TanStack Table pagination with URL Query Parameters.
 * @param {number} defaultPageSize - Default items per page (default: PER_PAGE constant)
 * @returns {object} { pagination, onPaginationChange } - Pass these directly to useReactTable
 */
export const useTablePagination = (defaultPageSize = PER_PAGE, maxPageSize = null) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { uiInfo, updateUiInfo } = useSyncedUiInfo();

  // Read preferred page size from uiInfo, falling back to defaultPageSize
  let preferredPageSize = uiInfo?.pageSize || defaultPageSize;
  if (maxPageSize && preferredPageSize > maxPageSize) {
    preferredPageSize = maxPageSize;
  }

  // 1. Read directly from URL, fallback to preferredPageSize
  const pageIndex = parseInt(searchParams.get("page") || "1", 10) - 1;
  let pageSize = parseInt(searchParams.get("perPage") || String(preferredPageSize), 10);
  if (maxPageSize && pageSize > maxPageSize) {
    pageSize = maxPageSize;
  }

  // 2. Memoize the state object required by TanStack Table
  const pagination = useMemo(() => ({
    pageIndex: pageIndex >= 0 ? pageIndex : 0,
    pageSize: pageSize > 0 ? pageSize : preferredPageSize,
  }), [pageIndex, pageSize, preferredPageSize]);

  // 3. Create the change handler required by TanStack Table
  const onPaginationChange = useCallback((updaterOrValue) => {
    const current = { pageIndex, pageSize };
    let next = typeof updaterOrValue === "function"
      ? updaterOrValue(current)
      : updaterOrValue;

    if (maxPageSize && next.pageSize > maxPageSize) {
      next = { ...next, pageSize: maxPageSize };
    }

    // Check if pageSize has changed and update uiInfo
    if (next.pageSize !== current.pageSize) {
      updateUiInfo({ pageSize: next.pageSize });
    }

    setSearchParams((prev) => {
      // Update URL parameters
      const newParams = new URLSearchParams(prev);
      newParams.set("page", String(next.pageIndex + 1)); // Convert back to 1-based
      newParams.set("perPage", String(next.pageSize));
      
      return newParams;
    });
  }, [pageIndex, pageSize, setSearchParams, updateUiInfo, maxPageSize]);

  return {
    pagination,
    onPaginationChange,
  };
};