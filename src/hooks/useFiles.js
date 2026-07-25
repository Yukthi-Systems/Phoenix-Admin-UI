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
  getFileServiceConfig,
  updateFileServiceConfig,
  getFileUsers,
  createFileUser,
  toggleFileUserStatus,
  deleteFileUser,
  updateFileUserQuota,
} from "../api/files";

export function useGetFileServiceConfig(organization_id) {
  return useQuery({
    queryKey: ["file_service_config", organization_id],
    queryFn: () => getFileServiceConfig(organization_id),
    enabled: !!organization_id,
  });
}

export function useUpdateFileServiceConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_file_service_config"],
    mutationFn: (data) => updateFileServiceConfig(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["file_service_config", variables?.organization_id],
      });
    },
  });
}

export function useGetFileUsers(domain, page, perPage) {
  return useQuery({
    queryKey: ["file_users", page, perPage, domain],
    queryFn: () => getFileUsers(domain, perPage, page),
    enabled: !!domain,
    staleTime: 1000 * 10,
  });
}

export function useCreateFileUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createFileUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file_users"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useToggleFileUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, email }) => toggleFileUserStatus(domain, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file_users"] });
    },
  });
}

export function useDeleteFileUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, email }) => deleteFileUser(domain, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file_users"] });
    },
  });
}

export function useUpdateFileUserQuota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, email, new_quota }) =>
      updateFileUserQuota(domain, email, new_quota),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["file_users"] });
    },
  });
}
