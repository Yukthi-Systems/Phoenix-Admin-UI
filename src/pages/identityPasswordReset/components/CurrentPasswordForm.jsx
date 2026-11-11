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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyRound } from "lucide-react";
import { useResetIdentityPasswordWithCurrent } from "@/hooks/useIdentityPasswordReset";
import { currentPasswordSchema } from "../schemas";
import { getResetErrorMessage, normalizeEmail, toBase64Utf8 } from "../utils";
import { useRecaptcha, RecaptchaWidget } from "./Recaptcha";
import {
  ErrorBanner,
  PasswordField,
  SubmitButton,
  TextField,
} from "./FormBits";
import SuccessState from "./SuccessState";

const CurrentPasswordForm = ({ onComplete }) => {
  const mutation = useResetIdentityPasswordWithCurrent();
  const recaptcha = useRecaptcha();
  const [doneFor, setDoneFor] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(currentPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values) => {
    if (!recaptcha.token) return;
    const email = normalizeEmail(values.email);

    mutation.mutate(
      {
        email,
        current_password_base64: toBase64Utf8(values.current_password),
        new_password_base64: toBase64Utf8(values.new_password),
        recaptcha_token: recaptcha.token,
      },
      {
        onSuccess: () => {
          setDoneFor(email);
          onComplete?.();
        },
        onError: (error) => {
          if (error.status === 403) resetField("current_password");
        },
        // The token is single-use whatever the outcome
        onSettled: recaptcha.reset,
      },
    );
  };

  if (doneFor) return <SuccessState email={doneFor} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <ErrorBanner
        message={mutation.isError && getResetErrorMessage(mutation.error)}
      />

      <TextField
        id="email"
        label="Email address"
        type="email"
        placeholder="you@yourdomain.com"
        autoComplete="username"
        error={errors.email}
        registration={register("email")}
      />

      <PasswordField
        id="current_password"
        label="Existing password"
        autoComplete="current-password"
        error={errors.current_password}
        registration={register("current_password")}
      />

      <PasswordField
        id="new_password"
        label="New password"
        autoComplete="new-password"
        error={errors.new_password}
        registration={register("new_password", {
          // Show the next unmet rule while typing, not only after blur
          onChange: () => trigger(["new_password", "confirm_password"]),
        })}
      />

      <PasswordField
        id="confirm_password"
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirm_password}
        registration={register("confirm_password", {
          onChange: () => trigger("confirm_password"),
        })}
      />

      <RecaptchaWidget
        recaptcha={recaptcha}
        action="IDENTITY_PASSWORD_RESET_CURRENT"
      />

      <SubmitButton
        pending={mutation.isPending}
        disabled={!recaptcha.token}
        icon={KeyRound}
        label="Change password"
        pendingLabel="Changing password..."
      />
    </form>
  );
};

export default CurrentPasswordForm;
