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
import { Switch } from "@/components/common/Switch";
import { RestrictionPolicyInfiniteSelectionField } from "@/components/common/infiniteSelectors/RestrictionPolicyInfiniteSelectionField";
import { DepartmentInfiniteSelectField } from "@/components/common/infiniteSelectors/DepartmentInfiniteSelectionField";
import { Input } from "@/components/common/Inputs";

function IdentityPoliciesStep({ register, errors, control, watch, organization_id, domain_name, isEdit }) {
  const is_mailbox_enabled = watch("is_mailbox_enabled");
  const is_files_enabled = watch("is_files_enabled");

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Policies & Access
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure restriction policy and department assignment for this identity
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="md:col-span-1">
          <RestrictionPolicyInfiniteSelectionField
            name="restriction_policy_id"
            label="Restriction Policy"
            control={control}
            errors={errors}
            url={`/policy/restrictions/list/${organization_id}?domain_name=${domain_name}`}
            organizationId={organization_id}
            placeholder="Select policy..."
          />
        </div>

        <div className="md:col-span-1">
          <DepartmentInfiniteSelectField
            name="department_id"
            label="Department"
            control={control}
            errors={errors}
            url={`/department/list/${organization_id}`}
            organizationId={organization_id}
            placeholder="Select department..."
          />
        </div>

        {/* Hide Services & Applications in Edit Mode */}
        {!isEdit && (
          <div className="md:col-span-2 border-t border-border pt-6 space-y-6">
            <h4 className="text-sm font-semibold text-foreground">Services & Applications</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Switch
                control={control}
                name="is_mailbox_enabled"
                register={register}
                watch={watch}
                errors={errors}
                falseLabel="Mailbox Disabled"
                trueLabel="Mailbox Enabled"
              />

              <Switch
                control={control}
                name="is_chat_enabled"
                register={register}
                watch={watch}
                errors={errors}
                falseLabel="Chat Disabled"
                trueLabel="Chat Enabled"
              />

              <Switch
                control={control}
                name="is_files_enabled"
                register={register}
                watch={watch}
                errors={errors}
                falseLabel="Files Disabled"
                trueLabel="Files Enabled"
              />
            </div>

            {(is_mailbox_enabled || is_files_enabled) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {is_mailbox_enabled && (
                  <Input
                    label="Mailbox Quota (GB)"
                    name="allocate_quota"
                    register={register}
                    errors={errors}
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter quota in GB"
                  />
                )}

                {is_files_enabled && (
                  <Input
                    label="Files Quota (GB)"
                    name="files_quota_allocated"
                    register={register}
                    errors={errors}
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter quota in GB"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IdentityPoliciesStep;
