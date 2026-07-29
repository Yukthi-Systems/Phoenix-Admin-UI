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

// src/hooks/useUrlParam.js
import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * Hook for a single URL parameter - simple and stable
 */
export const useUrlParam = (paramName, defaultValue = "") => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    return searchParams.get(paramName) || defaultValue;
  }, [searchParams, paramName, defaultValue]);

  const setValue = useCallback(
    (newValue) => {
      setSearchParams(
        () => {
          // Read from window.location directly instead of the `prev` passed
          // by react-router: that value is captured from this hook's last
          // render and goes stale the moment another setSearchParams call
          // (e.g. a pagination reset) fires in the same tick, silently
          // clobbering that other update.
          const newParams = new URLSearchParams(window.location.search);
          if (newValue === null || newValue === undefined || newValue === "") {
            newParams.delete(paramName);
          } else {
            newParams.set(paramName, String(newValue));
          }
          return newParams;
        },
        { replace: true },
      );
    },
    [paramName, setSearchParams],
  );

  return [value, setValue];
};
