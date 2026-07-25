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
  createAttachmentPolicy,
  deleteAttachmentPolicy,
  editAttachmentPolicy,
  exportAttachmentPolicyList,
  getAttachmentPolicyById,
  getAttachmentPolicyList,
} from "../api/attachmentPolicy";

// Hook to get attachment policy list
export function useGetAttachmentPolicyList(
  organization_id,
  domain_name,
  query = "",
  page = 1,
  page_size = 10,
) {
  return useQuery({
    queryKey: [
      "attachment_policy_list",
      organization_id,
      domain_name,
      query,
      page,
      page_size,
    ],
    queryFn: () =>
      getAttachmentPolicyList(
        organization_id,
        domain_name,
        query,
        page,
        page_size,
      ),
    enabled: !!organization_id && !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    // refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

// Hook to get attachment policy by ID
export function useGetAttachmentPolicyById({
  organization_id,
  domain_name,
  policy_id,
}) {
  return useQuery({
    queryKey: [
      "attachment_policy_details",
      organization_id,
      domain_name,
      policy_id,
    ],
    queryFn: () =>
      getAttachmentPolicyById(organization_id, domain_name, policy_id),
    enabled: !!organization_id && !!domain_name && !!policy_id,
    staleTime: 1000 * 60, // 60 seconds
    cacheTime: 1000 * 60, // 60 seconds
    // refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
}

// Hook to create new attachment policy
export function useCreateAttachmentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_attachment_policy"],
    mutationFn: async ({ organization_id, domain_name, data, addLogs = true }) =>
      createAttachmentPolicy(organization_id, domain_name, data, addLogs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["attachment_policy_list"] }),
  });
}

// Hook to edit attachment policy
export function useEditAttachmentPolicy() {
  return useMutation({
    mutationKey: ["edit_attachment_policy"],
    mutationFn: async ({ organization_id, domain_name, policy_id, data }) =>
      editAttachmentPolicy(organization_id, domain_name, policy_id, data),
  });
}

// Hook to delete attachment policy
export function useDeleteAttachmentPolicy() {
  return useMutation({
    mutationKey: ["delete_attachment_policy"],
    mutationFn: async ({ organization_id, domain_name, policy_id }) =>
      deleteAttachmentPolicy(organization_id, domain_name, policy_id),
  });
}

// Hook to export attachment policy list
export function useExportAttachmentPolicyList() {
  return useMutation({
    mutationKey: ["export_attachment_policy_list"],
    mutationFn: async ({ organization_id, domain_name }) =>
      exportAttachmentPolicyList(organization_id, domain_name),
  });
}
