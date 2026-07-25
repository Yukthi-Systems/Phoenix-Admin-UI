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

import GetDistributionPolicyName from "@/components/common/GetDistributionPolicyName";
import GetForwardingPolicyName from "@/components/common/GetForwardingPolicyName";
import GetGeneralPolicyName from "@/components/common/GetGeneralPolicyName";
import { userInfoAtom } from "@/store/userInfo";
import { useAtomValue } from "jotai";
import React from "react";

const PreviewSection = ({ title, children }) => (
  <fieldset className="rounded-md border border-border p-6">
    <legend className="px-2 text-left text-base font-medium text-foreground">
      {title}
    </legend>
    <div>{children}</div>
  </fieldset>
);

const PreviewField = ({ label, value }) => (
  <div className="text-left">
    <label className="text-sm font-medium text-muted-foreground">{label}</label>
    <p className="text-foreground mt-1 text-sm">{value || "Not provided"}</p>
  </div>
);

export const MailboxPreview = ({ formData }) => {
  const watch = formData.watch;
  const { organization_id } = useAtomValue(userInfoAtom);

  return (
    <div className="space-y-6">
      {/* Mailbox Info */}
      <PreviewSection title="Mailbox Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PreviewField
            label="E-Mail Identity"
            value={watch("email_identity")}
          />
          <PreviewField
            label="Allocated Space"
            value={
              watch("allocate_quota")
                ? `${watch("allocate_quota")} GB`
                : "Not provided"
            }
          />
          <PreviewField
            label="Status"
            value={watch("enabled") ? "Enabled" : "Disabled"}
          />
        </div>
      </PreviewSection>

      {/* Mailbox Policies */}
      <PreviewSection title="Mailbox Policies">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PreviewField
            label="General Policy"
            value={
              watch("general_policy_id") ? (
                <GetGeneralPolicyName
                  organization_id={organization_id}
                  id={watch("general_policy_id")}
                />
              ) : (
                "None"
              )
            }
          />
          <PreviewField
            label="Distribution Policy"
            value={
              watch("distribution_policy_id") ? (
                <GetDistributionPolicyName
                  organization_id={organization_id}
                  id={watch("distribution_policy_id")}
                />
              ) : (
                "None"
              )
            }
          />
          <PreviewField
            label="Forwarding Policy"
            value={
              watch("forwarding_policy_id") ? (
                <GetForwardingPolicyName
                  organization_id={organization_id}
                  id={watch("forwarding_policy_id")}
                />
              ) : (
                "None"
              )
            }
          />
        </div>
      </PreviewSection>
    </div>
  );
};

export default MailboxPreview;

