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

import { Check, X, Info, AlertCircle, Shield } from "lucide-react";

const PreviewStep = ({
  formData,
  incomingDomains,
  incomingEmails,
  outgoingDomains,
  outgoingEmails,
}) => {
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
          <X className="h-3 w-3" />
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

  const ExceptionList = ({ items, type }) => {
    if (items.length === 0) {
      return (
        <div className="text-muted-foreground py-4 text-center">
          <p className="text-xs italic">No {type} exceptions added</p>
        </div>
      );
    }

    return (
      <div className="bg-muted/30 border-border max-h-32 overflow-y-auto rounded-md border p-3">
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="border-border bg-card text-foreground inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please review all settings before creating the general policy
        </p>
      </div>

      <InfoBox>
        Review all the information below carefully. You can go back to any step
        to make changes before submitting.
      </InfoBox>

      {/* Policy Information */}
      <PreviewSection title="Policy Information" icon={AlertCircle}>
        <PreviewItem
          label="Policy Name"
          value={formData.policy_name}
          highlight={true}
        />
        <PreviewItem label="Domain" value={formData.domain} />
        <PreviewItem
          label="Status"
          value={
            <StatusBadge
              enabled={formData.is_active}
              enabledText="Active"
              disabledText="Inactive"
            />
          }
        />
      </PreviewSection>

      {/* Blocking Settings */}
      <PreviewSection title="Blocking Settings" icon={Shield}>
        <div className="space-y-4">
          <div className="bg-accent/30 rounded-md p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                Incoming Emails
              </span>
              <StatusBadge
                enabled={formData.block_all_incoming_emails}
                enabledText="Blocked"
                disabledText="Allowed"
              />
            </div>
          </div>

          <div className="bg-accent/30 rounded-md p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                Outgoing Emails
              </span>
              <StatusBadge
                enabled={formData.block_all_outgoing_emails}
                enabledText="Blocked"
                disabledText="Allowed"
              />
            </div>
          </div>

          <PreviewItem
            label="Outgoing Size Limit"
            value={`${formData.outgoing_size_limit_mb} MB`}
          />
        </div>
      </PreviewSection>

      {/* Exception Lists */}
      <PreviewSection title="Exception Lists" icon={Info}>
        <div className="space-y-4">
          {/* Incoming Exceptions */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Incoming Exception Domains ({incomingDomains.length})
            </p>
            <ExceptionList items={incomingDomains} type="domain" />
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Incoming Exception Emails ({incomingEmails.length})
            </p>
            <ExceptionList items={incomingEmails} type="email" />
          </div>

          {/* Outgoing Exceptions */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Outgoing Exception Domains ({outgoingDomains.length})
            </p>
            <ExceptionList items={outgoingDomains} type="domain" />
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Outgoing Exception Emails ({outgoingEmails.length})
            </p>
            <ExceptionList items={outgoingEmails} type="email" />
          </div>
        </div>
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
              General policy{" "}
              <span className="text-foreground font-semibold">
                {formData.policy_name}
              </span>{" "}
              is configured and ready to be created. Click "Create General
              Policy" to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
