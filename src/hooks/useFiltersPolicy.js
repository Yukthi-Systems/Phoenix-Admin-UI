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
  addFiltersPolicy,
  deleteFiltersPolicy,
  editFiltersPolicy,
  getFiltersPolicy,
  getFiltersPolicyEntry,
} from "../api/filterpolicy";

export function useFiltersPolicy(
  organization_id,
  domain_name,
  page,
  pageSize,
  query = "",
) {
  return useQuery({
    queryKey: [
      "filters_policy",
      organization_id,
      domain_name,
      page,
      pageSize,
      query,
    ],
    queryFn: () =>
      getFiltersPolicy(organization_id, domain_name, page, pageSize, query),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useFiltersPolicyEntry({ org_id, policy_id }) {
  return useQuery({
    queryKey: ["filters_policy_entry", org_id, policy_id],
    queryFn: () => getFiltersPolicyEntry(org_id, policy_id),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useAddFiltersPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_filters_policy"],
    mutationFn: async ({ org_id, data, addLogs = true }) => addFiltersPolicy(org_id, data, addLogs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["filters_policy"] }),
  });
}

export function useEditFiltersPolicy() {
  return useMutation({
    mutationKey: ["edit_filters_policy"],
    mutationFn: async ({ org_id, policy_id, data }) =>
      editFiltersPolicy(org_id, policy_id, data),
  });
}

export function useDeleteFiltersPolicy() {
  return useMutation({
    mutationKey: ["delete_filters_policy"],
    mutationFn: async ({ org_id, policy_id, policy_name = "Unknown Policy" }) =>
      deleteFiltersPolicy(org_id, policy_id, policy_name),
  });
}
