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
  MessageCircle,
  Users,
  Paperclip,
  HardDrive,
  Save,
  Info,
  MessageSquare,
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useToastify } from "@/hooks/useToastify";
import { useAtomValue } from "jotai";
import { parentOrgAtom, selectedOrganizationAtom } from "@/store/userInfo";
import {
  useGetChatConfig,
  useUpdateChatConfig,
  useUpdateChatQuota,
} from "@/hooks/useChat";
import AccessDenied from "@/components/common/AccessDenied";
import DataFetchError from "@/components/common/DataFechError";
import { userProfileAtom } from "@/store/userProfile";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function prefsEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.enableDirectChat === b.enableDirectChat &&
    a.enableGroupChat === b.enableGroupChat &&
    a.enableFileSharing === b.enableFileSharing &&
    a.fileSizeLimit === b.fileSizeLimit
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
  badge = null,
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {badge && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {badge}
              </span>
            )}
          </div>
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
// File-size limit row
// ---------------------------------------------------------------------------
function FileSizeLimitRow({ value, onValueChange, disabled }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ${disabled ? "opacity-60" : "hover:border-primary/30 hover:shadow-sm"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500">
          <HardDrive size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Per-File Size Limit
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Maximum allowed file size per upload. Files exceeding this limit
            will be rejected.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={99999}
            disabled={disabled}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className={`w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm text-foreground
              outline-none ring-0 transition-colors
              focus:border-primary focus:ring-2 focus:ring-primary/20
              ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          />
          <span className="text-sm text-muted-foreground">MB</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quota row
// ---------------------------------------------------------------------------
function QuotaRow({ value, onValueChange, onUpdate, isUpdating, disabled, isQuotaChanged }) {
  const parentOrg = useAtomValue(parentOrgAtom);
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 ${disabled ? "opacity-60" : "hover:border-primary/30 hover:shadow-sm"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500">
          <HardDrive size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Total Allocated Quota
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Maximum storage space allowed for chat files (GB).
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={parentOrg?.available_size || 0}
              disabled={disabled}
              value={value}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className={`w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm text-foreground
                outline-none ring-0 transition-colors
                focus:border-primary focus:ring-2 focus:ring-primary/20
                ${disabled ? "cursor-not-allowed opacity-50" : ""}
                ${value > (parentOrg?.available_size || 0)
                  ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                  : ""
                }`}
            />
            <span className="text-sm text-muted-foreground">GB</span>
          </div>
          <button
            onClick={onUpdate}
            disabled={disabled || isUpdating || value > (parentOrg?.available_size || 0)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium shadow transition-all disabled:opacity-50 ${
              isQuotaChanged
                ? "bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-primary ring-offset-1"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Quota"}
          </button>
        </div>
        {value > (parentOrg?.available_size || 0) && (
          <p className="mr-[110px] text-[10px] font-medium text-destructive">
            Exceeds available: {parentOrg?.available_size || 0} GB
          </p>
        )}
      </div>
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
export default function ChatPreferencePage() {
  const toast = useToastify();
  const selectedOrg = useAtomValue(selectedOrganizationAtom);
  const parentOrg = useAtomValue(parentOrgAtom);
  const organization_id = selectedOrg?.organization_id;
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};

  const { data: config, isLoading, refetch, isError } = useGetChatConfig(organization_id);
  const { mutateAsync: updateConfig, isPending: isSaving } = useUpdateChatConfig();
  const { mutateAsync: updateQuota, isPending: isUpdatingQuota } = useUpdateChatQuota();

  // Working copy — what the user is currently editing
  const [prefs, setPrefs] = useState({
    enableDirectChat: true,
    enableGroupChat: true,
    enableFileSharing: true,
    fileSizeLimit: 10,
    quotaAllocated: 500,
  });

  // Last-saved snapshot — used to detect unsaved changes
  const [savedPrefs, setSavedPrefs] = useState(null);

  const isDirty = !prefsEqual(prefs, savedPrefs);

  useEffect(() => {
    if (config) {
      const mapped = {
        enableDirectChat: config?.data?.enable_direct_chat,
        enableGroupChat: config?.data?.enable_group_chat,
        enableFileSharing: config?.data?.enable_file_sharing,
        fileSizeLimit: config?.data?.file_size_limit_mb,
        quotaAllocated: config?.data?.quota_allocated || 0,
      };
      setPrefs(mapped);
      setSavedPrefs(mapped);
    }
  }, [config]);

  const toggle = useCallback(
    (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] })),
    [],
  );

  const handleSave = async () => {
    if (!isDirty || !organization_id) return;

    const maxQuota = parentOrg?.available_size || 0;
    if (prefs.quotaAllocated > maxQuota) {
      toast(
        "error",
        `Quota allocated (${prefs.quotaAllocated} GB) cannot exceed available storage (${maxQuota} GB).`,
      );
      return;
    }

    try {
      const payload = {
        enable_direct_chat: prefs.enableDirectChat,
        enable_file_sharing: prefs.enableFileSharing,
        enable_group_chat: prefs.enableGroupChat,
        file_size_limit_mb: prefs.fileSizeLimit,
        organization_id: organization_id,
        quota_allocated: prefs.quotaAllocated,
      };
      await updateConfig(payload);
      setSavedPrefs({ ...prefs });
      toast("success", "Chat preferences saved successfully.");
      refetch();
    } catch (err) {
      const message = err?.message || "Unknown error";
      toast("error", `Failed to save preferences: ${message}`);
    }
  };

  const handleUpdateQuota = async () => {
    if (!organization_id) return;

    const maxQuota = parentOrg?.available_size || 0;
    if (prefs.quotaAllocated > maxQuota) {
      toast(
        "error",
        `Quota allocated (${prefs.quotaAllocated} GB) cannot exceed available storage (${maxQuota} GB).`,
      );
      return;
    }

    try {
      await updateQuota({
        organization_id,
        new_quota: prefs.quotaAllocated,
      });
      setSavedPrefs((prev) => ({
        ...prev,
        quotaAllocated: prefs.quotaAllocated,
      }));
      toast("success", "Chat quota updated successfully.");
      refetch();
    } catch (err) {
      const message = err?.message || "Unknown error";
      toast("error", `Failed to update quota: ${message}`);
    }
  };


  if (!permissions.includes("chat:view") && !parentOrg?.chat_service_enabled && !selectedOrg?.chat_service_enabled) {
    return (
      <AccessDenied content="Don't have the access to list the Chat Preference." />
    );
  }

  return (
    <div className="flex h-full w-full flex-col px-2 text-left">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex w-full items-center justify-between gap-4">
        <Breadcrumbs
          items={[{ name: "Chat" }, { name: "Chat Preference" }]}
        />

        <button
          id="save-chat-preferences-btn"
          onClick={handleSave}
          disabled={!isDirty || isSaving || prefs.quotaAllocated > (parentOrg?.available_size || 0)}
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
      </div>

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
          These settings control the chat functionality available to all users
          in your organization. Changes take effect immediately after saving.
          Disabling a feature will prevent users from accessing it across all
          platforms.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Settings cards ────────────────────────────────────────── */}
        <div className="col-span-1 space-y-3 lg:col-span-2">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Chat Channels
          </h2>

          <PreferenceToggleRow
            icon={MessageCircle}
            iconColor="bg-blue-500"
            title="Enable Direct Chat"
            description="Allow users to send and receive one-on-one private messages. When disabled, users can only communicate through groups or channels."
            checked={prefs.enableDirectChat}
            onToggle={() => toggle("enableDirectChat")}
            badge="1-on-1"
          />

          <PreferenceToggleRow
            icon={Users}
            iconColor="bg-violet-500"
            title="Enable Group & Channel Chat"
            description="Allow users to create and participate in group conversations and public/private channels. Disabling this restricts all multi-user chat."
            checked={prefs.enableGroupChat}
            onToggle={() => toggle("enableGroupChat")}
            badge="Groups & Channels"
          />

          <h2 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            File Sharing
          </h2>

          <PreferenceToggleRow
            icon={Paperclip}
            iconColor="bg-teal-500"
            title="Enable File Sharing"
            description="Allow users to attach and share files within chat messages. Disabling this blocks all file uploads and downloads through the chat interface."
            checked={prefs.enableFileSharing}
            onToggle={() => toggle("enableFileSharing")}
          />

          <FileSizeLimitRow
            value={prefs.fileSizeLimit}
            disabled={!prefs.enableFileSharing || isLoading}
            onValueChange={(v) =>
              setPrefs((prev) => ({ ...prev, fileSizeLimit: v }))
            }
          />

          <h2 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Storage & Quota
          </h2>

          <QuotaRow
            value={prefs.quotaAllocated}
            onValueChange={(v) => setPrefs((prev) => ({ ...prev, quotaAllocated: v }))}
            onUpdate={handleUpdateQuota}
            isUpdating={isUpdatingQuota}
            disabled={isLoading}
            isQuotaChanged={prefs.quotaAllocated !== savedPrefs?.quotaAllocated}
          />
        </div>

        {/* ── Live summary card ─────────────────────────────────────── */}
        <div className="col-span-1">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
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
                  Direct Chat
                </span>
                <StatusPill
                  label={prefs.enableDirectChat ? "Enabled" : "Disabled"}
                  active={prefs.enableDirectChat}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Group / Channel Chat
                </span>
                <StatusPill
                  label={prefs.enableGroupChat ? "Enabled" : "Disabled"}
                  active={prefs.enableGroupChat}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  File Sharing
                </span>
                <StatusPill
                  label={prefs.enableFileSharing ? "Enabled" : "Disabled"}
                  active={prefs.enableFileSharing}
                />
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Max File Size
                  </span>
                  <span
                    className={`text-xs font-semibold ${prefs.enableFileSharing
                      ? "text-foreground"
                      : "text-muted-foreground line-through"
                      }`}
                  >
                    {prefs.fileSizeLimit} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-5 rounded-lg bg-muted/50 p-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span>{" "}
                Disabling Direct Chat forces all communication into monitored
                group channels, which is useful for compliance-driven
                environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
