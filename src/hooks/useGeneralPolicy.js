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
  addGeneralPolicy,
  deleteGeneralPolicy,
  editGeneralPolicy,
  getGeneralPolicy,
  getGeneralPolicyEntry,
} from "../api/generalpolicy";

export function useGeneralPolicy({
  organization_id,
  domain_name,
  page,
  pageSize,
  query = "",
}) {
  return useQuery({
    queryKey: [
      "general_policy",
      organization_id,
      domain_name,
      page,
      pageSize,
      query,
    ],
    queryFn: () =>
      getGeneralPolicy({ organization_id, domain_name, page, pageSize, query }),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGeneralPolicyEntry({ org_id, policy_id }) {
  return useQuery({
    queryKey: ["general_policy_entry", org_id, policy_id],
    queryFn: () => getGeneralPolicyEntry(org_id, policy_id),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useAddGeneralPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_general_policy"],
    mutationFn: async ({ org_id, data, addLogs = true }) => addGeneralPolicy(org_id, data, addLogs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["general_policy"] }),
  });
}

export function useEditGeneralPolicy() {
  return useMutation({
    mutationKey: ["edit_general_policy"],
    mutationFn: async ({ org_id, policy_id, data }) =>
      editGeneralPolicy(org_id, policy_id, data),
  });
}

export function useDeleteGeneralPolicy() {
  return useMutation({
    mutationKey: ["delete_general_policy"],
    mutationFn: async ({ org_id, policy_id, domain_name, policy_name = "Unknown Policy" }) =>
      deleteGeneralPolicy(org_id, policy_id, domain_name, policy_name),
  });
}
