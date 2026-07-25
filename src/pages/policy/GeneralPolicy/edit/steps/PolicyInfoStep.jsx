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

import { Input } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import InfoBox from "@/components/common/InfoBox";

const PolicyInformationStep = ({
  register,
  errors,
  control,
  watch,
  domain_name,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Policy Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure basic policy details and activation status
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Domain:</span>
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-3 py-1 text-sm font-medium">
            {domain_name}
          </span>
        </div>

        <Input
          label="Policy Name"
          name="policy_name"
          placeholder="Enter policy name"
          isRequired
          register={register}
          errors={errors}
        />
      </div>

      {/* Activation Status */}
      <div className="space-y-4">
        <Switch
          control={control}
          name="is_active"
          register={register}
          watch={watch}
          errors={errors}
          falseLabel="Policy Inactive"
          falseSublabel="Policy will be disabled"
          trueLabel="Policy Active"
          trueSublabel="Policy will be enabled"
        />
      </div>

      {/* Info Box */}
      <InfoBox
        title="Policy Information"
        description="You can edit the policy details and toggle its activation state. Disabling a policy will stop its enforcement but keep it available for reactivation anytime."
      />
    </div>
  );
};

export default PolicyInformationStep;
