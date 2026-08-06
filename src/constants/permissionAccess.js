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

// Add/edit/copy pages historically only checked their own create/edit
// permission (e.g. "domain:create") and never the resource's "view"
// permission, so a user granted create/edit but not view could still reach
// these pages directly by URL even though they'd never see an entry point
// to them in the UI. This table adds that missing view requirement at the
// route level instead of touching every add/edit/copy page individually -
// PermissionRouteGuard consults it for every navigation.
//
// Only resources with a "<resource>:view" permission that's actually used
// today to gate that resource's list/details page are listed here - e.g.
// `maintenance` is deliberately omitted because its list page gates on
// "maintenance:create", not a "maintenance:view" permission, so there's no
// well-established view permission to require.
export const PERMISSION_ROUTE_PREFIXES = [
  { prefix: "/domain/add", permission: "domain:view" },
  { prefix: "/domain/edit", permission: "domain:view" },
  { prefix: "/domain/copy", permission: "domain:view" },

  { prefix: "/mailbox/add", permission: "mailbox:view" },
  { prefix: "/mailbox/edit", permission: "mailbox:view" },
  { prefix: "/mailbox/copy", permission: "mailbox:view" },

  { prefix: "/identities/add", permission: "identity:view" },
  { prefix: "/identities/edit", permission: "identity:view" },

  { prefix: "/department/add", permission: "department:view" },
  { prefix: "/department/edit", permission: "department:view" },
  { prefix: "/department/copy", permission: "department:view" },

  { prefix: "/disclaimer/add", permission: "disclaimer:view" },
  { prefix: "/disclaimer/edit", permission: "disclaimer:view" },
  { prefix: "/disclaimer/copy", permission: "disclaimer:view" },

  { prefix: "/caution/add", permission: "caution:view" },
  { prefix: "/caution/edit", permission: "caution:view" },
  { prefix: "/caution/copy", permission: "caution:view" },

  { prefix: "/server/add", permission: "server:view" },
  { prefix: "/server/edit", permission: "server:view" },

  { prefix: "/organization/add", permission: "organization:view" },
  { prefix: "/organization/edit", permission: "organization:view" },

  { prefix: "/user/add", permission: "user:view" },
  { prefix: "/user/edit", permission: "user:view" },

  { prefix: "/crm/services/add", permission: "crm:service:view" },
  { prefix: "/crm/services/edit", permission: "crm:service:view" },

  { prefix: "/crm/purchase-order/add", permission: "crm:purchase_order:view" },
  { prefix: "/crm/purchase-order/edit", permission: "crm:purchase_order:view" },
  {
    prefix: "/crm/purchase-order/create-link-service",
    permission: "crm:purchase_order:view",
  },
  {
    prefix: "/crm/purchase-order/edit-link-service",
    permission: "crm:purchase_order:view",
  },

  { prefix: "/crm/invoice/create-copy", permission: "crm:invoice:view" },
  { prefix: "/crm/invoice/create", permission: "crm:invoice:view" },
  { prefix: "/crm/invoice/revise", permission: "crm:invoice:view" },
  { prefix: "/crm/invoice/edit", permission: "crm:invoice:view" },

  { prefix: "/policies/general/add", permission: "policy:general:view" },
  { prefix: "/policies/general/edit", permission: "policy:general:view" },
  { prefix: "/policies/general/copy", permission: "policy:general:view" },

  { prefix: "/policies/filters/add", permission: "policy:filters:view" },
  { prefix: "/policies/filters/edit", permission: "policy:filters:view" },
  { prefix: "/policies/filters/copy", permission: "policy:filters:view" },

  { prefix: "/policies/attachments/add", permission: "policy:attachment:view" },
  { prefix: "/policies/attachments/edit", permission: "policy:attachment:view" },
  { prefix: "/policies/attachments/copy", permission: "policy:attachment:view" },

  // RestrictionPolicy/DistributionPolicy/ForwardingPolicy list pages check
  // "policy:general:view" instead of their own resource's view permission -
  // a pre-existing copy-paste bug documented in CLAUDE.md and deliberately
  // left alone. Matched here too so this guard doesn't silently "fix" that
  // as a side effect (that's a separate decision for someone to make).
  { prefix: "/policies/restrictions/add", permission: "policy:general:view" },
  { prefix: "/policies/restrictions/edit", permission: "policy:general:view" },

  { prefix: "/policies/distribution/add", permission: "policy:general:view" },
  { prefix: "/policies/distribution/edit", permission: "policy:general:view" },
  { prefix: "/policies/distribution/copy", permission: "policy:general:view" },

  { prefix: "/policies/forwarding/add", permission: "policy:general:view" },
  { prefix: "/policies/forwarding/edit", permission: "policy:general:view" },
  { prefix: "/policies/forwarding/copy", permission: "policy:general:view" },

  {
    prefix: "/permissions-template/add",
    permission: "user:security:permissions:template:view",
  },
];

export const getRequiredPermissionForPath = (pathname) => {
  const match = PERMISSION_ROUTE_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.permission ?? null;
};
