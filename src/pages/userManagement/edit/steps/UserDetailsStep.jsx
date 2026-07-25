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
import PhoneInput from "@/components/common/PhoneInput";
import { Switch } from "@/components/common/Switch";
import UsernameInput from "@/components/common/UsernameInput";
import ProfilePicture from "@/pages/profile/ProfilePic";

const UserDetailsStep = ({
  register,
  errors,
  watch,
  user_details,
  user_id,
  organization_id,
  setValue,
  control,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">User Details</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Update basic user account information
        </p>
      </div>

      {/* Profile Picture */}
      {user_details && (
        <ProfilePicture
          displayName={user_details.display_name}
          userId={user_id}
          organizationId={organization_id}
          showUpload
          isActive={user_details.is_active}
        />
      )}

      {/* Account Information */}
      {/* <fieldset className="border-border rounded-md border p-6"> */}
      <legend className="text-foreground  text-left text-base font-medium">
        Account Information
      </legend>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UsernameInput
          label="User Name"
          name="user_name"
          placeholder="Enter a unique username"
          register={register}
          errors={errors}
          watch={watch}
          originalUsername={user_details?.user_name}
          isRequired={true}
        />

        <Input
          label="Display Name"
          name="display_name"
          placeholder="Enter your display name"
          register={register}
          errors={errors}
          isRequired={true}
        />

        <Input
          type="email"
          label="Email"
          name="user_email"
          placeholder="Enter your email address"
          register={register}
          errors={errors}
          isRequired={true}
        />

        <PhoneInput
          label="Phone number with country code"
          name="primary_phone"
          placeholder="1234567890"
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isRequired={true}
        />
        {/* <Input
            label="Phone number with country code"
            name="primary_phone"
            placeholder="+91XXXXXXXXXX"
            register={register}
            errors={errors}
            isRequired={true}
          /> */}
      </div>
      {/* </fieldset> */}
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
    </div>
  );
};

export default UserDetailsStep;
