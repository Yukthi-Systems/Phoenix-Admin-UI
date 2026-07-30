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

import { Check, X, Info, AlertCircle } from "lucide-react";

const DomainPreviewStep = ({ formData, watch }) => {
  // Watch for dynamic values
  const enableHybridMode = watch("enable_hybrid_mode");
  const enableMaxPasswordAge = watch("enable_max_password_age");
  const spamDestination = watch("spam_destination");

  // Helper components
  const PreviewSection = ({ title, children, icon: Icon }) => (
    <div className="border-border rounded-lg border bg-card/50 p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const PreviewItem = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <span
        className={`text-right text-sm ${
          highlight
            ? "font-semibold text-primary"
            : "font-medium text-foreground"
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
          <X className="h-3 w-3" />
          {disabledText}
        </>
      )}
    </span>
  );

  const InfoBox = ({ children, type = "info" }) => {
    const styles = {
      info: "bg-primary/5 border-primary/20 text-primary",
      warning: "bg-warning/5 border-warning/20 text-warning",
    };

    return (
      <div
        className={`flex items-start gap-2 rounded-lg border p-3 ${styles[type]}`}
      >
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p className="text-xs">{children}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-lg font-semibold text-foreground">
          Review Configuration
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please review all settings before creating the domain
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* Domain Details Section */}
      <PreviewSection title="Domain Details" icon={AlertCircle}>
        <PreviewItem
          label="Domain Name"
          value={formData.domain_name}
          highlight={true}
        />

        <PreviewItem
          label="Status"
          value={
            <StatusBadge
              enabled={false}
              enabledText="Active"
              disabledText="Inactive until DNS verified"
            />
          }
        />
        <PreviewItem
          label="Description"
          value={formData.details?.description}
        />
        <PreviewItem label="Address" value={formData.details?.address} />
      </PreviewSection>

      {/* Domain Properties Section */}
      <PreviewSection title="Domain Properties" icon={Info}>
        <div className="space-y-4">
          {/* Hybrid Mode */}
          <div className="rounded-md bg-accent/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Hybrid Mode
              </span>
              <StatusBadge enabled={enableHybridMode} />
            </div>
            {enableHybridMode && (
              <div className="space-y-2 pl-3 border-l-2 border-primary/30">
                <PreviewItem
                  label="Description"
                  value={formData.hybrid_connector_properties?.description}
                />
                <PreviewItem
                  label="FQDN"
                  value={formData.hybrid_connector_properties?.fqdn}
                />
                <PreviewItem
                  label="IPv4"
                  value={formData.hybrid_connector_properties?.ipv4}
                />
                <PreviewItem
                  label="IPv6"
                  value={
                    formData.hybrid_connector_properties?.ipv6 ||
                    "Not specified"
                  }
                />
                <PreviewItem
                  label="Port"
                  value={
                    formData.hybrid_connector_properties?.port ||
                    "Not specified"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </PreviewSection>

      {/* Password Properties Section */}
      <PreviewSection title="Password & Session Properties" icon={Info}>
        <PreviewItem
          label="Session Timeout"
          value={
            formData.session_timeout
              ? `${formData.session_timeout} minutes`
              : "Not set"
          }
        />

        <div className="rounded-md bg-accent/30 p-3 mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Max Password Age
            </span>
            <StatusBadge enabled={enableMaxPasswordAge} />
          </div>
          {enableMaxPasswordAge && (
            <div className="space-y-2 pl-3 border-l-2 border-primary/30">
              <PreviewItem
                label="Max Age"
                value={
                  formData.max_password_age
                    ? `${formData.max_password_age} days`
                    : "Not set"
                }
              />
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Notifications:
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {[formData.notify_1, formData.notify_2, formData.notify_3]
                    .filter((n) => n !== undefined && n !== null)
                    .sort((a, b) => a - b)
                    .map((days, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {days} days before
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PreviewSection>

      {/* Spam Destination Properties Section */}
      <PreviewSection title="Spam & Templates" icon={Info}>
        <PreviewItem
          label="Spam Destination"
          value={spamDestination}
          highlight={true}
        />
        <PreviewItem
          label="Description"
          value={formData.spam_destination_properties?.description}
        />
        {spamDestination === "Folder" && (
          <PreviewItem
            label="Folder Name"
            value={formData.spam_destination_properties?.folder_name}
          />
        )}
        <PreviewItem
          label="Caution Template"
          value={
            formData.caution_id
              ? `Selected (ID: ${formData.caution_id})`
              : "Not selected"
          }
        />
        <PreviewItem
          label="Disclaimer Template"
          value={
            formData.disclaimer_id
              ? `Selected (ID: ${formData.disclaimer_id})`
              : "Not selected"
          }
        />
      </PreviewSection>

      {/* Summary Box */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-left">
              Ready to Create
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Domain{" "}
              <span className="font-semibold text-foreground">
                {formData.domain_name}
              </span>{" "}
              is configured and ready to be created. Click "Create Domain" to
              proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainPreviewStep;
