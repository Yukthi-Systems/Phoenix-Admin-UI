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

import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Reaptcha from "react-google-recaptcha";
import { RECAPTCHA_SITE_KEY } from "@/constants/constants";
import { ArrowLeft, Loader, Mail, KeyRound } from "lucide-react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { themeAtom } from "@/store/theme";
import { useToastify } from "@/hooks/useToastify";
import { useInitiatePasswordResetIdentity } from "@/hooks/usePasswordReset";
import * as yup from "yup";
import { emailDotsTest } from "@/utils/emailValidation";
import IdentityMethodPicker from "./IdentityMethodPicker";

const initiateSchema = yup.object({
  email_id: yup
    .string()
    .required("Identity email is required")
    .email("Please enter a valid email address")
    .test(...emailDotsTest),
  verify_via: yup
    .string()
    .oneOf(["email", "phone"], "Please select a verification method")
    .required("Verification method is required"),
});

const Step1InitiateIdentityReset = ({
  onSuccess,
  initialEmailId = "",
  initialVerifyVia = "email",
  // Called when a non-OTP method (current password / email link) is picked
  onSwitchMethod,
}) => {
  const [verifyMethod, setVerifyMethod] = useState(initialVerifyVia);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const theme = useAtomValue(themeAtom);
  const navigate = useNavigate();
  const toast = useToastify();
  const recaptchaRef = useRef();
  const initiateResetMutation = useInitiatePasswordResetIdentity();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(initiateSchema),
    mode: "onChange",
    defaultValues: {
      email_id: initialEmailId,
      verify_via: initialVerifyVia,
    },
  });

  const watchedVerifyVia = watch("verify_via");

  useEffect(() => {
    setVerifyMethod(watchedVerifyVia);
  }, [watchedVerifyVia]);

  useEffect(() => {
    if (initiateResetMutation.isError) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  }, [initiateResetMutation.isError]);

  const onRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    if (errors.recaptcha) {
      setError("recaptcha", { type: "manual", message: "" });
    }
  };

  const onRecaptchaExpire = () => {
    setRecaptchaToken(null);
    toast("warning", "Security check expired. Please verify again.");
  };

  const onRecaptchaError = () => {
    setRecaptchaToken(null);
    setError("recaptcha", {
      type: "manual",
      message: "Security verification failed. Please try again.",
    });
  };

  const onSubmit = async (data) => {
    if (!recaptchaToken) {
      setError("recaptcha", {
        type: "manual",
        message: "Please complete the security verification",
      });
      return;
    }

    initiateResetMutation.mutate(
      {
        email_id: data.email_id,
        verify_via: data.verify_via,
        recaptcha_token: recaptchaToken,
      },
      {
        onSuccess: () => {
          toast(
            "success",
            `OTP sent to the identity's ${data.verify_via === "email" ? "secondary email" : "registered phone number"}`,
          );
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
          onSuccess({
            email_id: data.email_id,
            verify_via: data.verify_via,
          });
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to send OTP";
          const tracebackId = error.response?.data?.traceback_id;

          recaptchaRef.current?.reset();
          setRecaptchaToken(null);

          toast(
            "error",
            `${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2 text-center">
        <div className="bg-primary/10 border-primary/20 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border">
          <KeyRound className="text-primary h-6 w-6" />
        </div>
        <h2 className="text-card-foreground text-2xl font-semibold">
          Reset Identity Password
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose how to reset, then enter the email identity's address
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Reset method: email/phone stay in this OTP flow, the others
            hand off to their own single-step forms */}
        <IdentityMethodPicker
          value={verifyMethod}
          onChange={(method) => {
            if (method === "email" || method === "phone") {
              setValue("verify_via", method, { shouldValidate: true });
            } else {
              onSwitchMethod?.(method);
            }
          }}
        />

        {/* Email Identity Field */}
        <div className="space-y-2">
          <label
            htmlFor="email_id"
            className="text-card-foreground block text-left text-sm font-medium"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email_id"
            // An identity's address, not the admin login - keep the
            // browser from filling in saved admin credentials
            autoComplete="off"
            placeholder="user@example.com"
            className={`cosmic-input w-full rounded-lg border px-4 py-3 transition-all duration-200 ${
              errors.email_id
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            } focus:ring-2 focus:outline-none`}
            {...register("email_id")}
          />
          {errors.email_id && (
            <p className="text-destructive flex items-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.email_id.message}
            </p>
          )}
        </div>

        {/* reCAPTCHA */}
        <div className="space-y-2">
          <div className="flex justify-center overflow-x-auto">
            <Reaptcha
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              action="IDENTITY_PASSWORD_RESET"
              size="normal"
              onChange={onRecaptchaVerify}
              onExpired={onRecaptchaExpire}
              onError={onRecaptchaError}
              className="rounded-lg"
              theme={theme === "dark" ? "dark" : "light"}
            />
          </div>
          {errors.recaptcha && (
            <p className="text-destructive flex items-center justify-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.recaptcha.message}
            </p>
          )}
        </div>

        <hr />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            initiateResetMutation.isPending || isSubmitting || !recaptchaToken
          }
          className={`cosmic-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
            initiateResetMutation.isPending || isSubmitting || !recaptchaToken
              ? "bg-primary/50 text-primary-foreground cursor-not-allowed opacity-60 disabled:scale-100 disabled:shadow-none disabled:hover:scale-100"
              : "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          }`}
        >
          {initiateResetMutation.isPending || isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Send OTP</span>
            </>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1InitiateIdentityReset;
