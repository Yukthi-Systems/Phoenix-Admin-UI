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
      category: "users",
      categoryLabel: "User Management",
      modules: [
        {
          name: "user",
          label: "Admin User",
          permissions: {
            view: "user:view",
            create: "user:create",
            edit: "user:edit",
            delete: "user:delete",
          },
        },
        {
          name: "organization",
          label: "Organization",
          permissions: {
            view: "organization:view",
            create: "organization:create",
            edit: "organization:edit",
            delete: "organization:delete",
          },
        },
        {
          name: "identities",
          label: "Identities",
          permissions: {
            view: "identity:view",
            create: "identity:create",
            edit: "identity:edit",
            delete: "identity:delete",
          },
        },
        {
          name: "chat",
          label: "Chat",
          permissions: {
            view: "chat:view",
            edit: "chat:edit",
          }
        },
        {
          name: "file",
          label: "File Service",
          permissions: {
            view: "file:view",
            create: "file:create",
            edit: "file:edit",
            delete: "file:delete",
          }
        }
      ],
    },
    {
      category: "crm",
      categoryLabel: "CRM (Internal)",
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
          name: "service",
          label: "Service",
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
          label: "Invoice",
          permissions: {
            view: "crm:invoice:view",
            create: "crm:invoice:create",
            edit: "crm:invoice:edit",
            delete: null,
          },
        },
        {
          name: "support_ticket",
          label: "Support Tickets",
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
      ],
    },
    {
      category: "migrations",
      categoryLabel: "Migration Management",
      modules: [
        {
          name: "mailbox_migration",
          label: "Mailbox Migration",
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
      ],
    },
    {
      category: "logs",
      categoryLabel: "Logs",
      modules: [
        {
          name: "dashboard",
          label: "Dashboard Metrics",
          permissions: {
            view: "dashboard:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "audit_logs",
          label: "Audit Logs",
          permissions: {
            view: "logs:audit:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "mail_flow_logs",
          label: "Mail Flow Logs",
          permissions: {
            view: "logs:mail_flow:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
        {
          name: "login_attempts",
          label: "Email Login Attempts",
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
      category: "mail_flow",
      categoryLabel: "Mail Flow",
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
          name: "general_policy",
          label: "General Policy",
          permissions: {
            view: "policy:general:view",
            create: "policy:general:create",
            edit: "policy:general:edit",
            delete: "policy:general:delete",
          },
        },
        {
          name: "filters_policy",
          label: "Filters Policy",
          permissions: {
            view: "policy:filters:view",
            create: "policy:filters:create",
            edit: "policy:filters:edit",
            delete: "policy:filters:delete",
          },
        },
        {
          name: "policy_attachment",
          label: "Policy Attachment",
          permissions: {
            view: "policy:attachment:view",
            create: "policy:attachment:create",
            edit: "policy:attachment:edit",
            delete: "policy:attachment:delete",
          },
        },
        {
          name: "restriction_policy",
          label: "Restriction Policy",
          permissions: {
            view: "policy:restriction:view",
            create: "policy:restriction:create",
            edit: "policy:restriction:edit",
            delete: "policy:restriction:delete",
          },
        },
        {
          name: "forwarding_policy",
          label: "Forwarding Policy",
          permissions: {
            view: "policy:forwarding:view",
            create: "policy:forwarding:create",
            edit: "policy:forwarding:edit",
            delete: "policy:forwarding:delete",
          },
        },
        {
          name: "distribution_policy",
          label: "Distribution Policy",
          permissions: {
            view: "policy:distribution:view",
            create: "policy:distribution:create",
            edit: "policy:distribution:edit",
            delete: "policy:distribution:delete",
          },
        },
        // 
        {
          name: "departments",
          label: "MailBox Departments",
          permissions: {
            view: "department:view",
            create: "department:create",
            edit: "department:edit",
            delete: "department:delete",
          },
        },
        {
          name: "mailbox",
          label: "MailBox",
          permissions: {
            view: "mailbox:view",
            create: "mailbox:create",
            edit: "mailbox:edit",
            delete: "mailbox:delete",
          },
        },
        {
          name: "email_disclaimer",
          label: "Email Disclaimer",
          permissions: {
            view: "disclaimer:view",
            create: "disclaimer:create",
            edit: "disclaimer:edit",
            delete: "disclaimer:delete",
          },
        },
        {
          name: "email_caution",
          label: "Email Caution",
          permissions: {
            view: "caution:view",
            create: "caution:create",
            edit: "caution:edit",
            delete: "caution:delete",
          },
        },
        {
          name: "email_client_sessions",
          label: "Mailbox Sessions",
          permissions: {
            view: "session:view",
            create: null,
            edit: "session:edit",
            delete: "session:delete",
          },
        },

        {
          name: "imap_sync",
          label: "IMAP Sync",
          permissions: {
            view: "imap_sync:view",
            create: "imap_sync:create",
            edit: null,
            delete: null,
          },
        },
        {
          name: "identity_admin_lookup",
          label: "Identity Lookup (Admin)",
          permissions: {
            view: "identity:admin:view",
            create: null,
            edit: null,
            delete: null,
          },
        },
      ],
    },
  ],
  security: [
    {
      category: "user_security",
      categoryLabel: "User Security Settings",
      modules: [
        {
          name: "2fa",
          label: "2FA Settings",
          permissions: {
            view: "user:security:2fa:view",
            create: null,
            edit: "user:security:2fa:edit",
            delete: null,
          },
        },
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
          label: "2FA SMS Phone",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:2fa:sms_phone:edit",
            delete: null,
          },
        },
        {
          name: "totp",
          label: "TOTP 2FA",
          permissions: {
            view: "user:security:2fa:totp:view",
            create: null,
            edit: "user:security:2fa:totp:edit",
            delete: null,
          },
        },
        {
          name: "mfa",
          label: "MFA Settings",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:mfa:edit",
            delete: null,
          },
        },
        {
          name: "password",
          label: "User Password",
          permissions: {
            view: null,
            create: null,
            edit: "user:security:password:edit",
            delete: null,
          },
        },
        {
          name: "backup_codes",
          label: "Backup Codes",
          permissions: {
            view: "user:security:backup_codes:view",
            create: null,
            edit: "user:security:backup_codes:edit",
            delete: null,
          },
        },
      ],
    },
    {
      category: "permissions_management",
      categoryLabel: "Permissions Management",
      modules: [
        {
          name: "user_permissions",
          label: "User Permissions",
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
    {
      category: "mail_queue",
      categoryLabel: "Mail Queue Management",
      modules: [
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
      ],
    },
    {
      category: "maintenance",
      categoryLabel: "System Maintenance",
      modules: [
        {
          name: "system_maintenance",
          label: "System Maintenance",
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
      category: "api_keys",
      categoryLabel: "API Keys",
      modules: [
        {
          name: "api_key",
          label: "API Keys",
          permissions: {
            view: "api_keys:view",
            create: "api_keys:create",
            edit: "api_keys:edit",
            delete: "api_keys:delete",
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