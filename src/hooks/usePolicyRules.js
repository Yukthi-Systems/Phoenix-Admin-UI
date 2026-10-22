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

import {
  addPolicyRule,
  deletePolicyRule,
  editPolicyRule,
  getPolicyRule,
  getPolicyRules,
} from "@/api/policyRules";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


function invalidatePolicyRuleQueries(queryClient) {
  queryClient.invalidateQueries({
    queryKey: ["policyrules"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["get_policy_rule"],
    refetchType: "none",
  });
}

export function useGetPolicyRules(
  organization_id,
  domain_name,
  page,
  pageSize,
) {
  return useQuery({
    queryKey: ["policyrules", organization_id, domain_name, page, pageSize],
    queryFn: () => getPolicyRules(organization_id, domain_name, page, pageSize),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
  });
}

export function useAddPolicyRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_policy_rules"],
    mutationFn: async ({ organization_id, data }) =>
      addPolicyRule(organization_id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["policyrules"] }),
  });
}

export function useGetPolicyRule({ organization_id, rule_id }) {
  return useQuery({
    queryKey: ["get_policy_rule", organization_id, rule_id],
    queryFn: () => getPolicyRule(organization_id, rule_id),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
  });
}

export function useEditPolicyRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["edit_policy_rule"],
    mutationFn: async ({ organization_id, rule_id, data }) =>
      editPolicyRule(organization_id, rule_id, data),
    onSuccess: () => invalidatePolicyRuleQueries(queryClient),
  });
}

export function useDeletePolicyRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_policy_rule"],
    mutationFn: async ({ organization_id, rule_id }) =>
      deletePolicyRule(organization_id, rule_id),
    onSuccess: () => invalidatePolicyRuleQueries(queryClient),
  });
}
