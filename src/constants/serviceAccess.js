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



export const SERVICE_KEYS = {
  EMAIL: "email_service_enabled",
  CHAT: "chat_service_enabled",
  FILE: "file_service_enabled",
};

export const SERVICE_LABELS = {
  [SERVICE_KEYS.EMAIL]: "Email service",
  [SERVICE_KEYS.CHAT]: "Chat service",
  [SERVICE_KEYS.FILE]: "File service",
};


export const SERVICE_ROUTE_PREFIXES = [

  { prefix: "/mailbox", service: SERVICE_KEYS.EMAIL },
  { prefix: "/caution", service: SERVICE_KEYS.EMAIL },
  { prefix: "/disclaimer", service: SERVICE_KEYS.EMAIL },

  { prefix: "/policies/general", service: SERVICE_KEYS.EMAIL },
  { prefix: "/policies/filters", service: SERVICE_KEYS.EMAIL },
  { prefix: "/policies/attachment", service: SERVICE_KEYS.EMAIL },
  { prefix: "/policies/forwarding", service: SERVICE_KEYS.EMAIL },
  { prefix: "/policies/distribution", service: SERVICE_KEYS.EMAIL },

  { prefix: "/logs/email-flow-logs", service: SERVICE_KEYS.EMAIL },
  { prefix: "/logs/email-login-attempts", service: SERVICE_KEYS.EMAIL },

  { prefix: "/server/mail-mapping", service: SERVICE_KEYS.EMAIL },
  { prefix: "/server/mailbox-sync", service: SERVICE_KEYS.EMAIL },

  { prefix: "/email-client-sessions", service: SERVICE_KEYS.EMAIL },

  { prefix: "/chat", service: SERVICE_KEYS.CHAT },

  { prefix: "/files", service: SERVICE_KEYS.FILE },
];

export const getRequiredServiceForPath = (pathname) => {
  const match = SERVICE_ROUTE_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.service ?? null;
};

// An org "has" a service only if both the logged-in root organization and
// the currently selected/viewed organization have it enabled — a child org
// can't have a service the parent chain doesn't have, and switching to view
// a different org should respect that org's own setting too.
export const isServiceEnabledForOrg = (serviceKey, parentOrg, selectedOrg) => {
  if (!serviceKey) return true;
  return Boolean(parentOrg?.[serviceKey]) && Boolean(selectedOrg?.[serviceKey]);
};
