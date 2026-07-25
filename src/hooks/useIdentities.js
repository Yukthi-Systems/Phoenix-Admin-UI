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
  createIdentity,
  deleteIdentity,
  getIdentity,
  getIdentities,
  updateIdentity,
  updateIdentityPassword,
} from "../api/identities";

export function useGetIdentities(domain_name, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["identities", domain_name, page, pageSize, query],
    queryFn: () => getIdentities(domain_name, page, pageSize, query),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetIdentity(domain_name, email_prefix) {
  return useQuery({
    queryKey: ["identity", domain_name, email_prefix],
    queryFn: () => getIdentity(domain_name, email_prefix),
    enabled: !!domain_name && !!email_prefix,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    retry: 3,
  });
}

export function useAddIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create_identity"],
    mutationFn: async ({ data, addLog = true }) =>
      createIdentity(data, addLog),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["identities"] }),
  });
}

export function useUpdateIdentity() {
  return useMutation({
    mutationKey: ["update_identity"],
    mutationFn: async ({ data }) =>
      updateIdentity(data),
  });
}

export function useDeleteIdentity() {
  return useMutation({
    mutationKey: ["delete_identity"],
    mutationFn: async ({ domain_name, email_prefix, identity_name }) =>
      deleteIdentity(domain_name, email_prefix, identity_name),
  });
}

export function useUpdateIdentityPassword() {
  return useMutation({
    mutationKey: ["update_identity_password"],
    mutationFn: async ({ domain_name, email_prefix, password }) =>
      updateIdentityPassword(domain_name, email_prefix, password),
  });
}
