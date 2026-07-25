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
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Reaptcha from "react-google-recaptcha";
import {
  Eye,
  EyeClosed,
  Loader,
  LogIn,
  Shield,
  Mail,
  AlertTriangle,
  Server,
  Layout,
} from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import { useLogin } from "@/hooks/useLogin";
import { loginFormSchema } from "./validationSchema";
import { itemsAtom } from "@/store/tfaMethods";
import SessionGuard from "@/components/layouts/SessionGuard";
import { useApiHealth, useApiVersion } from "@/hooks/useApiInfo";
import { BUILD_INFO, RECAPTCHA_SITE_KEY } from "@/constants/constants";

const Login = () => {
  const setTFAItems = useSetAtom(itemsAtom);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const userDetails = useAtomValue(userProfileAtom);
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const toast = useToastify();
  const recaptchaRef = useRef();

  // API Version & Health Check
  const { data: apiData, isLoading: isApiVersionLoading } = useApiVersion();
  const {
    data: healthData,
    isError: isHealthError,
    isLoading: isHealthLoading,
  } = useApiHealth(30000); // Poll every 30s

  const isSystemHealthy = !isHealthError && healthData?.status === "OK";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginFormSchema),
    mode: "onChange",
  });

  // Reset reCAPTCHA when form is reset or on error
  useEffect(() => {
    if (loginMutation.isError) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  }, [loginMutation.isError]);

  const onRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    if (errors.recaptcha) {
      setError("recaptcha", { type: "manual", message: "" });
    }
  };

  const onRecaptchaExpire = () => {
    setRecaptchaToken(null);
    toast(
      "warning",
      "Security check expired. Please verify you are human again.",
    );
  };

  const onRecaptchaError = () => {
    setRecaptchaToken(null);
    setError("recaptcha", {
      type: "manual",
      message: "Security verification failed. Please try again.",
    });
  };

  const onSubmit = async (data) => {
    // Block submission if system is unhealthy
    if (!isSystemHealthy && !isHealthLoading) {
      toast(
        "error",
        "System is currently unavailable. Please try again later.",
      );
      return;
    }

    if (!recaptchaToken) {
      setError("recaptcha", {
        type: "manual",
        message: "Please complete the security verification",
      });
      return;
    }

    const loginData = {
      ...data,
      recaptcha_token: recaptchaToken,
    };

    loginMutation.mutate(loginData, {
      onSuccess: (response) => {
        const { is_totp_2fa_active, is_sms_2fa_active, is_email_2fa_active } =
          response?.details || {};

        const enabled2FAMethods = [];
        if (is_totp_2fa_active) enabled2FAMethods.push("totp");
        if (is_sms_2fa_active) enabled2FAMethods.push("sms");
        if (is_email_2fa_active) enabled2FAMethods.push("email");

        const redirectPath =
          sessionStorage.getItem("redirectAfterLogin") || "/";

        if (enabled2FAMethods.length === 0) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath, { replace: true });
        } else if (enabled2FAMethods.length === 1) {
          navigate(`/2fa/validate/${enabled2FAMethods[0]}`, {
            state: {
              user: data?.username || "",
              redirectPath: redirectPath,
            },
          });
        } else {
          setTFAItems(enabled2FAMethods);
          navigate("/2fa/select-method", {
            state: {
              availableMethods: enabled2FAMethods,
              user: data?.username || "",
              redirectPath: redirectPath,
            },
          });
        }

        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      },
      onError: (error) => {
        console.error(error.message || "Login failed...!");
        const message =
          error.response?.data?.message || error.message || "Unknown error";
        const tracebackId = error.response?.data?.traceback_id;

        recaptchaRef.current?.reset();
        setRecaptchaToken(null);

        toast(
          "error",
          `Message: ${message}${
            tracebackId ? `\nTraceback ID: ${tracebackId}` : ""
          }`,
        );
      },
    });
  };

  useEffect(() => {
    if (
      userDetails !== null &&
      Cookies.get("IS_SESSION_VALID") &&
      Cookies.get("SESSION_ID")
    ) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [userDetails, navigate]);

  return (
    <SessionGuard>
      {/* STRICT DARK MODE ENFORCEMENT */}
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[hsl(240,21%,7%)] via-[hsl(240,21%,7%)] to-[hsl(240,21%,11%)] p-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        {/* Main Content Wrapper */}
        <div className="relative flex w-full max-w-6xl flex-1 items-center justify-center z-10">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            {/* Left Side - Welcome Section */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(262,80%,70%)]/20 bg-[hsl(262,80%,70%)]/10 px-4 py-2 text-[hsl(262,80%,70%)]">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin Portal</span>
                </div>

                <div className="space-y-2">
                  <h1 className="bg-gradient-to-r from-[hsl(240,5%,95%)] to-[hsl(240,5%,95%)]/70 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                    Welcome Back!
                  </h1>
                  <p className="text-xl text-[hsl(240,5%,65%)]">
                    Mail Service Administration Panel
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="mx-auto max-w-md text-[hsl(240,5%,65%)] lg:mx-0">
                  Secure access to your mail service management dashboard.
                  Monitor, configure, and manage your mail infrastructure with
                  ease.
                </p>

                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-[hsl(240,5%,65%)]">
                    <Shield className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                    <span>Secure Login</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[hsl(240,5%,65%)]">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>reCAPTCHA Protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="mx-auto w-full max-w-md">
              <div
                className={`relative overflow-hidden rounded-2xl border border-[hsl(240,16%,18%)]/50 bg-[hsl(240,21%,9%)]/50 p-8 shadow-2xl backdrop-blur-sm ${
                  loginMutation.isPending || isSubmitting ? "animate-pulse" : ""
                }`}
              >
                {/* Card Header Gradient */}
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[hsl(262,80%,70%)] via-[hsl(262,80%,70%)]/80 to-[hsl(262,80%,70%)]" />

                {(loginMutation.isPending || isSubmitting) && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl">
                    <div className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] rounded-2xl bg-gradient-to-r from-transparent via-[hsl(262,80%,70%)]/10 to-transparent bg-[length:200%_100%]" />
                    <div className="absolute inset-[1px] rounded-2xl bg-[hsl(240,21%,9%)]/10 backdrop-blur-sm" />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Form Header */}
                  <div className="space-y-2 text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(262,80%,70%)]/20 bg-[hsl(262,80%,70%)]/10">
                      <LogIn className="h-6 w-6 text-[hsl(262,80%,70%)]" />
                    </div>
                    <h2 className="text-2xl font-semibold text-[hsl(240,5%,95%)]">
                      Sign In
                    </h2>
                    <p className="text-sm text-[hsl(240,5%,65%)]">
                      Enter your credentials to access the admin panel
                    </p>
                  </div>

                  {/* System Health Warning Banner */}
                  {!isHealthLoading && !isSystemHealthy && (
                    <div className="animate-in fade-in zoom-in duration-300 rounded-lg border border-[hsl(348,83%,62%)]/20 bg-[hsl(348,83%,62%)]/10 p-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-[hsl(348,83%,62%)] shrink-0" />
                        <div className="text-sm text-[hsl(348,83%,62%)]">
                          <p className="font-semibold">System Unavailable</p>
                          <p className="opacity-90 text-xs">
                            {isHealthError
                              ? "Cannot connect to server."
                              : healthData?.message ||
                                "The API is currently not running smoothly."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="block text-left text-sm font-medium text-[hsl(240,5%,95%)]"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="username"
                          placeholder="Enter your username"
                          disabled={!isSystemHealthy}
                          className={`cosmic-input w-full rounded-lg border bg-[hsl(240,21%,7%)] px-4 py-3 text-[hsl(240,5%,95%)] transition-all duration-200 placeholder:text-[hsl(240,5%,65%)] focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.username
                              ? "border-[hsl(348,83%,62%)] focus:border-[hsl(348,83%,62%)] focus:ring-[hsl(348,83%,62%)]/20"
                              : "border-[hsl(240,16%,18%)] focus:border-[hsl(262,80%,70%)] focus:ring-[hsl(262,80%,70%)]/20"
                          }`}
                          maxLength={100}
                          {...register("username")}
                        />
                      </div>
                      {errors.username && (
                        <p className="flex items-center gap-1 text-sm text-[hsl(348,83%,62%)]">
                          <span className="h-1 w-1 rounded-full bg-[hsl(348,83%,62%)]" />
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="block text-left text-sm font-medium text-[hsl(240,5%,95%)]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="Enter your password"
                          disabled={!isSystemHealthy}
                          className={`cosmic-input w-full rounded-lg border bg-[hsl(240,21%,7%)] py-3 pr-12 pl-4 text-[hsl(240,5%,95%)] transition-all duration-200 placeholder:text-[hsl(240,5%,65%)] focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.password
                              ? "border-[hsl(348,83%,62%)] focus:border-[hsl(348,83%,62%)] focus:ring-[hsl(348,83%,62%)]/20"
                              : "border-[hsl(240,16%,18%)] focus:border-[hsl(262,80%,70%)] focus:ring-[hsl(262,80%,70%)]/20"
                          }`}
                          maxLength={100}
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          disabled={!isSystemHealthy}
                          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[hsl(240,5%,65%)] transition-colors duration-200 hover:bg-[hsl(240,21%,11%)] hover:text-[hsl(240,5%,95%)] disabled:opacity-50"
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeClosed className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="flex items-center gap-1 text-sm text-[hsl(348,83%,62%)]">
                          <span className="h-1 w-1 rounded-full bg-[hsl(348,83%,62%)]" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* reCAPTCHA Section */}
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Reaptcha
                          ref={recaptchaRef}
                          sitekey={RECAPTCHA_SITE_KEY}
                          action="LOGIN"
                          size="normal"
                          onChange={onRecaptchaVerify}
                          onExpired={onRecaptchaExpire}
                          onError={onRecaptchaError}
                          className="rounded-lg"
                          theme="dark"
                        />
                      </div>
                      {errors.recaptcha && (
                        <p className="flex items-center justify-center gap-1 text-center text-sm text-[hsl(348,83%,62%)]">
                          <span className="h-1 w-1 rounded-full bg-[hsl(348,83%,62%)]" />
                          {errors.recaptcha.message}
                        </p>
                      )}
                    </div>

                    <hr className="border-[hsl(240,16%,18%)]" />

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`cosmic-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                        loginMutation.isPending ||
                        isSubmitting ||
                        !recaptchaToken ||
                        !isSystemHealthy
                          ? "cursor-not-allowed bg-[hsl(262,80%,70%)]/50 text-[hsl(240,21%,7%)] opacity-60 disabled:scale-100 disabled:shadow-none disabled:hover:scale-100"
                          : "bg-[hsl(262,80%,70%)] text-[hsl(240,21%,7%)] hover:scale-[1.02] hover:bg-[hsl(262,80%,70%)]/90 hover:shadow-lg active:scale-95"
                      } `}
                      disabled={
                        loginMutation.isPending ||
                        isSubmitting ||
                        !recaptchaToken ||
                        !isSystemHealthy
                      }
                    >
                      {loginMutation.isPending || isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" strokeWidth={2} />
                          <span>Sign In</span>
                        </>
                      )}
                    </button>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => navigate("/reset/admin")}
                        className="text-sm font-medium text-[hsl(262,80%,70%)] transition-colors duration-200 hover:text-[hsl(262,80%,70%)]/80 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Version Information */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center">
          <div className="flex items-center gap-6 rounded-full border border-[hsl(240,16%,18%)]/50 bg-[hsl(240,21%,9%)]/80 px-5 py-2 text-xs font-medium text-[hsl(240,5%,50%)] backdrop-blur-md transition-all duration-300 hover:border-[hsl(262,80%,70%)]/20 hover:text-[hsl(240,5%,65%)]">
            <div className="flex items-center gap-2" title="Client Version">
              <Layout className="h-3 w-3" />
              <div className="flex items-center gap-1.5">
                <span>Client:</span>
                <span className="text-[hsl(240,5%,80%)]">
                  v{BUILD_INFO?.version || "0.0.0"}
                </span>
              </div>
            </div>

            <div className="h-3 w-[1px] bg-[hsl(240,16%,18%)]" />

            <div
              className="flex items-center gap-2"
              title="API Status & Version"
            >
              <Server className="h-3 w-3" />
              <div className="flex items-center gap-1.5">
                <span>API:</span>
                {isApiVersionLoading ? (
                  <Loader className="h-2 w-2 animate-spin" />
                ) : (
                  <span className="text-[hsl(240,5%,80%)]">
                    v{apiData?.version || "Unknown"}
                  </span>
                )}
                {/* Status Dot */}
                <span
                  className={`ml-1 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                    apiData
                      ? "bg-[hsl(142,71%,45%)] shadow-[hsl(142,71%,45%)]/50"
                      : "bg-[hsl(348,83%,62%)] shadow-[hsl(348,83%,62%)]/50"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SessionGuard>
  );
};

export default Login;
