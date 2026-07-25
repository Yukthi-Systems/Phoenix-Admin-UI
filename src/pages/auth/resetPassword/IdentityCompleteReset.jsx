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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import OtpInput from "react-otp-input";
import {
  ArrowLeft,
  Loader,
  KeyRound,
  CheckCircle,
  Eye,
  EyeClosed,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToastify } from "@/hooks/useToastify";
import { useCompletePasswordResetIdentity } from "@/hooks/usePasswordReset";
import * as yup from "yup";

const completeSchema = yup.object({
  new_password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&#]/,
      "Password must contain at least one special character",
    ),
  confirm_password: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("new_password")], "Passwords must match"),
});

const Step2CompleteIdentityReset = ({ emailId, verifyMethod, onBack }) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  const navigate = useNavigate();
  const toast = useToastify();

  const completeResetMutation = useCompletePasswordResetIdentity();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(completeSchema),
    mode: "onChange",
  });

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      toast("warning", "OTP expired. Please request a new one.");
      onBack();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onBack, toast]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (value) => {
    setOtp(value.toUpperCase());
    if (otpError) setOtpError("");
  };

  const onSubmit = async (data) => {
    if (!otp || otp.length < 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    completeResetMutation.mutate(
      {
        email_id: emailId,
        data: {
          otp: otp,
          new_password_base64: btoa(data.new_password),
          verify_via: verifyMethod,
        },
      },
      {
        onSuccess: () => {
          toast(
            "success",
            "Identity password reset successful! Redirecting to login...",
          );
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to reset password";
          const tracebackId = error.response?.data?.traceback_id;

          toast(
            "error",
            `${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );

          // Auto redirect to Step 1 on OTP-related errors
          if (
            message.toLowerCase().includes("token") ||
            message.toLowerCase().includes("otp") ||
            message.toLowerCase().includes("invalid") ||
            message.toLowerCase().includes("expired")
          ) {
            setTimeout(() => {
              onBack();
            }, 2000);
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2 text-center">
        <div className="bg-success/10 border-success/20 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border">
          <CheckCircle className="text-success h-6 w-6" />
        </div>
        <h2 className="text-card-foreground text-2xl font-semibold">
          Enter OTP
        </h2>
        <p className="text-muted-foreground text-sm">
          Check your {verifyMethod === "email" ? "email" : "phone"} for the
          6-digit code
        </p>

        {/* Timer Display */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${
            timeLeft <= 30
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* OTP Input */}
        <div className="space-y-2">
          <label className="text-card-foreground block text-center text-sm font-medium">
            Enter OTP
          </label>
          <div className="flex justify-center overflow-x-auto">
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              numInputs={6}
              inputType="text"
              shouldAutoFocus
              containerStyle="gap-1.5 sm:gap-2"
              renderInput={(props) => (
                <input
                  style={{ textTransform: "uppercase" }}
                  {...props}
                  autoComplete="off"
                  className={`cosmic-input mr-1 !h-11 !w-11 rounded-lg border text-center text-lg font-semibold uppercase transition-all duration-200 sm:!h-12 sm:!w-12 ${
                    otpError
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-primary focus:ring-primary/20"
                  } focus:ring-2 focus:outline-none`}
                />
              )}
            />
          </div>
          {otpError && (
            <p className="text-destructive flex items-center justify-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {otpError}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <label className="text-card-foreground block text-left text-sm font-medium">
            New Password
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your new password"
              className={`cosmic-input w-full rounded-lg border py-3 pr-12 pl-4 transition-all duration-200 ${
                errors.new_password
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              } focus:ring-2 focus:outline-none`}
              {...register("new_password")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 transition-colors duration-200"
            >
              {showNewPassword ? (
                <EyeClosed className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-destructive flex items-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.new_password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-card-foreground block text-left text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              className={`cosmic-input w-full rounded-lg border py-3 pr-12 pl-4 transition-all duration-200 ${
                errors.confirm_password
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary focus:ring-primary/20"
              } focus:ring-2 focus:outline-none`}
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 transition-colors duration-200"
            >
              {showConfirmPassword ? (
                <EyeClosed className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-destructive flex items-center gap-1 text-sm">
              <span className="bg-destructive h-1 w-1 rounded-full" />
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <hr />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={completeResetMutation.isPending || isSubmitting}
          className={`cosmic-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
            completeResetMutation.isPending || isSubmitting
              ? "bg-primary/50 text-primary-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          }`}
        >
          {completeResetMutation.isPending || isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              <span>Reset Password</span>
            </>
          )}
        </button>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2CompleteIdentityReset;
