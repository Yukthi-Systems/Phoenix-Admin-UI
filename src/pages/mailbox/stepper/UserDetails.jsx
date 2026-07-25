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
import { EmailIdentityInfiniteSelectionField } from "@/components/common/infiniteSelectors/EmailIdentityInfiniteSelectionField";

function UserDetails({
  register,
  errors,
  domain_name,
  isEdit = false,
  control,
  watch,
  existingMailboxEmails = [],
}) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Mailbox Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Select an existing E-Mail Identity and configure details for this mailbox
        </p>
      </div>

      <div className="mt-8 form-grid">
        <div className="md:col-span-1">
          <EmailIdentityInfiniteSelectionField
            control={control}
            name="email_identity"
            label="E-Mail Identity"
            errors={errors}
            domain_name={domain_name}
            placeholder="Search and select E-Mail Identity"
            existingMailboxEmails={existingMailboxEmails}
          />
        </div>

        <Input
          type="number"
          label="Allocate Space (GB)"
          name="allocate_quota"
          placeholder="0.1"
          min={0.1}
          step={0.01}
          info="Minimum: 0.1 GB (100 MB)"
          register={register}
          errors={errors}
          isRequired={true}
        />

        <div className="md:col-span-2 2xl:col-span-3">
          <Switch
            control={control}
            name="enabled"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Disabled"
            falseSublabel="Mailbox will be inactive"
            trueLabel="Enabled"
            trueSublabel="Mailbox will be active"
          />
        </div>
      </div>
    </div>
  );
}

export default UserDetails;