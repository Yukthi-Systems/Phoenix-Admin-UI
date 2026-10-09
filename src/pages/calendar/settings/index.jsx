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

import { useEffect, useState } from "react";
import { Share2, Save, Info, CalendarDays } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useToastify } from "@/hooks/useToastify";
import { useAtomValue } from "jotai";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";
import {
  useGetTasksServiceConfig,
  useUpdateTasksServiceConfig,
} from "@/hooks/useCalendar";
import AccessDenied from "@/components/common/AccessDenied";
import { userProfileAtom } from "@/store/userProfile";

// ---------------------------------------------------------------------------
// Toggle row (mirrors chat/preference's PreferenceToggleRow)
// ---------------------------------------------------------------------------
function PreferenceToggleRow({
  icon: Icon,
  iconColor,
  title,
  description,
  checked,
  onToggle,
  disabled = false,
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ${
        disabled ? "opacity-60" : "hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
        />
        <div
          className={`relative h-6 w-11 rounded-full border border-border bg-muted transition-colors duration-200
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20
            peer-checked:border-primary peer-checked:bg-primary
            after:absolute after:left-[2px] after:top-[1px] after:h-5 after:w-5 after:rounded-full
            after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']
            peer-checked:after:translate-x-full peer-checked:after:border-white
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        />
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------
function StatusPill({ label, active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-success/15 text-success"
          : "bg-destructive/15 text-destructive"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-destructive"}`}
      />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CalendarSettingsPage() {
  const toast = useToastify();
  const selectedOrg = useAtomValue(selectedOrganizationAtom);
  const parentOrg = useAtomValue(parentOrgAtom);
  const organization_id = selectedOrg?.organization_id;
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const canEdit = permissions.includes("tasks_calendar:edit");

  const {
    data: config,
    isLoading,
    refetch,
  } = useGetTasksServiceConfig(organization_id);
  const { mutateAsync: updateConfig, isPending: isSaving } =
    useUpdateTasksServiceConfig();

  // Working copy vs. last-saved snapshot, so "unsaved changes" can be detected
  const [isExternalSharingEnabled, setIsExternalSharingEnabled] =
    useState(false);
  const [savedValue, setSavedValue] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const isDirty = savedValue !== null && isExternalSharingEnabled !== savedValue;

  useEffect(() => {
    if (config) {
      const value = config?.data?.is_external_sharing_enabled ?? false;
      setIsExternalSharingEnabled(value);
      setSavedValue(value);
      setUpdatedAt(config?.data?.updated_at || null);
    }
  }, [config]);

  const handleSave = async () => {
    if (!isDirty || !organization_id) return;

    try {
      await updateConfig({
        organization_id,
        is_external_sharing_enabled: isExternalSharingEnabled,
      });
      setSavedValue(isExternalSharingEnabled);
      toast("success", "Tasks & Calendar settings saved successfully.");
      refetch();
    } catch (err) {
      const message = err?.message || "Unknown error";
      toast("error", `Failed to save settings: ${message}`);
    }
  };

  if (
    !permissions.includes("tasks_calendar:view") &&
    !parentOrg?.tasks_service_enabled &&
    !selectedOrg?.tasks_service_enabled
  ) {
    return (
      <AccessDenied content="Don't have the access to view Tasks & Calendar Settings." />
    );
  }

  return (
    <div className="flex h-full w-full flex-col px-2 text-left">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <Breadcrumbs items={[{ name: "Calendar & Tasks" }, { name: "Settings" }]} />

        <button
          id="save-tasks-calendar-settings-btn"
          onClick={handleSave}
          disabled={!isDirty || !canEdit || isSaving}
          title={
            !canEdit
              ? "You don't have permission to edit Tasks & Calendar settings"
              : undefined
          }
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all
            hover:bg-primary/90
            disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving…
            </>
          ) : (
            <>
              <Save size={15} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* ── Unsaved-changes notice ───────────────────────────────────── */}
      {isDirty && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <Info size={15} className="shrink-0" />
          You have unsaved changes. Click{" "}
          <span className="mx-1 font-semibold">Save Settings</span> to apply
          them.
        </div>
      )}

      {/* ── Info box ────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          These settings control the Tasks &amp; Calendar functionality
          available to all users in your organization. Changes take effect
          immediately after saving.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Settings card ─────────────────────────────────────────── */}
        <div className="col-span-1 space-y-3 lg:col-span-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sharing
          </h2>

          <PreferenceToggleRow
            icon={Share2}
            iconColor="bg-blue-500"
            title="Enable External Sharing"
            description="Allow users to share task and calendar views with people outside your organization via a public link."
            checked={isExternalSharingEnabled}
            onToggle={() => setIsExternalSharingEnabled((v) => !v)}
            disabled={isLoading || !canEdit}
          />
        </div>

        {/* ── Live summary card ─────────────────────────────────────── */}
        <div className="col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Current Configuration
              </h3>
              {isDirty && (
                <span className="ml-auto rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                  Unsaved
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  External Sharing
                </span>
                <StatusPill
                  label={isExternalSharingEnabled ? "Enabled" : "Disabled"}
                  active={isExternalSharingEnabled}
                />
              </div>

              {updatedAt && (
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {new Date(updatedAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
