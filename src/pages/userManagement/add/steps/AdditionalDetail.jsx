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

import { Controller } from "react-hook-form";
import { Input } from "@/components/common/Inputs";
import Select from "react-select";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { locales, timezones } from "@/utils/constants";
import { COUNTRIES } from "@/constants/countries";

const AdditionalDetailsStep = ({ register, errors, control }) => {
  return (
    <div className="space-y-6 text-left">
      {/* Personal Information */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground  text-left text-base font-medium">
          Personal Information
        </legend>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
          <Input
            label="First Name"
            name="user_details.first_name"
            placeholder="Enter first name"
            register={register}
            errors={errors}
            isRequired={true}
          />

          <Input
            label="Last Name"
            name="user_details.last_name"
            placeholder="Enter last name"
            register={register}
            errors={errors}
            isRequired={true}
          />

          <Input
            type="email"
            label="Alternate Email"
            name="user_details.other_email"
            placeholder="Enter alternate email"
            register={register}
            errors={errors}
          />
        </div>
      </fieldset>

      {/* Preferences */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground  text-left text-base font-medium">
          Preferences
        </legend>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Timezone Select */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Timezone <span className="text-red-500">*</span>
            </label>
            <Controller
              name="user_details.timezone"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  required
                  options={timezones}
                  value={
                    timezones.find((option) => option.value === field.value) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value || "")
                  }
                  placeholder="Select timezone"
                  styles={getReactSelectStyles()}
                  isClearable
                  isSearchable
                  name="user_details.timezone"
                />
              )}
            />
            {errors?.user_details?.timezone && (
              <p className="text-destructive mt-1 text-sm">
                {errors.user_details.timezone.message}
              </p>
            )}
          </div>

          {/* Locale Select */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium text-left">
              Locale
            </label>
            <Controller
              name="user_details.locale"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={locales}
                  value={
                    locales.find((option) => option.value === field.value) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value || "")
                  }
                  placeholder="Select locale"
                  styles={getReactSelectStyles()}
                  isClearable
                  isSearchable
                  name="user_details.locale"
                />
              )}
            />
            {errors?.user_details?.locale && (
              <p className="text-destructive mt-1 text-sm">
                {errors.user_details.locale.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Address Information */}
      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground  text-left text-base font-medium">
          Address Information
        </legend>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:grid-cols-2">
          <Input
            label="Address"
            name="user_details.address"
            placeholder="Enter address"
            register={register}
            errors={errors}
            customStyle="md:col-span-3"
          />

          <Input
            label="City"
            name="user_details.city"
            placeholder="Enter city"
            register={register}
            errors={errors}
          />

          <Input
            label="State / Province"
            name="user_details.state"
            placeholder="Enter state or province"
            register={register}
            errors={errors}
          />

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Country
            </label>
            <Controller
              name="user_details.country"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={COUNTRIES}
                  value={
                    COUNTRIES.find((option) => option.value === field.value) ||
                    null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value || "")
                  }
                  placeholder="Select country"
                  styles={getReactSelectStyles()}
                  isClearable
                  isSearchable
                  name="user_details.country"
                />
              )}
            />
            {errors?.user_details?.country && (
              <p className="text-destructive mt-1 text-sm">
                {errors.user_details.country.message}
              </p>
            )}
          </div>

          <Input
            label="Zip Code"
            name="user_details.zip_code"
            placeholder="Enter zip code"
            register={register}
            errors={errors}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default AdditionalDetailsStep;
