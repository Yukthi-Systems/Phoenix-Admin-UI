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

import React, { useMemo, useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/store/userProfile";
import { getPermissionConfig } from "./permissionConfig";
import {
  Eye,
  Plus,
  Edit,
  Trash,
  Shield,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import { getReactSelectStyles } from "@/utils/selectTheme";
import Select from "react-select";
import EditModelBox from "@/components/common/EditModelBox";

// Granting this lets the admin user create API keys with ANY permission
// from the API key wizard's list — independent of what this admin user
// itself holds. A mandatory confirmation is required before it is granted.
const API_KEY_CREATE_PERMISSION = "api_keys:create";

const ACTIONS = [
  { key: "view", label: "View", Icon: Eye },
  { key: "create", label: "Create", Icon: Plus },
  { key: "edit", label: "Edit", Icon: Edit },
  { key: "delete", label: "Delete", Icon: Trash },
];

// Two visual themes reused by the general vs. security sections below —
// keeping full class strings per key (rather than building them from the
// variant name) so Tailwind's JIT scanner can see every class literally.
const VARIANT_STYLES = {
  primary: {
    border: "border-border",
    headerBg: "bg-muted/30",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
    allBtn: "bg-primary/10 text-primary hover:bg-primary/25",
    columnBtn: "hover:bg-primary/10 hover:text-primary",
    rowHover: "hover:bg-primary/5",
    accent: "accent-primary",
  },
  warning: {
    border: "border-warning/30",
    headerBg: "bg-warning/10",
    badgeBg: "bg-warning/20",
    badgeText: "text-warning",
    allBtn: "bg-warning/15 text-warning hover:bg-warning/25",
    columnBtn: "hover:bg-warning/15 hover:text-warning",
    rowHover: "hover:bg-warning/10",
    accent: "accent-warning",
  },
};

const PermissionTables = ({
  setValue,
  watch,
  label = "Assign Permissions",
  showDropdown = false,
  optionsPermission = [],
  handleAdd = () => {},
  template = "",
  dropdownLabel = "Load Permission Template",
  dropdownHint = "(Optional quick start)",
  dropdownPlaceholder = "Select template...",
}) => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const currentPermissions = watch("permissions") || [];
  const permissionConfig = useMemo(() => getPermissionConfig(), []);
  const [showTooltip, setShowTooltip] = useState(false);
  const [apiKeyWarning, setApiKeyWarning] = useState({
    open: false,
    pendingPermissions: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 500);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const isPermissionGranted = (permission) =>
    currentPermissions.includes(permission);

  // Every permission change funnels through here so the API-key-create
  // warning can never be bypassed (single checkbox, column toggle, or
  // section "Select all").
  const commitPermissions = (newPermissions) => {
    const grantsApiKeyCreate =
      newPermissions.includes(API_KEY_CREATE_PERMISSION) &&
      !currentPermissions.includes(API_KEY_CREATE_PERMISSION);

    if (grantsApiKeyCreate) {
      setApiKeyWarning({ open: true, pendingPermissions: newPermissions });
      return;
    }

    setValue("permissions", newPermissions);
  };

  const confirmApiKeyWarning = () => {
    if (apiKeyWarning.pendingPermissions) {
      setValue("permissions", apiKeyWarning.pendingPermissions);
    }
    setApiKeyWarning({ open: false, pendingPermissions: null });
  };

  const cancelApiKeyWarning = () => {
    setApiKeyWarning({ open: false, pendingPermissions: null });
  };

  const togglePermission = (permission) => {
    const parts = permission.split(":");
    const action = parts[parts.length - 1];
    const module = parts.slice(0, -1).join(":");
    const newPermissions = [...currentPermissions];
    const index = newPermissions.indexOf(permission);

    if (index > -1) {
      newPermissions.splice(index, 1);
      if (action === "view") {
        ["create", "edit", "delete"].forEach((act) => {
          const relatedPerm = `${module}:${act}`;
          const relatedIdx = newPermissions.indexOf(relatedPerm);
          if (relatedIdx > -1) newPermissions.splice(relatedIdx, 1);
        });
      }
    } else {
      const isSecurityPermission = parts.includes("security");
      if (!isSecurityPermission && action !== "view") {
        const viewPermission = `${module}:view`;
        if (!newPermissions.includes(viewPermission)) {
          newPermissions.push(viewPermission);
        }
      }
      newPermissions.push(permission);
    }
    commitPermissions(newPermissions);
  };

  const toggleAll = (section, action = null) => {
    const newPermissions = [...currentPermissions];
    const allPerms = [];

    section.modules.forEach((module) => {
      if (action) {
        const perm = module.permissions[action];
        if (perm) allPerms.push(perm);
      } else {
        Object.values(module.permissions).forEach((perm) => {
          if (perm) allPerms.push(perm);
        });
      }
    });

    const allGranted = allPerms.every((p) => newPermissions.includes(p));

    if (allGranted) {
      allPerms.forEach((perm) => {
        const idx = newPermissions.indexOf(perm);
        if (idx > -1) newPermissions.splice(idx, 1);
      });
      if (action === "view") {
        section.modules.forEach((module) => {
          ["create", "edit", "delete"].forEach((act) => {
            const relatedPerm = module.permissions[act];
            if (relatedPerm) {
              const idx = newPermissions.indexOf(relatedPerm);
              if (idx > -1) newPermissions.splice(idx, 1);
            }
          });
        });
      }
    } else {
      allPerms.forEach((perm) => {
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm);
        }
      });
      if (action && action !== "view") {
        section.modules.forEach((module) => {
          const viewPerm = module.permissions["view"];
          if (viewPerm && !newPermissions.includes(viewPerm)) {
            newPermissions.push(viewPerm);
          }
        });
      }
    }
    commitPermissions(newPermissions);
  };

  const getStats = (section) => {
    let total = 0,
      granted = 0;
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

  const renderSection = (section, variant, isFirstSection) => {
    const style = VARIANT_STYLES[variant];
    const stats = getStats(section);
    const allGranted = stats.total > 0 && stats.granted === stats.total;

    return (
      <div
        key={section.category}
        className={`overflow-hidden rounded-lg border ${style.border}`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${style.border} ${style.headerBg}`}>
              <th className="p-3 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-card-foreground truncate text-base font-semibold">
                      {section.categoryLabel}
                    </span>
                    <span
                      className={`${style.badgeBg} ${style.badgeText} shrink-0 rounded px-2 py-0.5 text-xs font-medium`}
                    >
                      {stats.granted}/{stats.total}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAll(section)}
                    className={`${style.allBtn} flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors`}
                  >
                    {allGranted ? <X size={13} /> : <Check size={13} />}
                    {allGranted ? "Clear all" : "Select all"}
                  </button>
                </div>
              </th>
              {ACTIONS.map((actionDef, idx) => (
                <th
                  key={actionDef.key}
                  className={`w-20 border-l p-1.5 ${style.border}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      toggleAll(section, actionDef.key);
                      if (actionDef.key === "view" && showTooltip) {
                        setShowTooltip(false);
                      }
                    }}
                    className={`group relative flex w-full flex-col items-center gap-1 rounded py-1.5 transition-colors ${style.columnBtn}`}
                    title={`Click to toggle all ${actionDef.label} permissions in this section`}
                  >
                    <actionDef.Icon size={16} />
                    <span className="text-[11px] font-semibold">
                      {actionDef.label}
                    </span>

                    {/* One-time onboarding hint on the very first column */}
                    {isFirstSection && idx === 0 && showTooltip && (
                      <div className="absolute -bottom-14 left-1/2 z-50 -translate-x-1/2 animate-bounce">
                        <div className="bg-primary text-primary-foreground relative rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shadow-xl">
                          Click to assign a whole column
                          <div className="bg-primary absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.modules.map((module, idx) => (
              <tr
                key={module.name}
                className={`border-b last:border-b-0 ${style.border} ${style.rowHover} transition-colors ${idx % 2 ? "bg-muted/5" : ""}`}
              >
                <td className="text-card-foreground p-3 text-sm font-medium">
                  {module.label}
                </td>
                {ACTIONS.map(({ key }) => {
                  const perm = module.permissions[key];
                  const isAssignable = perm && permissions.includes(perm);
                  return (
                    <td
                      key={key}
                      className={`border-l p-0 text-center ${style.border}`}
                    >
                      {isAssignable ? (
                        <label className="flex h-full w-full cursor-pointer items-center justify-center py-3">
                          <input
                            type="checkbox"
                            checked={isPermissionGranted(perm)}
                            onChange={() => togglePermission(perm)}
                            className={`h-4 w-4 cursor-pointer rounded ${style.accent}`}
                          />
                        </label>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Template Selection */}
      {showDropdown && (
        <div className="border-border bg-card rounded border p-3">
          <label className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
            <span>{dropdownLabel}</span>
            {dropdownHint && (
              <span className="text-muted-foreground text-xs">
                {dropdownHint}
              </span>
            )}
          </label>
          <Select
            options={optionsPermission}
            value={
              optionsPermission.find((opt) => opt.value === template) || null
            }
            onChange={handleAdd}
            placeholder={dropdownPlaceholder}
            styles={getReactSelectStyles()}
            isSearchable
            isClearable
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-foreground flex items-center gap-2 text-base font-semibold">
          <Shield size={16} />
          {label}
        </h3>
        <span className="text-muted-foreground text-xs">
          View access required for other actions
        </span>
      </div>

      {/* General Permissions */}
      <div className="space-y-3">
        {permissionConfig.general.map((section, idx) =>
          renderSection(section, "primary", idx === 0),
        )}
      </div>

      {/* Security Permissions */}
      {permissions.includes("user:security:permissions:view") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-warning" />
            <h4 className="text-card-foreground text-sm font-semibold">
              Security Permissions
            </h4>
            <span className="text-muted-foreground text-xs">(Sensitive)</span>
          </div>

          {permissionConfig.security.map((section) =>
            renderSection(section, "warning", false),
          )}
        </div>
      )}

      {/* Mandatory confirmation before "Admin API Keys" -> Create can be granted */}
      <EditModelBox
        isOpen={apiKeyWarning.open}
        label="Security Warning: API Key Creation"
        showCancel={false}
        outsideClick={false}
        handleCancel={cancelApiKeyWarning}
      >
        <div className="w-md max-w-full text-left">
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-warning h-8 w-8 flex-shrink-0" />
            <div className="space-y-2 text-sm text-foreground">
              <p>
                This grants the user permission to{" "}
                <strong>create API Keys</strong>.
              </p>
              <p>
                API keys are assigned permissions independently of the admin
                user creating them. Even if this admin user has{" "}
                <strong>no other permissions</strong>, they can still create an
                API key with additional permissions of their choosing — such as
                access to organisations, identities, domains, mailboxes or
                departments — and use that key to gain{" "}
                <strong>unauthorized access</strong> to the system.
              </p>
              <p>Only grant this to administrators you fully trust.</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border p-2 text-sm font-medium"
              onClick={cancelApiKeyWarning}
            >
              Cancel
            </button>
            <button
              type="button"
              className="border-warning text-warning rounded-lg border p-2 text-sm font-medium"
              onClick={confirmApiKeyWarning}
            >
              I Understand, Grant Permission
            </button>
          </div>
        </div>
      </EditModelBox>
    </div>
  );
};

export default PermissionTables;
