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

// TEMPORARY: landing page for the emailed reset link
// (template `password_reset_link` in V3-Notifications-Worker), which points at
// /reset/link?s=<base64url of {"email","secret"}> (see decodeResetLinkParam).
// The other methods live in /reset/admin's Email Identity tab.
//
// Both values come from the link, so the user only types the new password.
// The backend needs the email to find the secret (it's cached per address).

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyRound, LinkIcon, Unlink, Send } from "lucide-react";
import { useCompleteIdentityPasswordResetLink } from "@/hooks/useIdentityPasswordReset";
import ResetShell from "./components/ResetShell";
import SuccessState from "./components/SuccessState";
import {
  ErrorBanner,
  PasswordField,
  SubmitButton,
} from "./components/FormBits";
import { completeLinkSchema, isValidEmail } from "./schemas";
import {
  decodeResetLinkParam,
  getResetErrorMessage,
  toBase64Utf8,
} from "./utils";

// Secrets are 6 chars from an unambiguous uppercase alphabet (no I/O/0/1)
const SECRET_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

const DeadLink = ({ title, message }) => {
  const navigate = useNavigate();
  return (
    <ResetShell icon={Unlink} title={title}>
      <div className="space-y-5">
        <p className="text-muted-foreground text-center text-sm">{message}</p>
        <button
          type="button"
          onClick={() => navigate("/reset/admin?mode=identity&method=link")}
          className="cosmic-button bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all"
        >
          <Send className="h-4 w-4" />
          Request a new link
        </button>
      </div>
    </ResetShell>
  );
};

const ResetLink = () => {
  const [searchParams] = useSearchParams();
  const { email = "", secret = "" } =
    decodeResetLinkParam(searchParams.get("s")) || {};
  const mutation = useCompleteIdentityPasswordResetLink();
  const [doneFor, setDoneFor] = useState(null);
  // Set once the backend has rejected/consumed the link - it can't be retried
  const [deadReason, setDeadReason] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(completeLinkSchema),
    mode: "onTouched",
    defaultValues: { new_password: "", confirm_password: "" },
  });

  if (!SECRET_PATTERN.test(secret) || !isValidEmail(email)) {
    return (
      <DeadLink
        title="Invalid reset link"
        message="This link is incomplete or malformed. Make sure you opened the full link from the email, or request a new one."
      />
    );
  }

  if (deadReason) {
    return <DeadLink title="This link can't be used" message={deadReason} />;
  }

  if (doneFor) {
    return (
      <ResetShell icon={KeyRound} title="All done">
        <SuccessState email={doneFor} />
      </ResetShell>
    );
  }

  const onSubmit = (values) => {
    mutation.mutate(
      {
        email,
        secret,
        new_password_base64: toBase64Utf8(values.new_password),
      },
      {
        onSuccess: () => setDoneFor(email),
        onError: (error) => {
          // Any 400/422 means this link can't be used again:
          // - 400 "expired or not requested": nothing cached (expired/used)
          // - 400 "Invalid OTP": replaced by a newer link; backend deletes it
          // - 422 breached password: checked AFTER the secret was deleted
          // Network errors / 5xx keep the form up so the user can retry.
          if (error.status === 422) {
            setDeadReason(
              `${error.message} For security, this link has now been used up. Request a new one and pick a different password.`,
            );
          } else if (error.status === 400) {
            setDeadReason(
              "This link has expired, was already used, or was replaced by a newer link. Request a new link to try again.",
            );
          }
        },
      },
    );
  };

  return (
    <ResetShell
      icon={LinkIcon}
      title="Set a new password"
      subtitle="Choose a new password for your email account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <ErrorBanner
          message={mutation.isError && getResetErrorMessage(mutation.error)}
        />

        <div className="bg-muted/40 border-border/60 rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-xs">Account</p>
          <p className="text-card-foreground text-sm font-medium break-all">
            {email}
          </p>
          {/* Lets password managers attach the new password to this account */}
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={email}
            readOnly
            hidden
          />
        </div>

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

        <p className="text-muted-foreground text-xs">
          This link works only once. If anything goes wrong you&apos;ll need to
          request a new one.
        </p>

        <SubmitButton
          pending={mutation.isPending}
          icon={KeyRound}
          label="Set new password"
          pendingLabel="Saving..."
        />
      </form>
    </ResetShell>
  );
};

export default ResetLink;
