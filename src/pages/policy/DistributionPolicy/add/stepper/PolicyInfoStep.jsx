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

import { Input, SelectField, TextArea } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";


export const ruleList = [
  {
    label: "Anyone can send mail to this mailbox",
    value: "ANYONE",
  },
  {
    label: "Any member of the group can send emails to the group's mailboxes",
    value: "GROUP_MEMBER",
  },
  {
    label: "Anyone within the domain is allowed to send emails.",
    value: "DOMAIN_MEMBER",
  },
  {
    label: "Specific users can send mail to this mailbox",
    value: "SPECIFIC_EMAILS",
  },
];

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

      {/* Basic Details */}
      <div className="space-y-4">
        {/* Domain Display as Badge */}
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
          isRequired
          register={register}
          errors={errors}
        />

        <TextArea
          customStyle="md:col-span-2 xl:col-span-3"
          label="Description"
          name="policy_description"
          placeholder="Enter policy description"
          // isRequired
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
          falseSublabel="Policy will be created but remain disabled"
          trueLabel="Policy Active"
          trueSublabel="Policy will be enabled immediately after creation"
        />
      </div>
    </div>
  );
};

export default PolicyInformationStep;
