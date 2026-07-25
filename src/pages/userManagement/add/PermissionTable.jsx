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
import { Eye, Plus, Edit, Trash, Shield, Check, X } from "lucide-react";
import { getReactSelectStyles } from "@/utils/selectTheme";
import Select from "react-select";

const PermissionTables = ({
  setValue,
  watch,
  label = "Assign Permissions",
  showDropdown = false,
  optionsPermission = [],
  handleAdd = () => {},
  template = "",
}) => {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const currentPermissions = watch("permissions") || [];
  const permissionConfig = useMemo(() => getPermissionConfig(), []);
  const [showTooltip, setShowTooltip] = useState(false);

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
    setValue("permissions", newPermissions);
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
    setValue("permissions", newPermissions);
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

  return (
    <div className="space-y-3">
      {/* Template Selection */}
      {showDropdown && (
        <div className="border-border bg-card rounded border p-3">
          <label className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
            <span>Load Permission Template</span>
            <span className="text-muted-foreground text-xs">
              (Optional quick start)
            </span>
          </label>
          <Select
            options={optionsPermission}
            value={
              optionsPermission.find((opt) => opt.value === template) || null
            }
            onChange={handleAdd}
            placeholder="Select template..."
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
        {permissionConfig.general.map((section) => {
          const stats = getStats(section);

          return (
            <div
              key={section.category}
              className="border-border rounded border"
            >
              {/* Header */}
              <div className="border-border bg-muted/20 flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-card-foreground text-sm font-semibold">
                    {section.categoryLabel}
                  </span>
                  <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                    {stats.granted}/{stats.total}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAll(section)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                >
                  {stats.granted === stats.total ? (
                    <X size={12} />
                  ) : (
                    <Check size={12} />
                  )}
                  {stats.granted === stats.total ? "Clear" : "All"}
                </button>
              </div>

              {/* Table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border bg-muted/5 border-b">
                    <th className="p-2 text-left text-xs font-semibold">
                      Module
                    </th>
                    {["view", "create", "edit", "delete"].map((action, idx) => (
                      <th
                        key={action}
                        className="border-border w-16 border-l p-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            toggleAll(section, action);
                            if (action === "view" && showTooltip) {
                              setShowTooltip(false);
                            }
                          }}
                          className="hover:text-primary group relative w-full"
                          title={`Click to assign all ${action} permissions`}
                        >
                          {action === "view" && (
                            <Eye size={15} className="mx-auto" />
                          )}
                          {action === "create" && (
                            <Plus size={15} className="mx-auto" />
                          )}
                          {action === "edit" && (
                            <Edit size={15} className="mx-auto" />
                          )}
                          {action === "delete" && (
                            <Trash size={15} className="mx-auto" />
                          )}

                          {/* Animated bubble tooltip */}
                          {action === "view" &&
                            idx === 0 &&
                            section === permissionConfig.general[0] &&
                            showTooltip && (
                              <div className="absolute -bottom-16 left-1/2 z-50 -translate-x-1/2 animate-bounce">
                                <div className="bg-primary text-primary-foreground relative rounded-lg px-3 py-2 text-xs font-medium shadow-xl">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span>
                                      Click icons to assign column permissions!
                                    </span>
                                  </div>
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
                      className={`border-border hover:bg-muted/10 border-b last:border-b-0 ${idx % 2 ? "bg-muted/5" : ""}`}
                    >
                      <td className="p-2 text-xs font-medium">
                        {module.label}
                      </td>
                      {["view", "create", "edit", "delete"].map((action) => {
                        const perm = module.permissions[action];
                        return (
                          <td
                            key={action}
                            className="border-border border-l p-1.5 text-center"
                          >
                            {perm && permissions.includes(perm) ? (
                              <input
                                type="checkbox"
                                checked={isPermissionGranted(perm)}
                                onChange={() => togglePermission(perm)}
                                className="border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded focus:ring-2"
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">
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
          );
        })}
      </div>

      {/* Security Permissions - Same Table Format as General */}
      {permissions.includes("user:security:permissions:view") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-warning" />
            <h4 className="text-card-foreground text-sm font-semibold">
              Security Permissions
            </h4>
            <span className="text-muted-foreground text-xs">
              (Sensitive)
            </span>
          </div>

          {permissionConfig.security.map((section) => {
            const stats = getStats(section);

            return (
              <div
                key={section.category}
                className="border-warning/30 rounded border"
              >
                {/* Header */}
                <div className="border-warning/30  flex items-center justify-between border-b px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-card-foreground text-sm font-semibold">
                      {section.categoryLabel}
                    </span>
                    <span className="bg-warning/20 text-warning rounded px-2 py-0.5 text-xs font-medium">
                      {stats.granted}/{stats.total}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAll(section)}
                    className=" text-warning  flex items-center gap-1 rounded px-2 py-1 text-xs font-medium"
                  >
                    {stats.granted === stats.total ? <X size={12} /> : <Check size={12} />}
                    {stats.granted === stats.total ? "Clear" : "All"}
                  </button>
                </div>

                {/* Table - Same Format as General */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left text-xs font-semibold">
                        Module
                      </th>
                      {["view", "create", "edit", "delete"].map((action) => (
                        <th
                          key={action}
                          className="border-warning/20 w-16 border-l p-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAll(section, action)}
                            className="hover:text-primary text-muted-foreground w-full"
                            title={`Click to assign all ${action} permissions`}
                          >
                            {action === "view" && <Eye size={15} className="mx-auto" />}
                            {action === "create" && <Plus size={15} className="mx-auto" />}
                            {action === "edit" && <Edit size={15} className="mx-auto" />}
                            {action === "delete" && <Trash size={15} className="mx-auto" />}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.modules.map((module, idx) => (
                      <tr
                        key={module.name}
                        className={`border-warning/20 hover:bg-warning/10 border-b last:border-b-0 `}
                      >
                        <td className="p-2 text-xs font-medium">
                          {module.label}
                        </td>
                        {["view", "create", "edit", "delete"].map((action) => {
                          const perm = module.permissions[action];
                          return (
                            <td
                              key={action}
                              className="border-warning/20 border-l p-1.5 text-center"
                            >
                              {perm && permissions.includes(perm) ? (
                                <input
                                  type="checkbox"
                                  checked={isPermissionGranted(perm)}
                                  onChange={() => togglePermission(perm)}
                                  className="border-border text-warning focus:ring-warning h-4 w-4 cursor-pointer rounded focus:ring-2"
                                />
                              ) : (
                                <span className="text-muted-foreground text-xs">
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PermissionTables;