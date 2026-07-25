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
  getForwardingPolicy,
  getForwardingPolicyEntry,
  addForwardingPolicy,
  editForwardingPolicy,
  deleteForwardingPolicy
} from "../api/forwardingPolicy";

export function useForwardingPolicy({
  organization_id,
  domain_name,
  page,
  pageSize,
  query = "",
}) {
  return useQuery({
    queryKey: [
      "forwarding_policy",
      organization_id,
      domain_name,
      page,
      pageSize,
      query,
    ],
    queryFn: () =>
      getForwardingPolicy({ organization_id, domain_name, page, pageSize, query }),
    enabled: !!domain_name && !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useForwardingPolicyEntry({ org_id, policy_id }) {
  return useQuery({
    queryKey: ["forwarding_policy_entry", org_id, policy_id],
    queryFn: () => getForwardingPolicyEntry(org_id, policy_id),
    enabled: !!org_id && !!policy_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useAddForwardingPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_forwarding_policy"],
    mutationFn: async ({ org_id, data, addLog = true }) => addForwardingPolicy(org_id, data, addLog),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["forwarding_policy"] }),
  });
}

export function useEditForwardingPolicy() {
  return useMutation({
    mutationKey: ["edit_forwarding_policy"],
    mutationFn: async ({ org_id, policy_id, data }) => editForwardingPolicy(org_id, policy_id, data),
  });
}

export function useDeleteForwardingPolicy() {
  return useMutation({
    mutationKey: ["delete_forwarding_policy"],
    mutationFn: async ({ org_id, policy_id, domain_name, policy_name = "Unknown Policy" }) =>
      deleteForwardingPolicy(org_id, policy_id, domain_name, policy_name),
  });
}