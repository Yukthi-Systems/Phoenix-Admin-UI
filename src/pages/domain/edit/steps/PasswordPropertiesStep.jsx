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
import ReactSelect from "@/components/common/Dropdown";

const PasswordPropertiesStep = ({ register, errors, control, watch }) => {
  const enableMaxPasswordAge = watch("enable_max_password_age");
  const maxPasswordAge = watch("max_password_age");

  const sessionTimeoutOptions = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 240, label: "4 hours" },
    { value: 360, label: "6 hours" },
    { value: 480, label: "8 hours" },
    { value: 720, label: "12 hours" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Password Properties
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure password aging policies and session timeout settings
        </p>
      </div>

      {/* <fieldset className="border-border rounded-md border p-6"> */}
      {/* <legend className="text-foreground  text-left text-base font-medium">
        Session Management
      </legend> */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <ReactSelect
              control={control}
              name="session_timeout"
              label="Session Timeout"
              options={sessionTimeoutOptions}
              errors={errors}
              placeholder="Select session timeout..."
              required={true}
            />
            <div className="flex items-center">
              <p className="text-muted-foreground text-left text-sm">
                User sessions will automatically expire after the selected
                duration
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* </fieldset> */}

      <fieldset className="border-border rounded-md border p-6">
      <legend className="text-foreground  text-left text-base font-medium">
        Password Age Restrictions
      </legend>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Switch
            control={control}
            name="enable_max_password_age"
            register={register}
            watch={watch}
            errors={errors}
            falseLabel="Max Password Age Disabled"
            falseSublabel="No password age restrictions will be applied"
            trueLabel="Max Password Age Enabled"
            trueSublabel="Password age restrictions will be enforced"
          />
        </div>

        {enableMaxPasswordAge && (
          <div className="bg-accent/30 border-accent rounded-lg border p-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                type="number"
                label="Max Password Age (days)"
                name="max_password_age"
                placeholder="90"
                register={register}
                errors={errors}
                isRequired={true}
                min={3}
                max={365}
              />

              <Input
                type="number"
                label="Notify 1 (days before expiry)"
                name="notify_1"
                placeholder="2"
                register={register}
                errors={errors}
                isRequired={true}
                min={2}
                max={maxPasswordAge ? maxPasswordAge - 1 : 364}
              />

              <Input
                type="number"
                label="Notify 2 (days before expiry)"
                name="notify_2"
                placeholder="5"
                register={register}
                errors={errors}
                isRequired={true}
                min={2}
                max={maxPasswordAge ? maxPasswordAge - 1 : 364}
              />

              <Input
                type="number"
                label="Notify 3 (days before expiry)"
                name="notify_3"
                placeholder="9"
                register={register}
                errors={errors}
                isRequired={true}
                min={2}
                max={maxPasswordAge ? maxPasswordAge - 1 : 364}
              />
            </div>
          </div>
        )}
      </div>
      </fieldset>
    </div>
  );
};

export default PasswordPropertiesStep;
