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

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash,
  Shield,
  SquareCheck,
  Square,
  X,
} from "lucide-react";
import { baseConfig } from "../add/permissionConfig";

const UserPermissionModal = ({ isOpen, onClose, permissions = [] }) => {
  const [openSections, setOpenSections] = useState({});
  const [openSecuritySections, setOpenSecuritySections] = useState({});

  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const isPermissionGranted = (permission) => {
    return permissionSet.has(permission);
  };

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSecuritySection = (sectionId) => {
    setOpenSecuritySections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getStats = (section) => {
    let total = 0;
    let granted = 0;
    section.modules.forEach((module) => {
      Object.values(module.permissions).forEach((permission) => {
        if (permission) {
          total++;
          if (isPermissionGranted(permission)) {
            granted++;
          }
        }
      });
    });
    return { total, granted };
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalStats = useMemo(() => {
    let totalPermissions = 0;
    let grantedPermissions = 0;

    baseConfig.general.forEach((category) => {
      category.modules.forEach((module) => {
        Object.values(module.permissions).forEach((permission) => {
          if (permission) {
            totalPermissions++;
            if (permissionSet.has(permission)) {
              grantedPermissions++;
            }
          }
        });
      });
    });

    baseConfig.security.forEach((category) => {
      category.modules.forEach((module) => {
        Object.values(module.permissions).forEach((permission) => {
          if (permission) {
            totalPermissions++;
            if (permissionSet.has(permission)) {
              grantedPermissions++;
            }
          }
        });
      });
    });

    return { totalPermissions, grantedPermissions };
  }, [permissionSet]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      <div className="fixed z-[9999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl border border-border">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground text-left">
              User Permissions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalStats.grantedPermissions} of {totalStats.totalPermissions}{" "}
              permissions granted
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* General Permissions */}
          <div className="space-y-2.5">
            <h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold mb-3">
              <Shield size={14} />
              General Permissions
            </h3>

            {baseConfig.general.map((section) => {
              const stats = getStats(section);

              return (
                <div
                  key={section.category}
                  className="border-border rounded border"
                >
                  {/* Header */}
                  <div className="border-border bg-muted/20 flex items-center justify-between border-b px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.category)}
                      className="flex items-center gap-1.5 text-left hover:text-primary transition-colors"
                    >
                      {openSections[section.category] ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      <span className="text-card-foreground text-xs font-semibold">
                        {section.categoryLabel}
                      </span>
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                        {stats.granted}/{stats.total}
                      </span>
                    </button>
                  </div>

                  {/* Table */}
                  {openSections[section.category] && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-border bg-muted/5 border-b">
                          <th className="p-1.5 text-left text-[11px] font-semibold">
                            Module
                          </th>
                          {["view", "create", "edit", "delete"].map(
                            (action) => (
                              <th
                                key={action}
                                className="border-border w-12 border-l p-1"
                                title={action}
                              >
                                {action === "view" && (
                                  <Eye
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "create" && (
                                  <Plus
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "edit" && (
                                  <Edit
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "delete" && (
                                  <Trash
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {section.modules.map((module, idx) => (
                          <tr
                            key={module.name}
                            className={`border-border hover:bg-muted/10 border-b last:border-b-0 ${
                              idx % 2 ? "bg-muted/5" : ""
                            }`}
                          >
                            <td className="p-1.5 text-[11px] font-medium text-left">
                              {module.label}
                            </td>
                            {["view", "create", "edit", "delete"].map(
                              (action) => {
                                const perm = module.permissions[action];
                                const hasPermission =
                                  perm && isPermissionGranted(perm);

                                return (
                                  <td
                                    key={action}
                                    className="border-border border-l p-1 text-center"
                                  >
                                    {perm ? (
                                      hasPermission ? (
                                        <SquareCheck className="text-success w-3.5 h-3.5 mx-auto" />
                                      ) : (
                                        <Square className="text-muted-foreground w-3.5 h-3.5 mx-auto" />
                                      )
                                    ) : (
                                      <span className="text-muted-foreground text-[10px]">
                                        —
                                      </span>
                                    )}
                                  </td>
                                );
                              },
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>

          {/* Security Permissions - Same Table Format */}
          <div className="space-y-2.5 mt-6">
            <div className="flex items-center gap-1.5 mb-3">
              <Shield size={12} className="text-warning" />
              <h4 className="text-card-foreground text-xs font-semibold">
                Security Permissions
              </h4>
              <span className="text-muted-foreground text-[9px]">
                (Sensitive)
              </span>
            </div>

            {baseConfig.security.map((section) => {
              const stats = getStats(section);

              return (
                <div
                  key={section.category}
                  className="border-warning/30 rounded border"
                >
                  {/* Header */}
                  <div className="border-warning/30  flex items-center justify-between border-b px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSecuritySection(section.category)}
                      className="flex items-center gap-1.5 text-left hover:text-warning transition-colors"
                    >
                      {openSecuritySections[section.category] ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      <span className="text-card-foreground text-xs font-semibold">
                        {section.categoryLabel}
                      </span>
                      <span className=" text-warning rounded px-1.5 py-0.5 text-[10px] font-medium">
                        {stats.granted}/{stats.total}
                      </span>
                    </button>
                  </div>

                  {/* Table - Same Format as General */}
                  {openSecuritySections[section.category] && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-warning/20 border-b">
                          <th className="p-1.5 text-left text-[11px] font-semibold">
                            Module
                          </th>
                          {["view", "create", "edit", "delete"].map(
                            (action) => (
                              <th
                                key={action}
                                className="border-warning/20 w-12 border-l p-1"
                                title={action}
                              >
                                {action === "view" && (
                                  <Eye
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "create" && (
                                  <Plus
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "edit" && (
                                  <Edit
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                                {action === "delete" && (
                                  <Trash
                                    size={13}
                                    className="mx-auto text-card-foreground"
                                  />
                                )}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {section.modules.map((module, idx) => (
                          <tr
                            key={module.name}
                            className={`border-warning/20 hover:bg-warning/10 border-b last:border-b-0 
                            }`}
                          >
                            <td className="p-1.5 text-[11px] font-medium text-left">
                              {module.label}
                            </td>
                            {["view", "create", "edit", "delete"].map(
                              (action) => {
                                const perm = module.permissions[action];
                                const hasPermission =
                                  perm && isPermissionGranted(perm);

                                return (
                                  <td
                                    key={action}
                                    className="border-warning/20 border-l p-1 text-center"
                                  >
                                    {perm ? (
                                      hasPermission ? (
                                        <SquareCheck className="text-success w-3.5 h-3.5 mx-auto" />
                                      ) : (
                                        <Square className="text-muted-foreground w-3.5 h-3.5 mx-auto" />
                                      )
                                    ) : (
                                      <span className="text-muted-foreground text-[10px]">
                                        —
                                      </span>
                                    )}
                                  </td>
                                );
                              },
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPermissionModal;