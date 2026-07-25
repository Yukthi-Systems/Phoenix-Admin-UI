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
  Users,
  Shield,
  Server,
  FileBarChart,
  Database,
  Eye,
  Settings,
  Lock,
} from "lucide-react";

export const PERMISSION_CATEGORIES = {
  users: {
    icon: Users,
    label: "User Management",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    darkColor: "dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  crm: {
    icon: FileBarChart,
    label: "CRM & Servers",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    darkColor: "dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
  migrations: {
    icon: Database,
    label: "Migrations",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    darkColor: "dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
  },
  logs: {
    icon: Eye,
    label: "Logs & Dashboard",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    darkColor: "dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
  },
  mail_flow: {
    icon: Settings,
    label: "Mail Flow",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    darkColor: "dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  },
  security: {
    icon: Shield,
    label: "Security",
    color: "bg-red-50 text-red-700 border-red-200",
    darkColor: "dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

/**
 * Categorizes permissions based on their prefix/content
 * @param {string[]} permissions - Array of permission strings
 * @returns {Object} - Object with category counts
 */
export const categorizePermissions = (permissions) => {
  return {
    users: permissions.filter(
      (p) =>
        (p.startsWith("user:") && !p.includes("security:")) ||
        p.startsWith("organization:"),
    ).length,

    crm: permissions.filter(
      (p) => p.startsWith("crm:") || p.startsWith("server:"),
    ).length,

    migrations: permissions.filter((p) => p.includes("migration:")).length,

    logs: permissions.filter(
      (p) => p.startsWith("logs:") || p === "dashboard:view",
    ).length,

    mail_flow: permissions.filter(
      (p) =>
        p.startsWith("domain:") ||
        p.startsWith("policy:") ||
        p.startsWith("department:") ||
        p.startsWith("mailbox:") ||
        p.startsWith("disclaimer:") ||
        p.startsWith("caution:"),
    ).length,

    security: permissions.filter((p) => p.includes("security:")).length,
  };
};

/**
 * Gets the primary category for a single permission
 * @param {string} permission - Permission string
 * @returns {string} - Category name
 */
export const getPermissionCategory = (permission) => {
  if (
    (permission.startsWith("user:") && !permission.includes("security:")) ||
    permission.startsWith("organization:")
  ) {
    return "users";
  }
  if (permission.startsWith("crm:") || permission.startsWith("server:")) {
    return "crm";
  }
  if (permission.includes("migration:")) {
    return "migrations";
  }
  if (permission.startsWith("logs:") || permission === "dashboard:view") {
    return "logs";
  }
  if (
    permission.startsWith("domain:") ||
    permission.startsWith("policy:") ||
    permission.startsWith("department:") ||
    permission.startsWith("mailbox:") ||
    permission.startsWith("disclaimer:") ||
    permission.startsWith("caution:")
  ) {
    return "mail_flow";
  }
  if (permission.includes("security:")) {
    return "security";
  }
  return "users"; // default fallback
};

/**
 * Formats permission name for display (removes prefixes, capitalizes)
 * @param {string} permission - Permission string
 * @returns {string} - Formatted permission name
 */
export const formatPermissionName = (permission) => {
  const prefixMap = {
    user: "User",
    organization: "Organization",
    crm: "CRM",
    server: "Server",
    logs: "Logs",
    domain: "Domain",
    policy: "Policy",
    department: "Department",
    mailbox: "Mailbox",
    disclaimer: "Disclaimer",
    caution: "Caution",
  };

  const actionMap = {
    view: "View",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
  };

  const parts = permission.split(":");

  if (parts.length < 2) {
    return permission
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const formattedParts = parts.map((part, index) => {
    const cleaned = part.replace(/_/g, " ");

    if (index === 0 && prefixMap[part]) {
      return prefixMap[part];
    }

    if (index === parts.length - 1 && actionMap[part]) {
      return actionMap[part];
    }

    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });

  return formattedParts.join(" ");
};
