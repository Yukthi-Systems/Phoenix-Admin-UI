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
import { InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";
import GetRestrictionPolicyName from "@/components/common/GetRestrictionPolicyName";
import GetDepartmentName from "@/components/common/GetDepartmentName";
import { User, ShieldCheck } from "lucide-react";

function IdentityPreviewStep({ formData, organization_id }) {
  const { watch } = formData;
  const email_prefix = watch("email_prefix") || "";
  const email_domain = watch("email_domain") || "";
  const first_name = watch("first_name") || "";
  const last_name = watch("last_name") || "";
  const primary_phone_number = watch("primary_phone_number") || "";
  const secondary_email = watch("secondary_email") || "";
  const restriction_policy_id = watch("restriction_policy_id") || "";
  const department_id = watch("department_id") || "";
  const is_enabled = watch("is_enabled") ?? true;
  const is_app_2fa_enabled = watch("is_app_2fa_enabled") ?? false;
  const is_sms_2fa_enabled = watch("is_sms_2fa_enabled") ?? false;
  const is_email_2fa_enabled = watch("is_email_2fa_enabled") ?? false;

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Review Identity Details
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please verify the information below before finalizing the creation of the E-Mail Identity
        </p>
      </div>

      <div className="mt-8 space-y-6 text-left">
        {/* General Details Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2 font-semibold text-foreground">
            <User className="h-5 w-5 text-primary" />
            <span>Profile & Account Details</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Email Address" value={`${email_prefix}@${email_domain}`} />
            <InfoItem label="Full Name" value={`${first_name} ${last_name}`.trim()} />
            <InfoItem label="Primary Phone" value={primary_phone_number} />
            <InfoItem label="Secondary Email" value={secondary_email || "--"} />
            <InfoItem label="Account Status" value={<StatusBadge status={is_enabled} />} />
          </div>
        </div>

        {/* Policies and Security Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Access Policies & 2FA Settings</span>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <InfoItem
                label="Restriction Policy"
                value={
                  restriction_policy_id ? (
                    <span className="text-foreground font-medium">
                      <GetRestrictionPolicyName
                        organization_id={organization_id}
                        id={restriction_policy_id}
                      />
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">None (No IP/Geo restrictions applied)</span>
                  )
                }
              />
            </div>

            <div>
              <InfoItem
                label="Department"
                value={
                  department_id ? (
                    <span className="text-foreground font-medium">
                      <GetDepartmentName
                        organization_id={organization_id}
                        id={department_id}
                      />
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Not assigned</span>
                  )
                }
              />
            </div>

            <div className="border-t border-border pt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Two-Factor Authentication Status
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                  <span className={`h-2.5 w-2.5 rounded-full ${is_app_2fa_enabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="text-sm font-medium text-foreground">App-Based 2FA: {is_app_2fa_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                  <span className={`h-2.5 w-2.5 rounded-full ${is_sms_2fa_enabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="text-sm font-medium text-foreground">SMS-Based 2FA: {is_sms_2fa_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                  <span className={`h-2.5 w-2.5 rounded-full ${is_email_2fa_enabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="text-sm font-medium text-foreground">Email-Based 2FA: {is_email_2fa_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentityPreviewStep;
