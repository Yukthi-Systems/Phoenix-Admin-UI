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
import PhoneInput from "@/components/common/PhoneInput";
import { Switch } from "@/components/common/Switch";
import UsernameInput from "@/components/common/UsernameInput";

const UserDetailsStep = ({ register, errors, control, watch, setValue }) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">User Details</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure basic user account information and credentials
        </p>
      </div>

      {/* Account Information */}
      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground text-left text-base font-medium">
        Account Information
      </legend>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <UsernameInput
          label="User Name"
          name="user_name"
          placeholder="Enter a unique username"
          register={register}
          errors={errors}
          watch={watch}
          isRequired={true}
        />

        <Input
          label="Display Name"
          name="display_name"
          placeholder="Enter display name"
          register={register}
          errors={errors}
          isRequired={true}
        />

        <Input
          type="email"
          label="Email Address"
          name="user_email"
          placeholder="Enter email address"
          register={register}
          errors={errors}
          isRequired={true}
        />
        <PhoneInput
          label="Phone Number"
          name="primary_phone_number_with_country_code"
          placeholder="1234567890"
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isRequired={true}
        />
        {/* <Input
            label="Phone Number"
            name="primary_phone_number_with_country_code"
            placeholder="+91XXXXXXXXXX"
            register={register}
            errors={errors}
            isRequired={true}
          /> */}
      </div>
      </fieldset>

      {/* Security */}
      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground  text-left text-base font-medium">
        Security
      </legend>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PasswordInput
          name="password"
          register={register}
          errors={errors}
          placeholder="Enter password"
          isRequired={true}
        />

        <Input
          type="password"
          label="Confirm Password"
          name="confirm_password"
          placeholder="Re-enter password"
          register={register}
          errors={errors}
          isRequired={true}
        />
      </div>
      </fieldset>

      
      <div className="">
        <Switch
          control={control}
          name="activate"
          register={register}
          watch={watch}
          errors={errors}
          falseLabel="User Inactive"
          falseSublabel="User will be created but remain disabled"
          trueLabel="User Active"
          trueSublabel="User will be enabled immediately after creation"
        />
      </div>
   

      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              Username Requirements
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Username must be unique and cannot be changed after creation.
              Choose carefully!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsStep;
