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

import { Input, TextArea } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import InfoBox from "@/components/common/InfoBox";

const PolicyDetailsStep = ({
  register,
  errors,
  control,
  watch,
  domain_name,
}) => {
  const hasSizeLimit = watch("has_size_limit");
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Policy Details
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure attachment policy settings and size limits
        </p>
      </div>

      <div className="space-y-4">
        {/* Domain Display */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Domain:</span>
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium">
            {domain_name}
          </span>
        </div>

        {/* Policy Name Input */}
        <Input
          label="Policy Name"
          name="policy_name"
          placeholder="Enter policy name"
          register={register}
          errors={errors}
          isRequired
        />

        {/* Policy Description */}
        <TextArea
          label="Policy Description"
          name="policy_description"
          placeholder="Enter a brief description of this policy"
          register={register}
          errors={errors}
          rows={3}
        />

        <div className="space-y-4">
          <Switch
            control={control}
            name="has_size_limit"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Unlimited Size"
            falseSublabel="No size limit enforced on attachments"
            trueLabel="Set Size Limit"
            trueSublabel="Restrict maximum attachment size"
          />

          {hasSizeLimit && (
            <Input
              label="Maximum Attachment Size (MB)"
              name="max_attachment_size_mb"
              type="number"
              placeholder="Enter maximum size in MB"
              register={register}
              errors={errors}
              isRequired
              min={1}
              max={100}
            />
          )}
        </div>
      </div>

      {/* Policy Configuration */}
      <div className="space-y-8">
        <Switch
          control={control}
          name="is_active"
          register={register}
          watch={watch}
          errors={errors}
          falseLabel="Policy Inactive"
          falseSublabel="Policy is disabled"
          trueLabel="Policy Active"
          trueSublabel="Policy is enabled and running"
        />
      </div>

      {/* Info Box */}
      <InfoBox
        title="Important Note"
        description="The maximum attachment size applies to individual file attachments. Total email size may be calculated differently by the mail server. Configure allowed and blocked file types in the next step."
      />
    </div>
  );
};

export default PolicyDetailsStep;
