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

import { useQuery } from "@tanstack/react-query";
import {
  getOrganizationSpaceMetrics,
  getDomainsSpaceMetrics,
  getDomainsMetrics,
  getMailboxesSpaceMetrics,
  getTotalUsersMetrics,
  getTopLoginsPerDomain,
  getTopIPLoginsPerDomain,
  getLoginsPerDomain,
  getStatus,
  getServerMetrics,
  getOverallStatus,
} from "../api/dashboard";

// Hook for Organization Space Metrics
export function useGetOrganizationSpaceMetrics(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "organization_space", organization_id],
    queryFn: () => getOrganizationSpaceMetrics(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Domains Space Metrics
export function useGetDomainsSpaceMetrics(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "domains_space", organization_id],
    queryFn: () => getDomainsSpaceMetrics(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Domains Metrics
export function useGetDomainsMetrics(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "domains", organization_id],
    queryFn: () => getDomainsMetrics(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Mailboxes Space Metrics
export function useGetMailboxesSpaceMetrics(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "mailboxes_space", organization_id],
    queryFn: () => getMailboxesSpaceMetrics(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Total Users Metrics
export function useGetTotalUsersMetrics(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "total_users", organization_id],
    queryFn: () => getTotalUsersMetrics(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Top Logins Per Domain
export function useGetTopLoginsPerDomain(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "top_logins_per_domain", organization_id],
    queryFn: () => getTopLoginsPerDomain(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Top IP Logins Per Domain
export function useGetTopIPLoginsPerDomain(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "top_ip_logins_per_domain", organization_id],
    queryFn: () => getTopIPLoginsPerDomain(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

// Hook for Logins Per Domain
export function useGetLoginsPerDomain(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "logins_per_domain", organization_id],
    queryFn: () => getLoginsPerDomain(organization_id),
    enabled: !!organization_id,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

export function useGetStatus(organization_id) {
  return useQuery({
    queryKey: ["dashboard", "status", organization_id],
    queryFn: () => getStatus(),
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

export function useGetServerMetrics(server_id, from_date_time, to_date_time) {
  return useQuery({
    queryKey: [
      "dashboard",
      "server_metrics",
      server_id,
      from_date_time,
      to_date_time,
    ],
    queryFn: () => getServerMetrics(server_id, from_date_time, to_date_time),
    enabled: !!server_id && !!from_date_time && !!to_date_time,
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60,
  });
}

export function useGetOverallStatus(organization_id) {
  return useQuery({
    queryKey: ["overall_status"],
    queryFn: () => getOverallStatus(),
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 3,
    retry: 3,
    refetchOnWindowFocus: true,
  });
}

export function useGetAllDashboardMetrics(organization_id) {
  const organizationSpace = useGetOrganizationSpaceMetrics(organization_id);
  const domains = useGetDomainsMetrics(organization_id);
  const mailboxesSpace = useGetMailboxesSpaceMetrics(organization_id);
  const totalUsers = useGetTotalUsersMetrics(organization_id);
  const topLogins = useGetTopLoginsPerDomain(organization_id);
  const topIPLogins = useGetTopIPLoginsPerDomain(organization_id);
  const loginsPerDomain = useGetLoginsPerDomain(organization_id);
  const status = useGetStatus();

  const refetchAll = async () => {
    await Promise.all([
      organizationSpace.refetch(),
      domains.refetch(),
      mailboxesSpace.refetch(),
      totalUsers.refetch(),
      topLogins.refetch(),
      topIPLogins.refetch(),
      loginsPerDomain.refetch(),
      status.refetch(),
    ]);
  };

  return {
    organizationSpace,
    domains,
    mailboxesSpace,
    totalUsers,
    topLogins,
    topIPLogins,
    loginsPerDomain,
    status,
    refetchAll,
    isLoading:
      organizationSpace.isLoading ||
      domains.isLoading ||
      mailboxesSpace.isLoading ||
      totalUsers.isLoading ||
      topLogins.isLoading ||
      topIPLogins.isLoading ||
      loginsPerDomain.isLoading,
    isError:
      organizationSpace.isError ||
      domains.isError ||
      mailboxesSpace.isError ||
      totalUsers.isError ||
      topLogins.isError ||
      topIPLogins.isError ||
      loginsPerDomain.isError,
  };
}
