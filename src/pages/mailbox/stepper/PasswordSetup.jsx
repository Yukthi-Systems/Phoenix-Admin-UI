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

import { Input, PasswordInput } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import React from "react";

function PasswordSetup({ register, errors, watch, control }) {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Password Setup
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Set a secure password for the mailbox
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <PasswordInput
          register={register}
          isRequired
          errors={errors}
          name="password"
          placeholder="Enter secure password"
        />
        <Input
          type="password"
          label="Confirm Password"
          name="conform_password"
          placeholder="Re-enter password"
          isRequired
          register={register}
          errors={errors}
        />
        <div className="md:col-span-2">
          <Switch
            control={control}
            name="details.disable_password_expiration"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Password Expires"
            falseSublabel="Based on policy"
            trueLabel="Password Never Expires"
            trueSublabel="No expiration for this mailbox"
          />
        </div>
      </div>
    </div>
  );
}

export default PasswordSetup;
