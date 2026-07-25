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
  getAuditLogs,
  getAuditLogsReq,
  getEmailLogs,
  getEmailLogsReq,
  getLoginLogs,
  getLoginLogsReq,
} from "@/api/logs";
import { useMutation } from "@tanstack/react-query";


export function useGetAuditLogs() {
  return useMutation({
    mutationKey: ["get_audit_logs"],
    mutationFn: async ({ filters, page, pageSize }) => {
      return await getAuditLogs(filters, page, pageSize);
    },
    retry: (failureCount, error) => {
      if (error?.response?.status && error.response.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
}
export function useGetAuditLogsReq() {
  return useMutation({
    mutationKey: ["get_audit_logs_req"],
    mutationFn: async ({ filters }) => {
      return await getAuditLogsReq(filters);
    },
  });
}

export function useGetEmailLogs() {
  return useMutation({
    mutationKey: ["get_email_logs"],
    mutationFn: async ({ filters, page, pageSize }) => {
      return await getEmailLogs(filters, page, pageSize);
    },
  });
}

export function useGetEmailLogsReq() {
  return useMutation({
    mutationKey: ["get_email_logs_req"],
    mutationFn: async ({ filters }) => {
      return await getEmailLogsReq(filters);
    },
  });
}

export function useGetLoginLogs() {
  return useMutation({
    mutationKey: ["get_login_logs"],
    mutationFn: async ({ filters, page, pageSize }) => {
      return await getLoginLogs(filters, page, pageSize);
    },
  });
}

export function useGetLoginLogsReq() {
  return useMutation({
    mutationKey: ["get_login_logs_Req"],
    mutationFn: async ({ filters }) => {
      return await getLoginLogsReq(filters);
    },
  });
}
