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
  addDomain,
  deleteDomain,
  getDNSRecord,
  getDomain,
  getDomains,
  getDomainTxtKey,
  moveDomain,
  updateDomain,
  updateDomainSpace,
  updateDomainStatus,
  verifyDomainDns,
} from "../api/domain";

export function useGetDomains(organization_id, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["domains", organization_id, page, pageSize, query],
    queryFn: () => getDomains(organization_id, page, pageSize, query),
    enabled: !!organization_id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetDomain(domain_name) {
  return useQuery({
    queryKey: ["domain", domain_name],
    queryFn: () => getDomain(domain_name),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useAddDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_domain"],
    mutationFn: async ({ data, addLog = true }) => addDomain(data, addLog),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["domains"] }),
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_domain"],
    mutationFn: async ({ organization_id, domain_name, data }) =>
      updateDomain(organization_id, domain_name, data),
    onSuccess: (_, { domain_name }) =>
      queryClient.invalidateQueries({ queryKey: ["domain", domain_name] }),
  });
}

export function useUpdateDomainStatus() {
  return useMutation({
    mutationKey: ["update_domain_status"],
    mutationFn: async ({ organization_id, domain_name, status }) =>
      updateDomainStatus(organization_id, domain_name, status),
  });
}

export function useUpdateDomainSpace() {
  return useMutation({
    mutationKey: ["update_domain_space"],
    mutationFn: async ({ organization_id, domain_name, space }) =>
      updateDomainSpace(organization_id, domain_name, space),
  });
}

export function useDeleteDomain() {
  return useMutation({
    mutationKey: ["delete_domain"],
    mutationFn: async ({ organization_id, domain_name }) =>
      deleteDomain(organization_id, domain_name),
  });
}

export function useMoveDomain() {
  return useMutation({
    mutationKey: ["move_domain"],
    mutationFn: async ({
      organization_id,
      domain_name,
      target_organization_id,
    }) => moveDomain(organization_id, domain_name, target_organization_id),
  });
}

export function useGetDNSRecord(domain_name) {
  return useQuery({
    queryKey: ["dns_record", domain_name],
    queryFn: () => getDNSRecord(domain_name),
    enabled: !!domain_name,
    staleTime: 0,
    retry: (failureCount, error) => {
      return error?.status >= 500 && error?.status < 600 && failureCount < 3;
    },
  });
}

export function useGetDomainTxtKey(domain_name) {
  return useQuery({
    queryKey: ["domain_txt_key", domain_name],
    queryFn: () => getDomainTxtKey(domain_name),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      return error?.status >= 500 && error?.status < 600 && failureCount < 3;
    },
  });
}

export function useVerifyDomainDns() {
  return useMutation({
    mutationKey: ["verify_domain_dns"],
    mutationFn: async ({ domain_name }) => verifyDomainDns(domain_name),
  });
}
