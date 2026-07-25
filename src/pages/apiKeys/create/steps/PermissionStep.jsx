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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { Eye, Plus, Edit, Trash, Check, X, Shield } from "lucide-react";

const API_KEY_PERMISSIONS_CONFIG = [
  {
    category: "mail_flow",
    categoryLabel: "Mail Flow",
    modules: [
      {
        label: "Domains",
        permissions: {
          view: "domain:view",
          create: "domain:create",
          edit: "domain:edit",
          delete: "domain:delete",
        },
      },
      {
        label: "MailBox",
        permissions: {
          view: "mailbox:view",
          create: "mailbox:create",
          edit: "mailbox:edit",
          delete: "mailbox:delete",
        },
      },
    ],
  },
  {
    category: "policies",
    categoryLabel: "Policies",
    modules: [
      {
        label: "General Policy",
        permissions: {
          view: "policy:general:view",
          create: "policy:general:create",
          edit: "policy:general:edit",
          delete: "policy:general:delete",
        },
      },
      {
        label: "Filters Policy",
        permissions: {
          view: "policy:filters:view",
          create: "policy:filters:create",
          edit: "policy:filters:edit",
          delete: "policy:filters:delete",
        },
      },
      {
        label: "Attachment Policy",
        permissions: {
          view: "policy:attachment:view",
          create: "policy:attachment:create",
          edit: "policy:attachment:edit",
          delete: "policy:attachment:delete",
        },
      },
      {
        label: "Restriction Policy",
        permissions: {
          view: "policy:restriction:view",
          create: "policy:restriction:create",
          edit: "policy:restriction:edit",
          delete: "policy:restriction:delete",
        },
      },
      {
        label: "Forwarding Policy",
        permissions: {
          view: "policy:forwarding:view",
          create: "policy:forwarding:create",
          edit: "policy:forwarding:edit",
          delete: "policy:forwarding:delete",
        },
      },
      {
        label: "Distribution Policy",
        permissions: {
          view: "policy:distribution:view",
          create: "policy:distribution:create",
          edit: "policy:distribution:edit",
          delete: "policy:distribution:delete",
        },
      },
    ],
  },
  {
    category: "mail_management",
    categoryLabel: "Mail Management",
    modules: [
      {
        label: "Departments",
        permissions: {
          view: "department:view",
          create: "department:create",
          edit: "department:edit",
          delete: "department:delete",
        },
      },
      {
        label: "Disclaimer",
        permissions: {
          view: "disclaimer:view",
          create: "disclaimer:create",
          edit: "disclaimer:edit",
          delete: "disclaimer:delete",
        },
      },
      {
        label: "Caution",
        permissions: {
          view: "caution:view",
          create: "caution:create",
          edit: "caution:edit",
          delete: "caution:delete",
        },
      },
    ],
  },
];

const PermissionsStep = () => {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const currentPermissions = watch("permissions") || [];

  const isPermissionGranted = (permission) =>
    currentPermissions.includes(permission);

  // Toggle individual permission - no dependencies
  const togglePermission = (permission) => {
    let newPermissions = [...currentPermissions];
    
    if (newPermissions.includes(permission)) {
      newPermissions = newPermissions.filter((p) => p !== permission);
    } else {
      newPermissions.push(permission);
    }

    setValue("permissions", newPermissions, { shouldValidate: true });
  };

  // Toggle all permissions in a column or section
  const toggleAll = (items, actionType = null) => {
    let newPermissions = [...currentPermissions];
    const targetPermissions = [];

    if (actionType) {
      // Column toggle: Get all permissions of specific type
      items.modules.forEach((module) => {
        if (module.permissions[actionType]) {
          targetPermissions.push(module.permissions[actionType]);
        }
      });
    } else {
      // Section toggle: Get all permissions
      items.modules.forEach((module) => {
        Object.values(module.permissions).forEach((p) =>
          targetPermissions.push(p),
        );
      });
    }

    const allGranted = targetPermissions.every((p) =>
      newPermissions.includes(p),
    );

    if (allGranted) {
      // Remove all
      targetPermissions.forEach((p) => {
        newPermissions = newPermissions.filter((perm) => perm !== p);
      });
    } else {
      // Add all
      targetPermissions.forEach((p) => {
        if (!newPermissions.includes(p)) newPermissions.push(p);
      });
    }

    setValue("permissions", newPermissions, { shouldValidate: true });
  };

  const getStats = (section) => {
    let total = 0;
    let granted = 0;
    section.modules.forEach((module) => {
      Object.values(module.permissions).forEach((perm) => {
        if (perm) {
          total++;
          if (isPermissionGranted(perm)) granted++;
        }
      });
    });
    return { total, granted };
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">
            {t("Assign Permissions")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("Select the scopes required for this API key.")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {API_KEY_PERMISSIONS_CONFIG.map((section) => {
          const stats = getStats(section);

          return (
            <div
              key={section.category}
              className="rounded-lg border border-border bg-card shadow-sm"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    {t(section.categoryLabel)}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {stats.granted}/{stats.total}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAll(section)}
                  className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {stats.granted === stats.total ? (
                    <>
                      <X size={14} />
                      {t("Clear All")}
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      {t("Select All")}
                    </>
                  )}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-muted/5 border-b border-border">
                      <th className="px-4 py-3 font-semibold text-foreground min-w-[200px]">
                        {t("Module")}
                      </th>
                      {["view", "create", "edit", "delete"].map((action) => (
                        <th
                          key={action}
                          className="w-24 border-l border-border px-2 py-2 text-center"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAll(section, action)}
                            className="group flex w-full flex-col items-center justify-center gap-1 rounded p-1 hover:bg-muted/50"
                            title={t(`Toggle all ${action} permissions`)}
                          >
                            <span className="text-muted-foreground group-hover:text-primary">
                              {action === "view" && <Eye size={16} />}
                              {action === "create" && <Plus size={16} />}
                              {action === "edit" && <Edit size={16} />}
                              {action === "delete" && <Trash size={16} />}
                            </span>
                            <span className="text-[10px] font-medium uppercase text-muted-foreground group-hover:text-primary">
                              {t(action)}
                            </span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.modules.map((module, idx) => (
                      <tr
                        key={module.label}
                        className={`border-b border-border last:border-0 hover:bg-muted/20 ${
                          idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {t(module.label)}
                        </td>
                        {["view", "create", "edit", "delete"].map((action) => {
                          const permString = module.permissions[action];
                          const isChecked = isPermissionGranted(permString);

                          return (
                            <td
                              key={action}
                              className="border-l border-border px-2 py-2 text-center"
                            >
                              {permString ? (
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermission(permString)}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground/30">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {errors.permissions && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
          <Shield size={16} />
          {errors.permissions.message}
        </div>
      )}
    </div>
  );
};

export default PermissionsStep;