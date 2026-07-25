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

import { useQuery } from "@tanstack/react-query";
import { getApiVersion, getApiHealth, getServerTime } from "../api/apiInfo";

/**
 * Hook to fetch API Version Information.
 * Stale time is set to Infinity as API version is static per session.
 */
export const useApiVersion = () => {
  return useQuery({
    queryKey: ["apiVersion"],
    queryFn: getApiVersion,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

/**
 * Hook to fetch API Health Status.
 * Accepts an optional polling interval (ms).
 */
export const useApiHealth = (refetchInterval = 0) => {
  return useQuery({
    queryKey: ["apiHealth"],
    queryFn: getApiHealth,
    refetchInterval,
    retry: 0,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch Server Time.
 */
export const useServerTime = () => {
  return useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerTime,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
