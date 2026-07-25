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

import { useToastify } from "@/hooks/useToastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import { useForm } from "react-hook-form";
import { passwordValidationSchema } from "./validationSchema";
import EditModelBox from "@/components/common/EditModelBox";
import { userInfoAtom } from "@/store/userInfo";
import { useChangePassword } from "@/hooks/useUser";
import { Input, PasswordInput } from "@/components/common/Inputs";
import { SubmitButton } from "@/components/common/Buttons";

function ChangePassword({
  user_id,
  changePassword = false,
  closePassword = () => {},
  user_name = "",
}) {
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const { mutate, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset, // 1. Destructure reset here
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
      user_id: user_id,
    };

    mutate(
      { orgId: organization_id, data: data, userName: user_name },
      {
        onSuccess: () => {
          toast("success", "Password updated successfully");
          reset(); // 2. Call reset on success
          closePassword();
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
      handleCancel={closePassword}
      isOpen={changePassword}
      label="Change Password"
      outsideClick={false}
    >
      <div className="w-[40vw] max-h-[65vh] overflow-y-auto no-scrollbar">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto rounded-xl px-6 py-4 space-y-6 text-left"
        >
          <div className="space-y-4">
            <PasswordInput
              label="New Password"
              register={register}
              errors={errors}
              name="new_password"
              placeholder="Enter Password"
            />

            <Input
              type="password"
              label="Confirm New Password"
              name="confirm_new_password"
              register={register}
              placeholder="Confirm your password"
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
