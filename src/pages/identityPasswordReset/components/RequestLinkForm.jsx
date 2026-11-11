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
import { MailCheck, Send, RotateCcw } from "lucide-react";
import { useRequestIdentityPasswordResetLink } from "@/hooks/useIdentityPasswordReset";
import { requestLinkSchema } from "../schemas";
import { getResetErrorMessage, normalizeEmail } from "../utils";
import { useRecaptcha, RecaptchaWidget } from "./Recaptcha";
import { ErrorBanner, LinkButton, SubmitButton, TextField } from "./FormBits";

const RequestLinkForm = () => {
  const mutation = useRequestIdentityPasswordResetLink();
  const recaptcha = useRecaptcha();
  const [sentTo, setSentTo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(requestLinkSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = (values) => {
    if (!recaptcha.token) return;
    const email = normalizeEmail(values.email);

    mutation.mutate(
      { email, recaptcha_token: recaptcha.token },
      {
        onSuccess: () => setSentTo(email),
        onSettled: recaptcha.reset,
      },
    );
  };

  if (sentTo) {
    return (
      <div className="space-y-5 text-center">
        <div className="bg-success/10 border-success/20 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border">
          <MailCheck className="text-success h-7 w-7" />
        </div>
        <div className="space-y-1">
          <p className="text-card-foreground text-lg font-semibold">
            Check your inbox
          </p>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to
          </p>
          <p className="text-card-foreground text-sm font-medium break-all">
            {sentTo}
          </p>
        </div>
        <ul className="text-muted-foreground bg-muted/40 border-border/60 space-y-1.5 rounded-lg border p-3 text-left text-sm">
          <li>• The link works only once and expires in 5 minutes.</li>
          <li>• Requesting another link cancels this one.</li>
          <li>• Not there? Check your spam or junk folder.</li>
        </ul>
        <LinkButton
          icon={RotateCcw}
          onClick={() => {
            mutation.reset();
            setSentTo(null);
          }}
        >
          Send another link
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <ErrorBanner
        message={mutation.isError && getResetErrorMessage(mutation.error)}
      />

      <p className="text-muted-foreground text-sm">
        We&apos;ll email a one-time reset link to this address. Open it from a
        device where you&apos;re still signed in to your mail.
      </p>

      <TextField
        id="email"
        label="Email address"
        type="email"
        placeholder="you@yourdomain.com"
        autoComplete="username"
        error={errors.email}
        registration={register("email")}
      />

      <RecaptchaWidget
        recaptcha={recaptcha}
        action="IDENTITY_PASSWORD_RESET_LINK"
      />

      <SubmitButton
        pending={mutation.isPending}
        disabled={!recaptcha.token}
        icon={Send}
        label="Email me a reset link"
        pendingLabel="Sending link..."
      />
    </form>
  );
};

export default RequestLinkForm;
