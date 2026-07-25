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

// hooks/useRestrictionPolicy.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRestrictionPolicy,
  getRestrictionPolicyEntry,
  addRestrictionPolicy,
  editRestrictionPolicy,
  deleteRestrictionPolicy
} from "../api/restrictionpolicy"; // Adjust the import path as needed

// Hook for fetching restriction policy list
export function useRestrictionPolicy({
  organization_id,
  page,
  pageSize,
  query = "",
}) {
  return useQuery({
    queryKey: [
      "restriction_policy",
      organization_id,
      page,
      pageSize,
      query,
    ],
    queryFn: () =>
      getRestrictionPolicy({ organization_id, page, pageSize, query }),
    enabled: !!organization_id,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Secondss
    keepPreviousData: true,
    retry: 3,
  });
}

// Hook for fetching a single restriction policy entry
export function useRestrictionPolicyEntry({ org_id, policy_id }) {
  return useQuery({
    queryKey: ["restriction_policy_entry", org_id, policy_id],
    queryFn: () => getRestrictionPolicyEntry(org_id, policy_id),
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Secondss
    retry: 3,
  });
}

// Hook for adding a new restriction policy
export function useAddRestrictionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_restriction_policy"],
    mutationFn: async ({ org_id, data, addLogs = true }) => addRestrictionPolicy(org_id, data, addLogs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["restriction_policy"] }),
  });
}

// Hook for editing a restriction policy
export function useEditRestrictionPolicy() {

  return useMutation({
    mutationKey: ["edit_restriction_policy"],
    mutationFn: async ({ org_id, policy_id, data }) => editRestrictionPolicy(org_id, policy_id, data),
  });
}

// Hook for deleting a restriction policy
export function useDeleteRestrictionPolicy() {

  return useMutation({
    mutationKey: ["delete_restriction_policy"],
    mutationFn: async ({ org_id, policy_id, policy_name = "Unknown Policy" }) =>
      deleteRestrictionPolicy(org_id, policy_id, policy_name),
  });
}

