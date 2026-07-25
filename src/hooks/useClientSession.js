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

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmailClientSessions,
  switchEmailClientSession,
  deleteEmailClientSession,
} from "../api/clientSession";

/**
 * Hook to fetch all email client sessions for a domain
 * @param {string} domain_name - Domain name to fetch sessions for
 * @param {number} page - Page number for pagination
 * @param {number} pageSize - Number of items per page
 *
 * Response structure:
 * {
 *   current_page: number,
 *   page_size: number,
 *   has_more: boolean,
 *   total_count: number,
 *   total_pages: number,
 *   data: [{
 *     origin_ip: string,
 *     attempted_by: string,
 *     geo_ip_location: object,
 *     is_active: boolean,
 *     attempted_at: string (ISO format),
 *     session_expires_at: string (ISO format)
 *   }]
 * }
 */
export function useGetEmailClientSessions(domain_name, page, pageSize) {
  return useQuery({
    queryKey: ["email_client_sessions", domain_name, page, pageSize],
    queryFn: () => getEmailClientSessions(domain_name, page, pageSize),
    enabled: !!domain_name,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    keepPreviousData: false,
  });
}

/**
 * Hook to switch/update email client session
 * @param {string} attempted_by - Email address
 * @param {string} origin_ip - Origin IP address
 */
export function useSwitchEmailClientSession() {
  return useMutation({
    mutationKey: ["switch_email_client_session"],
    mutationFn: async ({
      attempted_by,
      origin_ip,
      domain_name,
      isactive = false,
      value = false,
    }) =>
      switchEmailClientSession({
        attempted_by,
        origin_ip,
        domain_name,
        isactive,
        value,
      }),
  });
}

/**
 * Hook to delete email client session
 * @param {string} attempted_by - Email address
 * @param {string} origin_ip - Origin IP address
 */
export function useDeleteEmailClientSession() {
  return useMutation({
    mutationKey: ["delete_email_client_session"],
    mutationFn: async ({ attempted_by, origin_ip, domain_name }) =>
      deleteEmailClientSession({ attempted_by, origin_ip, domain_name }),
  });
}
