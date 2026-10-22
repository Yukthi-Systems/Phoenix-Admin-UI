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
  addMailbox,
  deleteMailbox,
  editMailbox,
  exportMailBox,
  getFullIdentityInfoByAdmin,
  getMailbox,
  getMailboxes,
  updateMailboxPassword,
  updateMailboxSpace,
  updateMailboxStatus,
} from "../api/mailbox";


function invalidateMailboxQueries(queryClient) {
  queryClient.invalidateQueries({
    queryKey: ["mailboxes"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({
    queryKey: ["identities"],
    refetchType: "none",
  });
  queryClient.invalidateQueries({ queryKey: ["mailbox"], refetchType: "none" });
  queryClient.invalidateQueries({
    queryKey: ["full_identity_info_by_admin"],
    refetchType: "none",
  });
}

export function useGetMailboxes(domain_name, page, pageSize, query = "") {
  return useQuery({
    queryKey: ["mailboxes", domain_name, page, pageSize, query],
    queryFn: () => getMailboxes(domain_name, page, pageSize, query),
    enabled: !!domain_name,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetMailbox(domain_name, email_prefix) {
  return useQuery({
    queryKey: ["mailbox", domain_name, email_prefix],
    queryFn: () => getMailbox(domain_name, email_prefix),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    keepPreviousData: true,
    retry: 3,
  });
}

export function useGetFullIdentityInfoByAdmin(email) {
  return useQuery({
    queryKey: ["full_identity_info_by_admin", email],
    queryFn: () => getFullIdentityInfoByAdmin(email),
    enabled: !!email,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddMailbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_mailbox"],
    mutationFn: async ({ data, addLog = true }) => addMailbox(data, addLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailboxes"] });
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useEditMailbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_mailbox"],
    mutationFn: async ({ domain_name, email_prefix, data }) =>
      editMailbox(domain_name, email_prefix, data),
    onSuccess: () => invalidateMailboxQueries(queryClient),
  });
}

export function useUpdateMailboxStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_mailbox_status"],
    mutationFn: async ({ domain_name, email_prefix, status }) =>
      updateMailboxStatus(domain_name, email_prefix, status),
    onSuccess: () => invalidateMailboxQueries(queryClient),
  });
}

export function useUpdateMailboxSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_mailbox_space"],
    mutationFn: async ({ domain_name, email_prefix, space }) =>
      updateMailboxSpace(domain_name, email_prefix, space),
    onSuccess: () => invalidateMailboxQueries(queryClient),
  });
}

export function useUpdateMailboxPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_mailbox_password"],
    mutationFn: async ({ domain_name, email_prefix, password }) =>
      updateMailboxPassword(domain_name, email_prefix, password),
    onSuccess: () => invalidateMailboxQueries(queryClient),
  });
}

export function useDeleteMailbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_mailbox"],
    mutationFn: async ({ domain_name, email_prefix }) =>
      deleteMailbox(domain_name, email_prefix),
    onSuccess: () => invalidateMailboxQueries(queryClient),
  });
}

export function useExportMailBoxes(
  organization_id,
  domain_name,
  page,
  pageSize,
) {
  return useQuery({
    queryKey: [
      "mailboxes_export",
      organization_id,
      domain_name,
      page,
      pageSize,
    ],
    queryFn: () => exportMailBox(domain_name, page, pageSize),
    enabled: !!domain_name,
    staleTime: 1000 * 10,
    keepPreviousData: true,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
