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

import React from "react";
import EditModelBox from "@/components/common/EditModelBox";
import { useToastify } from "@/hooks/useToastify";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Input, PasswordInput } from "@/components/common/Inputs";
import { SubmitButton } from "@/components/common/Buttons";
import { userProfileAtom } from "@/store/userProfile";
import { useChangePassword } from "@/hooks/useUser";
import { passwordValidationSchema } from "./validationSchema";

function ChangePassword({
  changePassword = false,
  setChangePassword = () => {},
}) {
  const userDetails = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      new_password: "",
      confirm_new_password: "",
    },
    resolver: yupResolver(passwordValidationSchema),
  });

  const onSubmit = (formData) => {
    const data = {
      password: btoa(formData.new_password),
      user_id: userDetails?.user_id,
    };

    mutate(
      { orgId: organization_id, data: data },
      {
        onSuccess: () => {
          toast("success", "Password updated successfully");
          setChangePassword(false);
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

  return (
    <EditModelBox
      handleCancel={() => setChangePassword(false)}
      isOpen={changePassword}
      label="Change Password"
    >
      <div className="w-[40vw] max-h-[65vh] overflow-y-auto no-scrollbar">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto rounded-xl px-6 py-4 space-y-6 text-left"
        >
          <div className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              register={register}
              errors={errors}
              name="new_password"
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              name="confirm_new_password"
              register={register}
              errors={errors}
            />
          </div>

          <div className="flex justify-center pt-4">
            <SubmitButton label="Change Password" isPending={isPending} />
          </div>
        </form>
      </div>
    </EditModelBox>
  );
}

export default ChangePassword;
