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
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addServer,
  deleteServer,
  getDomainLockStatus,
  getDomainMigrationStatus,
  getMailboxesFromServer,
  getMailboxLockStatus,
  getMailboxMigrationLogs,
  getMailboxMigrationStatus,
  getMigrationsFromSourceServer,
  getPflogsumReport,
  getServer,
  getServerMigrationStats,
  getServerProcs,
  getServers,
  lockDomain,
  lockMailbox,
  mailMapping,
  recalculateQuota,
  startMailboxMigration,
  startManualMailboxMigration,
  updateServer,
  updateServerStatus,
} from "../api/servers";

export function useGetServers(page, pageSize, searchQuery) {
  return useQuery({
    queryKey: ["servers", page, pageSize, searchQuery],
    queryFn: () => getServers(page, pageSize, searchQuery),
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    keepPreviousData: false,
    retry: 3,
  });
}

export function useGetServersForSelector() {
  return useQuery({
    queryKey: ["servers_selector"],
    queryFn: () => getServers(1, 100), // Fetch 100 items in single call
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });
}

export function useGetServer(server_id) {
  return useQuery({
    queryKey: ["server", server_id],
    queryFn: () => getServer(server_id),
    enabled: !!server_id,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    retry: 3,
  });
}

export function useAddServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_server"],
    mutationFn: async (data) => addServer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servers"] });
      queryClient.invalidateQueries({ queryKey: ["servers_selector"] });
    },
  });
}

export function useUpdateServer() {
  return useMutation({
    mutationKey: ["update_server"],
    mutationFn: async ({ server_id, data }) => updateServer(server_id, data),
  });
}

export function useDeleteServer() {
  return useMutation({
    mutationKey: ["delete_server"],
    mutationFn: async ({ server_id, server_name }) =>
      deleteServer(server_id, server_name),
  });
}

export function useStartMailboxMigration() {
  return useMutation({
    mutationKey: ["start_mailbox_migration"],
    mutationFn: async ({ source_server_id, target_server_id, email }) =>
      startMailboxMigration(source_server_id, target_server_id, email),
  });
}

export function useLockMailbox() {
  return useMutation({
    mutationKey: ["lock_mailbox"],
    mutationFn: async ({ email, is_locked }) => lockMailbox(email, is_locked),
  });
}

export function useGetMailboxLockStatus(email) {
  return useQuery({
    queryKey: ["mailbox_lock_status", email],
    queryFn: () => getMailboxLockStatus(email),
    enabled: !!email,
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    retry: 3,
  });
}

export function useGetMailboxMigrationStatus(email) {
  return useQuery({
    queryKey: ["mailbox_migration_status", email],
    queryFn: () => getMailboxMigrationStatus(email),
    enabled: !!email,
    staleTime: 1000 * 10,
    retry: 3,
  });
}

export function useGetMailboxesFromServer(
  server_id,
  emailStartsWith,
  page,
  pageSize,
) {
  return useQuery({
    queryKey: [
      "mailboxes_from_server",
      server_id,
      emailStartsWith,
      page,
      pageSize,
    ],
    queryFn: () =>
      getMailboxesFromServer(server_id, emailStartsWith, page, pageSize),
    enabled: !!server_id,
    staleTime: 1000 * 10,
    keepPreviousData: true,
  });
}

export function useGetMailboxMigrationLogs(email, page = 1, pageSize = 25) {
  return useQuery({
    queryKey: ["mailbox_migration_logs", email, page, pageSize],
    queryFn: () => getMailboxMigrationLogs(email, page, pageSize),
    enabled: !!email,
    staleTime: 1000 * 10,
    keepPreviousData: true,
  });
}

export function useGetMigrationsFromSourceServer(
  server_id,
  page = 1,
  pageSize = 25,
) {
  return useQuery({
    queryKey: ["migrations_from_source_server", server_id, page, pageSize],
    queryFn: () => getMigrationsFromSourceServer(server_id, page, pageSize),
    enabled: !!server_id,
    staleTime: 1000 * 10,
    keepPreviousData: true,
  });
}

export function useGetServerMigrationStats(server_id) {
  return useQuery({
    queryKey: ["server_migration_stats", server_id],
    queryFn: () => getServerMigrationStats(server_id),
    enabled: !!server_id,
    staleTime: 1000 * 10,
  });
}

export function useLockDomain() {
  return useMutation({
    mutationKey: ["lock_domain"],
    mutationFn: async ({ domain_name, is_locked, servers }) =>
      lockDomain(domain_name, is_locked, servers),
  });
}

export function useGetDomainLockStatus(domain_name) {
  return useQuery({
    queryKey: ["domain_lock_status", domain_name],
    queryFn: () => getDomainLockStatus(domain_name),
    enabled: !!domain_name,
    staleTime: 1000 * 10,
  });
}

export function useGetDomainMigrationStatus(domain_name) {
  return useQuery({
    queryKey: ["domain_migration_status", domain_name],
    queryFn: () => getDomainMigrationStatus(domain_name),
    enabled: !!domain_name,
    staleTime: 1000 * 10,
  });
}

export function useMailMapping() {
  return useMutation({
    mutationKey: ["mail_mapping"],
    mutationFn: async ({ mailList = [] }) => mailMapping({ mailList }),
  });
}

export function useUpdateServerStatus() {
  return useMutation({
    mutationKey: ["update_server_status"],
    mutationFn: async ({ server_id, status, server_name }) =>
      updateServerStatus(server_id, status, server_name),
  });
}

export function useRecaulculateQuota() {
  return useMutation({
    mutationKey: ["recalculate_quota"],
    mutationFn: async () => recalculateQuota(),
  });
}

export function useStartManualMailboxMigration() {
  return useMutation({
    mutationKey: ["start_manual_mailbox_migration"],
    mutationFn: async ({ source_server_id, target_server_id, email }) =>
      startManualMailboxMigration(source_server_id, target_server_id, email),
  });
}
export function useGetPflogsumReport(server_host_id, from_when) {
  return useQuery({
    queryKey: ["pflogsum_report", server_host_id, from_when],
    queryFn: () => getPflogsumReport(server_host_id, from_when),
    enabled: !!server_host_id && !!from_when,

    // Fresh for 5 minutes
    staleTime: 1000 * 60 * 5,

    // Cached for 5 minutes after last use
    cacheTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch server process list with React Query.
 * @param {string} server_host_id
 */
export function useGetServerProcs(server_host_id) {
  return useQuery({
    queryKey: ["server_procs", server_host_id],
    queryFn: () => getServerProcs(server_host_id),
    enabled: !!server_host_id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}
