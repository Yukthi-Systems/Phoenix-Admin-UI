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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDisclaimer,
  getDisclaimerDetails,
  updateDisclaimer,
  deleteDisclaimer,
  getDisclaimersList,
} from "@/api/disclaimer";

export function useGetDisclaimers(organization_id, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["disclaimers", organization_id, page, pageSize, query],
    queryFn: () => getDisclaimersList(organization_id, page, pageSize, query),
    enabled: !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetDisclaimerDetails(organization_id, disclaimer_id) {
  return useQuery({
    queryKey: ["disclaimer_details", organization_id, disclaimer_id],
    queryFn: () => getDisclaimerDetails(organization_id, disclaimer_id),
    enabled: !!organization_id && !!disclaimer_id,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    keepPreviousData: true,
    retry: 3,
  });
}

export function useCreateDisclaimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_disclaimer"],
    mutationFn: async ({ data, addLog = true }) => createDisclaimer(data, addLog),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["disclaimers"] }),
  });
}

export function useUpdateDisclaimer() {
  return useMutation({
    mutationKey: ["update_disclaimer"],
    mutationFn: async ({ disclaimer_id, data }) =>
      updateDisclaimer(disclaimer_id, data),
  });
}

export function useDeleteDisclaimer() {
  return useMutation({
    mutationKey: ["delete_disclaimer"],
    mutationFn: async ({ organization_id, disclaimer_id, disclaimer_name = "Unknown Disclaimer" }) =>
      deleteDisclaimer(organization_id, disclaimer_id, disclaimer_name),
  });
}
