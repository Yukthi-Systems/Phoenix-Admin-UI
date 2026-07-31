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

import { adminStore } from "@/store/store";
import { userProfileAtom } from "@/store/userProfile";

export const baseConfig = {
  general: [
    {
      category: "admin_management",
      categoryLabel: "Admin Management",
      modules: [
        {
          name: "organization",
          label: "Organisations",
          permissions: {
            view: "organization:view",
            create: "organization:create",
            edit: "organization:edit",
            delete: "organization:delete",
          },
        },
        {
          name: "dashboard",
          label: "Organisation Dashboard",
          permissions: {
            view: "dashboard:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "support_ticket",
          label: "Support Tickets (User-end)",
          permissions: {
            view: "support_ticket:view",
            create: "support_ticket:create",
            edit: "support_ticket:edit",
            delete: null,
          },
        },
        {
          name: "support_admin",
          label: "Support Admin",
          permissions: {
            view: "support_admin:view",
            create: "support_admin:create",
            edit: "support_admin:edit",
            delete: "support_admin:delete",
          },
        },
        {
          name: "api_key",
          label: "Admin API Keys",
          permissions: {
            view: "api_keys:view",
            create: "api_keys:create",
            edit: "api_keys:edit",
            delete: "api_keys:delete",
          },
        },
        {
          name: "imap_sync",
          label: "IMAP Sync Tool",
          permissions: {
            view: "imap_sync:view",
            create: "imap_sync:create",
            edit: null,
            delete: null,
          },
        },
      ],
    },
    {
      category: "user_management",
      categoryLabel: "User Management",
      modules: [
        {
          name: "domain",
          label: "Domains",
          permissions: {
            view: "domain:view",
            create: "domain:create",
            edit: "domain:edit",
            delete: "domain:delete",
          },
        },
        {
          name: "departments",
          label: "Departments",
          permissions: {
            view: "department:view",
            create: "department:create",
            edit: "department:edit",
            delete: "department:delete",
          },
        },
        {
          name: "identities",
          label: "User Identity",
          permissions: {
            view: "identity:view",
            create: "identity:create",
            edit: "identity:edit",
            delete: "identity:delete",
          },
        },
        {
          name: "mailbox",
          label: "E-Mail Service (MailBoxes)",
          permissions: {
            view: "mailbox:view",
            create: "mailbox:create",
            edit: "mailbox:edit",
            delete: "mailbox:delete",
          },
        },
        {
          name: "chat",
          label: "Chat Service",
          permissions: {
            view: "chat:view",
            create: "chat:create",
            edit: "chat:edit",
            delete: "chat:delete",
          },
        },
        {
          name: "file",
          label: "File Service",
          permissions: {
            view: "file:view",
            create: "file:create",
            edit: "file:edit",
            delete: "file:delete",
          },
        },
        {
          name: "user",
          label: "Admin Panel Users",
          permissions: {
            view: "user:view",
            create: "user:create",
            edit: "user:edit",
            delete: "user:delete",
          },
        },
      ],
    },
    {
      category: "crm",
      categoryLabel: "Customer Relationship Management (CRM)",
      modules: [
        {
          name: "service",
          label: "Services",
          permissions: {
            view: "crm:service:view",
            create: "crm:service:create",
            edit: "crm:service:edit",
            delete: "crm:service:delete",
          },
        },
        {
          name: "purchase_order",
          label: "Purchase Order",
          permissions: {
            view: "crm:purchase_order:view",
            create: "crm:purchase_order:create",
            edit: "crm:purchase_order:edit",
            delete: "crm:purchase_order:delete",
          },
        },
        {
          name: "invoice",
          label: "Invoices",
          permissions: {
            view: "crm:invoice:view",
            create: "crm:invoice:create",
            edit: "crm:invoice:edit",
            delete: null,
          },
        },
      ],
    },
    {
      category: "server_management",
      categoryLabel: "Server Management",
      modules: [
        {
          name: "server",
          label: "Servers",
          permissions: {
            view: "server:view",
            create: "server:create",
            edit: "server:edit",
            delete: "server:delete",
          },
        },
        {
          name: "mailbox_migration",
          label: "MailBox Migration",
          permissions: {
            view: "mailbox:migration:view",
            create: "mailbox:migration:create",
            edit: null,
            delete: null,
          },
        },
        {
          name: "domain_migration",
          label: "Domain Migration",
          permissions: {
            view: "domain:migration:view",
            create: "domain:migration:create",
            edit: null,
            delete: null,
          },
        },
        {
          name: "mailq",
          label: "Mail Queue",
          permissions: {
            view: "mailq:view",
            create: null,
            edit: "mailq:edit",
            delete: null,
          },
        },
        {
          name: "identity_admin_lookup",
          label: "E-Mail Identity Admin Lookup",
          permissions: {
            view: "identity:admin:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "system_maintenance",
          label: "Admin Maintenance - System Alerts",
          permissions: {
            view: null,
            create: "maintenance:create",
            edit: "maintenance:edit",
            delete: "maintenance:delete",
          },
        },
      ],
    },
    {
      category: "logs",
      categoryLabel: "Logs",
      modules: [
        {
          name: "audit_logs",
          label: "Admin Audits",
          permissions: {
            view: "logs:audit:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "mail_flow_logs",
          label: "E-Mail Service - Mail Flow",
          permissions: {
            view: "logs:mail_flow:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "login_attempts",
          label: "E-Mail Service - Login Attempts",
          permissions: {
            view: "logs:login_attempts:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
      ],
    },
    {
      category: "policies",
      categoryLabel: "All Policies & Restrictions",
      modules: [
        {
          name: "restriction_policy",
          label: "Geo or IP Restriction Policy",
          permissions: {
            view: "policy:restriction:view",
            create: "policy:restriction:create",
            edit: "policy:restriction:edit",
            delete: "policy:restriction:delete",
          },
        },
        {
          name: "general_policy",
          label: "E-Mail Service - General Policy",
          permissions: {
            view: "policy:general:view",
            create: "policy:general:create",
            edit: "policy:general:edit",
            delete: "policy:general:delete",
          },
        },
        {
          name: "filters_policy",
          label: "E-Mail Service - Filter Policy",
          permissions: {
            view: "policy:filters:view",
            create: "policy:filters:create",
            edit: "policy:filters:edit",
            delete: "policy:filters:delete",
          },
        },
        {
          name: "policy_attachment",
          label: "E-Mail Service - Attachment Policy",
          permissions: {
            view: "policy:attachment:view",
            create: "policy:attachment:create",
            edit: "policy:attachment:edit",
            delete: "policy:attachment:delete",
          },
        },
        {
          name: "forwarding_policy",
          label: "E-Mail Service - Forwarding Rules",
          permissions: {
            view: "policy:forwarding:view",
            create: "policy:forwarding:create",
            edit: "policy:forwarding:edit",
            delete: "policy:forwarding:delete",
          },
        },
        {
          name: "distribution_policy",
          label: "E-Mail Service - Distribution Policy",
          permissions: {
            view: "policy:distribution:view",
            create: "policy:distribution:create",
            edit: "policy:distribution:edit",
            delete: "policy:distribution:delete",
          },
        },
        {
          name: "email_disclaimer",
          label: "E-Mail Service - Disclaimer Message",
          permissions: {
            view: "disclaimer:view",
            create: "disclaimer:create",
            edit: "disclaimer:edit",
            delete: "disclaimer:delete",
          },
        },
        {
          name: "email_caution",
          label: "E-Mail Service - Caution Message",
          permissions: {
            view: "caution:view",
            create: "caution:create",
            edit: "caution:edit",
            delete: "caution:delete",
          },
        },
      ],
    },
    {
      category: "session_management",
      categoryLabel: "Session Management",
      modules: [
        {
          // Backend has no distinct permission strings per session type —
          // MailBox/Mail 25 App/SSO session endpoints all check the same
          // session:view/edit/delete permissions, so these three rows are a
          // cosmetic split: granting one effectively grants it for all three.
          name: "mailbox_session",
          label: "MailBox",
          permissions: {
            view: "session:view",
            create: null,
            edit: "session:edit",
            delete: "session:delete",
          },
        },
        {
          // /app/session* endpoints only check session:view and
          // session:delete — there is no edit/patch endpoint for app
          // sessions on the backend, hence no edit permission here.
          name: "mail25_session",
          label: "Mail 25 App",
          permissions: {
            view: "session:view",
            create: null,
            edit: null,
            delete: "session:delete",
          },
        },
        {
          name: "sso_session",
          label: "Single Sign-On (SSO)",
          permissions: {
            view: "session:view",
            create: null,
            edit: "session:edit",
            delete: "session:delete",
          },
        },
      ],
    },
  ],
  security: [
    {
      category: "admin_user_security",
      categoryLabel: "Admin User Security Management",
      modules: [
        {
          name: "2fa_email",
          label: "2FA Email",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:2fa:email:edit",
            delete: null,
          },
        },
        {
          name: "2fa_sms",
          label: "2FA SMS (Phone-based)",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:2fa:sms_phone:edit",
            delete: null,
          },
        },
        {
          name: "totp",
          label: "2FA TOTP (Scanner-based)",
          permissions: {
            view: "user:security:2fa:totp:view",
            create: null,
            edit: "user:security:2fa:totp:edit",
            delete: null,
          },
        },
        {
          name: "backup_codes",
          label: "Backup Security Codes",
          permissions: {
            view: "user:security:backup_codes:view",
            create: null,
            edit: "user:security:backup_codes:edit",
            delete: null,
          },
        },
        {
          name: "password",
          label: "Admin Password Management",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:password:edit",
            delete: null,
          },
        },
        {
          name: "user_permissions",
          label: "Permissions Configuration",
          permissions: {
            view: "user:security:permissions:view",
            create: null,
            edit: "user:security:permissions:edit",
            delete: null,
          },
        },
        {
          name: "permission_templates",
          label: "Permission Templates",
          permissions: {
            view: "user:security:permissions:template:view",
            create: null,
            edit: "user:security:permissions:template:edit",
            delete: null,
          },
        },
      ],
    },
  ],
};

// Helper to filter module permissions
const filterPermissions = (permissions, userPermissions) => {
  return Object.entries(permissions).reduce((acc, [key, value]) => {
    if (value === null || userPermissions.includes(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

// Helper to check if module has visible permissions
const hasVisiblePermissions = (permissions, userPermissions) => {
  return Object.values(permissions).some(
    (value) => value !== null && userPermissions.includes(value),
  );
};

// Helper to check if category should be included
const shouldIncludeCategory = (category, userPermissions) => {
  if (category.modules) {
    return category.modules.some((module) =>
      hasVisiblePermissions(module.permissions, userPermissions),
    );
  }
  return false;
};

// Create dynamic permission configuration
export const createPermissionConfig = (userPermissions = []) => {
  // Process general categories
  const processedGeneral = baseConfig.general
    .map((category) => ({
      ...category,
      modules: category.modules
        .map((module) => ({
          ...module,
          permissions: filterPermissions(module.permissions, userPermissions),
        }))
        .filter(
          (module) =>
            Object.keys(module.permissions).length > 0 &&
            hasVisiblePermissions(module.permissions, userPermissions),
        ),
    }))
    .filter((category) => shouldIncludeCategory(category, userPermissions));

  // Process security categories (now using same structure as general)
  const processedSecurity = baseConfig.security
    .map((category) => ({
      ...category,
      modules: category.modules
        .map((module) => ({
          ...module,
          permissions: filterPermissions(module.permissions, userPermissions),
        }))
        .filter(
          (module) =>
            Object.keys(module.permissions).length > 0 &&
            hasVisiblePermissions(module.permissions, userPermissions),
        ),
    }))
    .filter((category) => shouldIncludeCategory(category, userPermissions));

  return {
    general: processedGeneral,
    security: processedSecurity,
  };
};

// Get permission config function
export const getPermissionConfig = () => {
  const { permissions = [] } = adminStore.get(userProfileAtom) || {};
  return createPermissionConfig(permissions);
};