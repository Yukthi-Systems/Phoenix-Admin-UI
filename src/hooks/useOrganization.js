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
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  createOrganization,
  deleteOrganization,
  editOrganization,
  getOrganizationDetail,
  getOrganizationLogoUrl,
  getOrganizations,
  updateOrganizationSpace,
  updateOrganizationIdentityQuota,
  updateOrganizationStatus,
  uploadOrganizationLogo,
  renameOrganization,
} from "../api/organizations";

// Any mutation that changes an organization's quota, identity allocation,
// hierarchy, or metadata must invalidate these so parent pickers, details
// pages, and lists stop serving stale `quota_utilized` /
// `utilized_email_identities` snapshots from the query cache.
function invalidateOrganizationQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["organizations"] });
  queryClient.invalidateQueries({ queryKey: ["organization_detail"] });
}

export function useGetOrganizations(
  page,
  pageSize,
  orgId = null,
  options = {},
) {
  return useQuery({
    queryKey: ["organizations", page, pageSize, orgId],
    queryFn: () => getOrganizations(page, pageSize, orgId),
    enabled: orgId !== null,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useGetOrganizationDetail(org_id) {
  return useQuery({
    queryKey: ["organization_detail", org_id],
    queryFn: () => getOrganizationDetail(org_id),
    enabled: !!org_id,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    keepPreviousData: true,
    retry: 3,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_organization"],
    mutationFn: async ({ data, addLog = true }) => createOrganization(data, addLog),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUploadOrganizationLogo() {
  return useMutation({
    mutationKey: ["upload_organization_logo"],
    mutationFn: async ({ organization_id, file }) =>
      uploadOrganizationLogo(organization_id, file),
  });
}

export function useGetOrganizationLogoUrl(organization_id) {
  return useQuery({
    queryKey: ["organization_logo_url", organization_id],
    queryFn: () => getOrganizationLogoUrl(organization_id),
    enabled: !!organization_id,
    staleTime: 0,
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_rrganization"],
    mutationFn: async ({ organization_id, organization_name = "Unknown Organization" }) =>
      deleteOrganization(organization_id, organization_name),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useEditOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_organization"],
    mutationFn: async ({ organization_id, data }) =>
      editOrganization(organization_id, data),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_organization_status"],
    mutationFn: async ({ organization_id, status }) =>
      updateOrganizationStatus(organization_id, status),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateOrganizationSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_organization_space"],
    mutationFn: async ({ organization_id, space }) =>
      updateOrganizationSpace(organization_id, space),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useUpdateOrganizationIdentityQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_organization_identity_quota"],
    mutationFn: async ({ organization_id, quota }) =>
      updateOrganizationIdentityQuota(organization_id, quota),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}

export function useRenameOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["rename_organization"],
    mutationFn: async ({ organization_id, name }) =>
      renameOrganization(organization_id, name),
    onSuccess: () => invalidateOrganizationQueries(queryClient),
  });
}
