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
import {
  ArrowLeft,
  Loader,
  Mail,
  Phone,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { themeAtom } from "@/store/theme";
import { useToastify } from "@/hooks/useToastify";
import { useInitiatePasswordReset } from "@/hooks/usePasswordReset";
import * as yup from "yup";

const initiateSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  verify_via: yup
    .string()
    .oneOf(["email", "phone"], "Please select a verification method")
    .required("Verification method is required"),
});

const Step1InitiateReset = ({
  onSuccess,
  initialUsername = "",
  initialVerifyVia = "email",
}) => {
  const [verifyMethod, setVerifyMethod] = useState("email");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const theme = useAtomValue(themeAtom);
  const navigate = useNavigate();
  const toast = useToastify();
  const recaptchaRef = useRef();
  const initiateResetMutation = useInitiatePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(initiateSchema),
    mode: "onChange",
    defaultValues: {
      username: initialUsername,
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
        user_name: data.username,
        verify_via: data.verify_via,
        recaptcha_token: recaptchaToken,
        // recaptcha_token: '12323',
      },
      {
        onSuccess: (response) => {
          toast(
            "success",
            `OTP sent to your ${data.verify_via === "email" ? "email" : "phone number"}`,
          );
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
          onSuccess({
            username: data.username,
            verify_via: data.verify_via,
            recaptchaRef: recaptchaRef.current,
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
          Reset Password
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter your username and choose verification method
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Username Field */}
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-card-foreground block text-left text-sm font-medium"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            className={`cosmic-input w-full rounded-lg border px-4 py-3 transition-all duration-200 ${errors.username
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary focus:ring-primary/20"
              } focus:ring-2 focus:outline-none`}
            maxLength={100}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-destructive flex items-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Verification Method */}
        <div className="space-y-2">
          <label className="text-card-foreground block text-left text-sm font-medium">
            Verification Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`relative flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${verifyMethod === "email"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                }`}
            >
              <input
                type="radio"
                value="email"
                {...register("verify_via")}
                className="sr-only"
              />
              <Mail
                className={`h-5 w-5 ${verifyMethod === "email" ? "text-primary" : "text-muted-foreground"}`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${verifyMethod === "email" ? "text-primary" : "text-foreground"}`}
                >
                  Email
                </p>
              </div>
              {verifyMethod === "email" && (
                <CheckCircle className="text-primary h-5 w-5" />
              )}
            </label>

            <label
              className={`relative flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${verifyMethod === "phone"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                }`}
            >
              <input
                type="radio"
                value="phone"
                {...register("verify_via")}
                className="sr-only"
              />
              <Phone
                className={`h-5 w-5 ${verifyMethod === "phone" ? "text-primary" : "text-muted-foreground"}`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${verifyMethod === "phone" ? "text-primary" : "text-foreground"}`}
                >
                  Phone
                </p>
              </div>
              {verifyMethod === "phone" && (
                <CheckCircle className="text-primary h-5 w-5" />
              )}
            </label>
          </div>
          {errors.verify_via && (
            <p className="text-destructive flex items-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.verify_via.message}
            </p>
          )}
        </div>

        {/* reCAPTCHA */}
        <div className="space-y-2">
          <div className="flex justify-center overflow-x-auto">
            <Reaptcha
              ref={recaptchaRef}
              sitekey="6LdnqnksAAAAADb9pV-s81jk_nEoHP34trkZ457b"
              action="PASSWORD_RESET"
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
          className={`cosmic-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${initiateResetMutation.isPending || isSubmitting || !recaptchaToken
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

export default Step1InitiateReset;
