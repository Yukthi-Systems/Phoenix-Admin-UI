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

import React, { useEffect } from "react";
import { locales, timezones } from "@/utils/constants";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue, useSetAtom } from "jotai";
import { useToastify } from "@/hooks/useToastify";
import { useUpdateUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import { yupResolver } from "@hookform/resolvers/yup";
import EditModelBox from "@/components/common/EditModelBox";
import { Input } from "@/components/common/Inputs";
import { SubmitButton } from "@/components/common/Buttons";
import { userEditDefaultValue } from "../userManagement/add/userDefaultValues";
import { userEditFormSchema } from "../userManagement/edit/validationSchema";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { COUNTRIES } from "@/constants/countries";
import PhoneInput from "@/components/common/PhoneInput";

function EditProfile({ editProfile = false, setEditProfile = () => { } }) {
  const userDetails = useAtomValue(userProfileAtom);
  // organization_id comes off the user's own profile, matching the key
  // FullLayout.jsx fetches the "profile" query under - not
  // userInfoAtom.organization_id, which tracks whatever org is currently
  // browsed via the top org switcher.
  const { organization_id } = userDetails || {};
  const toast = useToastify();
  const { mutate, isPending } = useUpdateUser();
  const queryProfile = useQueryClient();
  const setProfile = useSetAtom(userProfileAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: userEditDefaultValue,
    resolver: yupResolver(userEditFormSchema),
  });

  const timezoneOptions = timezones;
  const localeOptions = locales;
  const selectStyles = getReactSelectStyles();

  const onSubmit = (formData) => {
    const data = { ...formData };

    const queryParams = {
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      primary_phone: data.primary_phone,
      display_name: data.display_name,
      is_active: true,
      is_mail_updated: data.user_email !== (userDetails?.user_email || ""),
      is_phone_updated:
        data.primary_phone !== (userDetails?.primary_phone || ""),
    };

    Object.keys(queryParams).forEach((key) => delete data[key]);

    mutate(
      { orgId: organization_id, body: data?.user_details, queryParams },
      {
        onSuccess: async () => {
          await queryProfile.invalidateQueries({
            queryKey: ["profile", userDetails?.user_id, organization_id],
          });

          const freshProfile = queryProfile.getQueryData([
            "profile",
            userDetails?.user_id,
            organization_id,
          ]);

          if (freshProfile) {
            setProfile(freshProfile?.user_details || null);
          }

          toast("success", "Successfully updated user");
          setEditProfile(false);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
          console.error(error);
        },
      },
    );
  };

  useEffect(() => {
    if (userDetails) {
      reset({
        user_id: userDetails?.user_id || "",
        user_name: userDetails?.user_name || "",
        user_email: userDetails?.user_email || "",
        primary_phone: userDetails?.primary_phone || "",
        display_name: userDetails?.display_name || "",
        user_details: {
          first_name: userDetails?.user_details?.first_name || "",
          last_name: userDetails?.user_details?.last_name || "",
          other_email: userDetails?.user_details?.other_email || "",
          address: userDetails?.user_details?.address || "",
          city: userDetails?.user_details?.city || "",
          state: userDetails?.user_details?.state || "",
          country: userDetails?.user_details?.country || "",
          zip_code: userDetails?.user_details?.zip_code || "",
          timezone: userDetails?.user_details?.timezone || "",
          locale: userDetails?.user_details?.locale || "",
        },
      });
    }
  }, [userDetails, reset]);

  return (
    <EditModelBox
      handleCancel={() => setEditProfile(false)}
      isOpen={editProfile}
      label="Edit Profile"
    >
      <div className="no-scrollbar h-[71vh] w-[65vw] overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto space-y-5 rounded-xl px-5 py-2 text-left"
        >
          {/* Account Information */}
          <fieldset className="border-border rounded-md border p-6">
            <legend className="text-card-foreground text-lg font-semibold">
              Account Information
            </legend>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="User Name"
                name="user_name"
                placeholder="Enter username"
                register={register}
                errors={errors}
                isRequired
              />
              <Input
                label="Display Name"
                name="display_name"
                placeholder="Enter display name"
                register={register}
                errors={errors}
                isRequired
              />
              <Input
                type="email"
                label="Primary Email"
                name="user_email"
                placeholder="Enter email address"
                register={register}
                errors={errors}
                isRequired
              />
              <PhoneInput
                setValue={setValue}
                label="Phone Number"
                watch={watch}
                name="primary_phone"
                placeholder="Enter phone number"
                register={register}
                errors={errors}
                isRequired
              />
            </div>
          </fieldset>

          {/* Personal Details */}
          <fieldset className="border-border rounded-md border p-6">
            <legend className="text-card-foreground text-lg font-semibold">
              Personal Details
            </legend>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="user_details.first_name"
                placeholder="Enter first name"
                register={register}
                errors={errors}
                isRequired
              />
              <Input
                label="Last Name"
                name="user_details.last_name"
                placeholder="Enter last name"
                register={register}
                errors={errors}
                isRequired
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

          {/* Location Information */}
          <fieldset className="border-border rounded-md border p-6">
            <legend className="text-card-foreground text-lg font-semibold">
              Location Information
            </legend>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Street Address"
                name="user_details.address"
                placeholder="Enter street address"
                register={register}
                errors={errors}
                customStyle="md:col-span-2"
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
              <div className="w-full text-left">
                <label className="text-card-foreground mb-1 block text-sm font-medium">
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
                        COUNTRIES.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value || "")
                      }
                      placeholder="Select country"
                      styles={selectStyles}
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
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
                label="Zip / Postal Code"
                name="user_details.zip_code"
                placeholder="Enter zip/postal code"
                register={register}
                errors={errors}
              />
            </div>
          </fieldset>

          {/* Regional Settings */}
          <fieldset className="border-border rounded-md border p-6">
            <legend className="text-card-foreground text-lg font-semibold">
              Regional Settings
            </legend>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full text-left">
                <label className="text-card-foreground mb-1 block text-sm font-medium">
                  Timezone
                </label>
                <Controller
                  name="user_details.timezone"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={
                        timezoneOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) =>
                        field.onChange(selected?.value || "")
                      }
                      options={timezoneOptions}
                      placeholder="Select timezone..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  )}
                />
                {errors?.user_details?.timezone && (
                  <p className="text-destructive mt-1 text-sm">
                    {errors.user_details.timezone.message}
                  </p>
                )}
              </div>

              <div className="w-full text-left">
                <label className="text-card-foreground mb-1 block text-sm font-medium">
                  Locale
                </label>
                <Controller
                  name="user_details.locale"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={
                        localeOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) =>
                        field.onChange(selected?.value || "")
                      }
                      options={localeOptions}
                      placeholder="Select locale..."
                      isClearable
                      isSearchable
                      styles={selectStyles}
                      menuPortalTarget={document.body}
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

          <div className="text-center pb-2">
            <SubmitButton label="Update Profile" isPending={isPending} />
          </div>
        </form>
      </div>
    </EditModelBox>
  );
}

export default EditProfile;
