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

import { useState, useCallback, useEffect } from "react";
import {
  FolderOpen,
  Share2,
  History,
  Save,
  Info,
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useToastify } from "@/hooks/useToastify";
import { useAtomValue } from "jotai";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";
import {
  useGetFileServiceConfig,
  useUpdateFileServiceConfig,
} from "@/hooks/useFiles";
import AccessDenied from "@/components/common/AccessDenied";
import { userProfileAtom } from "@/store/userProfile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Opt-in by default: nothing is actually enabled until a file_settings row
// exists, so a never-configured org should visibly start "off" rather than
// falsely showing toggles as already on.
const DEFAULT_PREFS = {
  enableFileSharing: false,
  enableFileVersioning: false,
};

function prefsEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.enableFileSharing === b.enableFileSharing &&
    a.enableFileVersioning === b.enableFileVersioning
  );
}

// ---------------------------------------------------------------------------
// Toggle row
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
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ${disabled ? "opacity-60" : "hover:border-primary/30 hover:shadow-sm"
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${active
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
export default function FileServicePreferencePage() {
  const toast = useToastify();
  const selectedOrg = useAtomValue(selectedOrganizationAtom);
  const parentOrg = useAtomValue(parentOrgAtom);
  const organization_id = selectedOrg?.organization_id;
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  const { data: config, isLoading, isError, refetch } = useGetFileServiceConfig(organization_id);
  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateFileServiceConfig();

  // Working copy — what the user is currently editing
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  // Last-saved snapshot — used to detect unsaved changes
  const [savedPrefs, setSavedPrefs] = useState(null);

  // No file_settings row exists yet for this organization (first time here) —
  // the config GET 404s until the first Save creates it.
  const [isNewConfig, setIsNewConfig] = useState(false);

  const isDirty = !prefsEqual(prefs, savedPrefs);

  useEffect(() => {
    if (config) {
      const mapped = {
        enableFileSharing: config?.data?.is_sharing_enabled ?? false,
        enableFileVersioning: config?.data?.is_file_versioning_enabled ?? false,
      };
      setPrefs(mapped);
      setSavedPrefs(mapped);
      setIsNewConfig(false);
    } else if (isError && !isLoading) {
      setSavedPrefs(DEFAULT_PREFS);
      setIsNewConfig(true);
    }
  }, [config, isError, isLoading]);

  const toggle = useCallback(
    (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] })),
    [],
  );

  const canSave = isDirty || isNewConfig;

  const handleSave = async () => {
    if (!canSave || !organization_id) return;

    try {
      const payload = {
        organization_id,
        enable_file_sharing: prefs.enableFileSharing,
        enable_file_versioning: prefs.enableFileVersioning,
      };
      await updateConfig(payload);
      setSavedPrefs({ ...prefs });
      setIsNewConfig(false);
      toast("success", "File service preferences saved successfully.");
      refetch();
    } catch (err) {
      const message = err?.message || "Unknown error";
      toast("error", `Failed to save preferences: ${message}`);
    }
  };

  if (!permissions.includes("file:view") && !parentOrg?.file_service_enabled && !selectedOrg?.file_service_enabled) {
    return (
      <AccessDenied content="Don't have the access to view the File Service Preference." />
    );
  }

  return (
    <div className="flex h-full w-full flex-col px-2 text-left">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <Breadcrumbs
          items={[{ name: "Files" }, { name: "File Service Preference" }]}
        />

        {permissions.includes("file:edit") && (
          <button
            id="save-file-preferences-btn"
            onClick={handleSave}
            disabled={!canSave || isSaving}
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
                Save Preferences
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Not-yet-configured notice ──────────────────────────────────── */}
      {isNewConfig && !isDirty && !isLoading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          <Info size={15} className="shrink-0" />
          File service hasn't been configured for this organization yet. Review the settings below and click{" "}
          <span className="mx-1 font-semibold">Save Preferences</span> to create the initial configuration.
        </div>
      )}

      {/* ── Unsaved-changes notice ───────────────────────────────────── */}
      {isDirty && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <Info size={15} className="shrink-0" />
          You have unsaved changes. Click <span className="mx-1 font-semibold">Save Preferences</span> to apply them.
        </div>
      )}

      {/* ── Info box ────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          These settings control the file storage functionality available to all
          users in your organization. Changes take effect immediately after saving.
          Per-user storage quotas are managed individually on the File Users page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Settings cards ────────────────────────────────────────── */}
        <div className="col-span-1 space-y-3 lg:col-span-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            File Service
          </h2>

          <PreferenceToggleRow
            icon={Share2}
            iconColor="bg-teal-500"
            title="Enable File Sharing"
            description="Allow users to share uploaded files with other identities. Disabling this blocks all file sharing across the organization."
            checked={prefs.enableFileSharing}
            onToggle={() => toggle("enableFileSharing")}
            disabled={isLoading || !permissions.includes("file:edit")}
          />

          <PreferenceToggleRow
            icon={History}
            iconColor="bg-violet-500"
            title="Enable File Versioning"
            description="Keep previous versions of a file whenever it is overwritten, allowing users to restore an earlier version."
            checked={prefs.enableFileVersioning}
            onToggle={() => toggle("enableFileVersioning")}
            disabled={isLoading || !permissions.includes("file:edit")}
          />
        </div>

        {/* ── Live summary card ─────────────────────────────────────── */}
        <div className="col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen size={16} className="text-primary" />
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
                  File Sharing
                </span>
                <StatusPill
                  label={prefs.enableFileSharing ? "Enabled" : "Disabled"}
                  active={prefs.enableFileSharing}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  File Versioning
                </span>
                <StatusPill
                  label={prefs.enableFileVersioning ? "Enabled" : "Disabled"}
                  active={prefs.enableFileVersioning}
                />
              </div>
            </div>

            {/* Tip */}
            <div className="mt-5 rounded-lg bg-muted/50 p-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span>{" "}
                Storage quota for File Service users is allocated per identity
                from the organization's overall available storage — manage it
                from the File Users page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
