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
import { getChatConfig, updateChatConfig, updateChatQuota, getChatUsers, createChatUser, toggleChatUserStatus, deleteChatUser } from "../api/chat";

export function useGetChatConfig(organization_id) {
  return useQuery({
    queryKey: ["chat_config", organization_id],
    queryFn: () => getChatConfig(organization_id),
    enabled: !!organization_id,
  });
}

export function useUpdateChatConfig() {
  return useMutation({
    mutationKey: ["update_chat_config"],
    mutationFn: (data) => updateChatConfig(data),
  });
}

export function useUpdateChatQuota() {
  return useMutation({
    mutationKey: ["update_chat_quota"],
    mutationFn: ({ organization_id, new_quota }) =>
      updateChatQuota(organization_id, new_quota),
  });
}

export function useGetChatUsers(domain, page, perPage) {
  return useQuery({
    queryKey: ["chat_users", page, perPage, domain],
    queryFn: () => getChatUsers(domain, perPage, page),
    enabled: !!domain,
    staleTime: 1000 * 10,
  });
}

export function useCreateChatUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, email }) => createChatUser(domain, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat_users"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useToggleChatUserStatus() {
  return useMutation({
    mutationFn: ({ domain, email }) => toggleChatUserStatus(domain, email),
  });
}

export function useDeleteChatUser() {
  return useMutation({
    mutationFn: ({ domain, email }) => deleteChatUser(domain, email),
  });
}

