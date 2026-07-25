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

import React from "react";
import { useTranslation } from "react-i18next";
import ViewModelBox from "@/components/common/ViewModelBox";
import { useApiKeyDetails } from "@/hooks/useApiKeys";
import DataLoading from "@/components/common/DataLoading";
import { useUserTimezone } from "@/hooks/useTimezone";
import { toast } from "react-toastify";
import {
  Key,
  Copy,
  User,
  Calendar,
  Shield,
  FileText,
  Info,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

const ViewApiKeyModal = ({ isOpen, onClose, key_id, organizationId }) => {
  const { t } = useTranslation();
  const { formatUserDateNice } = useUserTimezone();
  const { data: apiKey, isLoading } = useApiKeyDetails(
    organizationId,
    key_id,
  );
  const [showKey, setShowKey] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("Copied to clipboard"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter out description from details to avoid duplication
  const filteredDetails = React.useMemo(() => {
    if (!apiKey?.details) return {};
    const { description, ...rest } = apiKey.details;
    return rest;
  }, [apiKey?.details]);

  return (
    <ViewModelBox
      isOpen={isOpen}
      handleCancel={onClose}
      title={t("API Key Details")}
      width="max-w-3xl"
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <DataLoading />
        </div>
      ) : apiKey ? (
        <div className="w-full text-left">
          {/* Header Section: Key Name & Value */}
          <div className="mt-2 mb-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4">
            <div className="flex flex-col gap-3">
              {/* Key Name */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-primary shadow-sm border border-primary/20">
                  <Key size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("Key Name")}
                  </p>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {apiKey.key_name}
                  </h3>
                </div>
              </div>

              {/* API Key Value Box */}
              <div className="relative mt-1 flex items-center justify-between rounded-md border border-border bg-background/50 px-3 py-2">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    {t("API Secret")}
                  </span>
                  <code className="text-sm font-mono text-foreground truncate">
                    {showKey
                      ? apiKey.api_key
                      : "********************************"}
                  </code>
                </div>
                {/* <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title={showKey ? t("Hide Key") : t("Show Key")}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => handleCopy(apiKey.api_key)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title={t("Copy Key")}
                    >
                      <Copy size={14} />
                    </button>
                    {copied && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1">
                        {t("Copied!")}
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-4">
            {/* Left Column: General Info */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Info size={16} className="text-primary" />
                {t("General Information")}
              </h4>

              <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
                {/* Created By */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User size={14} />
                    <span className="text-xs font-medium">
                      {t("Created By")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {apiKey.details?.created_by || "-"}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">
                      {t("Created Date")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatUserDateNice(apiKey.created_at)}
                  </span>
                </div>

                {/* Updated At - Only if present */}
                {apiKey.updated_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">
                        {t("Updated Date")}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatUserDateNice(apiKey.updated_at)}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText size={14} />
                    <span className="text-xs font-medium">
                      {t("Description")}
                    </span>
                  </div>
                  <p className="text-xs text-foreground bg-background rounded border border-border p-2 leading-relaxed">
                    {apiKey.details?.description ||
                      apiKey.description ||
                      t("No description provided.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Shield size={16} className="text-primary" />
                  {t("Permissions")}
                </h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                  {apiKey.permissions?.length || 0} {t("scopes")}
                </span>
              </div>

              <div className="rounded-lg border border-border bg-card/50 p-3 min-h-[40px]">
                {apiKey.permissions && apiKey.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {apiKey.permissions.map((perm, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium bg-primary/5 text-primary border border-primary/10"
                      >
                        <Check size={10} strokeWidth={3} />
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    {t("No specific permissions assigned.")}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Footer: Additional Metadata (Compact) - Excluding description */}
          {filteredDetails && Object.keys(filteredDetails).length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText size={12} />
                {t("Metadata")}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                {Object.entries(filteredDetails).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                      {key}
                    </span>
                    <span
                      className="text-xs font-semibold text-foreground truncate"
                      title={value}
                    >
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t("No details available.")}
        </div>
      )}
    </ViewModelBox>
  );
};

export default ViewApiKeyModal;
