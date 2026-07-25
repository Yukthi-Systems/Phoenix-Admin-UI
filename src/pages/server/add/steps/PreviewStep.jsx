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

import { Check, Server, HardDrive, Network, Info } from "lucide-react";

const PreviewStep = ({ formData }) => {
  // Helper components
  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border bg-card/50 rounded-lg border p-5">
      <div className="border-border mb-4 flex items-center gap-2 border-b pb-3">
        {Icon && <Icon className="text-primary h-5 w-5" />}
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const PreviewItem = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground text-sm font-medium">
        {label}:
      </span>
      <span
        className={`text-right text-sm ${
          highlight
            ? "text-primary font-semibold"
            : "text-foreground font-medium"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  );

  const StatusBadge = ({
    enabled,
    enabledText = "Enabled",
    disabledText = "Disabled",
  }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        enabled
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {enabled ? (
        <>
          <Check className="h-3 w-3" />
          {enabledText}
        </>
      ) : (
        <>
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {disabledText}
        </>
      )}
    </span>
  );

  const InfoBox = ({ children }) => (
    <div className="border-primary/20 bg-primary/5 text-primary flex items-start gap-2 rounded-lg border p-3">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all settings before creating the mail server
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* Host Configuration */}
      <PreviewSection title="Host Configuration" icon={Server}>
        <PreviewItem
          label="Host Name"
          value={formData.host_name}
          highlight={true}
        />
        <PreviewItem
          label="Allocated Quota"
          value={
            formData.quota_allocated ? `${formData.quota_allocated} GB` : "-"
          }
        />
        <PreviewItem label="SMTP Port" value={formData.smtp_port} />
        <PreviewItem label="Storage Path" value={formData.storage_path} />

        <PreviewItem
          label="Server Status"
          value={
            <StatusBadge
              enabled={formData.is_active}
              enabledText="Active"
              disabledText="Inactive"
            />
          }
        />
        <PreviewItem
          label="Monitoring Only"
          value={
            <StatusBadge
              enabled={formData.is_monitoring}
              enabledText="Yes"
              disabledText="No"
            />
          }
        />
        <PreviewItem
          label="Mailbox Server"
          value={
            <StatusBadge
              enabled={formData.is_mailbox_server}
              enabledText="Yes"
              disabledText="No"
            />
          }
        />
        <PreviewItem
          label="Accepting New Mailboxes"
          value={
            <StatusBadge
              enabled={formData.is_accepting_new_mailboxes}
              enabledText="Yes"
              disabledText="No"
            />
          }
        />
      </PreviewSection>

      {/* Server Information */}
      <PreviewSection title="Server Information" icon={HardDrive}>
        <PreviewItem
          label="Description"
          value={formData.server_info?.description}
        />
        <PreviewItem label="Location" value={formData.server_info?.location} />
        <PreviewItem
          label="Operating System"
          value={formData.server_info?.os}
        />
      </PreviewSection>

      {/* Network Information */}
      <PreviewSection title="Network Information" icon={Network}>
        <PreviewItem label="IPv4 Address" value={formData.server_info?.ipv4} />
        <PreviewItem
          label="IPv6 Address"
          value={formData.server_info?.ipv6 || "Not configured"}
        />
      </PreviewSection>

      {/* Summary Box */}
      <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Check className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="text-foreground font-semibold">Ready to Create</h4>
            <p className="text-muted-foreground mt-1 text-sm">
              Mail server{" "}
              <span className="text-foreground font-semibold">
                {formData.host_name}
              </span>{" "}
              is configured with {formData.quota_allocated} GB quota at{" "}
              <span className="text-foreground font-semibold">
                {formData.server_info?.location || "specified location"}
              </span>
              . The server will be {formData.is_active ? "active" : "inactive"}{" "}
              after creation. Click "Create Server" to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
