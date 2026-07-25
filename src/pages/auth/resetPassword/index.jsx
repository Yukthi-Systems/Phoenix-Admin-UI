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

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, KeyRound, ShieldUser, Mail } from "lucide-react";
import Step1InitiateReset from "./InitialReset";
import Step2CompleteReset from "./CompleteReset";
import Step1InitiateIdentityReset from "./IdentityInitiateReset";
import Step2CompleteIdentityReset from "./IdentityCompleteReset";

const MODES = {
  admin: {
    label: "Admin Account",
    icon: ShieldUser,
    subtitle: "Secure Account Recovery",
    description:
      "Choose your preferred verification method and we'll send you a secure OTP code.",
  },
  identity: {
    label: "Email Identity",
    icon: Mail,
    subtitle: "Secure Identity Recovery",
    description:
      "Reset the password of an E-Mail Identity using its secondary email or phone.",
  },
};

const MODE_KEYS = Object.keys(MODES);
const SWIPE_THRESHOLD = 50;
const SWIPE_MAX_DRAG = 90;

const ResetPassword = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const [mode, setMode] = useState(
    requestedMode === "identity" ? "identity" : "admin",
  );
  const [step, setStep] = useState(1);
  const [adminData, setAdminData] = useState({
    username: "",
    verify_via: "email",
  });
  const [identityData, setIdentityData] = useState({
    email_id: "",
    verify_via: "email",
  });
  // Direction the incoming content should slide in from: 1 = from the
  // right (moving to a "later" tab), -1 = from the left, 0 = no tab change
  const [slideDir, setSlideDir] = useState(0);
  const swipeTrackRef = useRef(null);
  const touchState = useRef({ startX: 0, startY: 0, dragging: false, dragX: 0 });

  // Keep the URL in sync so the mode survives a refresh / can be deep-linked
  useEffect(() => {
    const current = searchParams.get("mode");
    const desired = mode === "identity" ? "identity" : null;
    if (current !== desired) {
      const next = new URLSearchParams(searchParams);
      if (desired) {
        next.set("mode", desired);
      } else {
        next.delete("mode");
      }
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setSlideDir(MODE_KEYS.indexOf(nextMode) > MODE_KEYS.indexOf(mode) ? 1 : -1);
    setMode(nextMode);
    setStep(1);
  };

  const handleAdminStep1Success = (data) => {
    setAdminData({ username: data.username, verify_via: data.verify_via });
    setSlideDir(0);
    setStep(2);
  };

  const handleIdentityStep1Success = (data) => {
    setIdentityData({
      email_id: data.email_id,
      verify_via: data.verify_via,
    });
    setSlideDir(0);
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setSlideDir(0);
    setStep(1);
  };

  // Mobile: swipe left/right on the card to switch between the Admin and
  // Identity tabs (same effect as tapping the pill switcher). Only active
  // on step 1 so an in-progress OTP/password entry can't be swiped away.
  const handleTouchStart = (e) => {
    if (step !== 1) return;
    const t = e.touches[0];
    touchState.current = { startX: t.clientX, startY: t.clientY, dragging: false, dragX: 0 };
  };

  const handleTouchMove = (e) => {
    if (step !== 1) return;
    const state = touchState.current;
    const t = e.touches[0];
    const dx = t.clientX - state.startX;
    const dy = t.clientY - state.startY;

    if (!state.dragging) {
      if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return;
      state.dragging = true;
    }

    const currentIndex = MODE_KEYS.indexOf(mode);
    // Resistance when dragging past the first/last tab
    let dragX = dx;
    if (dx < 0 && currentIndex >= MODE_KEYS.length - 1) dragX = dx / 4;
    if (dx > 0 && currentIndex <= 0) dragX = dx / 4;
    dragX = Math.max(-SWIPE_MAX_DRAG, Math.min(SWIPE_MAX_DRAG, dragX));
    state.dragX = dragX;

    if (swipeTrackRef.current) {
      swipeTrackRef.current.style.transition = "none";
      swipeTrackRef.current.style.transform = `translateX(${dragX}px)`;
    }
  };

  const handleTouchEnd = () => {
    const state = touchState.current;
    if (swipeTrackRef.current) {
      swipeTrackRef.current.style.transition = "transform 0.25s ease-out";
      swipeTrackRef.current.style.transform = "translateX(0px)";
    }
    if (!state.dragging) return;
    state.dragging = false;

    const currentIndex = MODE_KEYS.indexOf(mode);
    if (state.dragX <= -SWIPE_THRESHOLD && currentIndex < MODE_KEYS.length - 1) {
      switchMode(MODE_KEYS[currentIndex + 1]);
    } else if (state.dragX >= SWIPE_THRESHOLD && currentIndex > 0) {
      switchMode(MODE_KEYS[currentIndex - 1]);
    }
  };

  const activeMode = MODES[mode];

  const ModeSwitcher = (
    <div className="bg-muted/50 border-border/60 relative inline-flex w-full rounded-full border p-1 shadow-sm backdrop-blur-sm">
      <div
        className="bg-primary absolute inset-y-1 w-[calc(50%-4px)] rounded-full shadow-md transition-transform duration-300 ease-out"
        style={{
          transform: mode === "admin" ? "translateX(0%)" : "translateX(100%)",
        }}
      />
      {Object.entries(MODES).map(([key, config]) => {
        const Icon = config.icon;
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold transition-colors duration-300 sm:px-3 sm:text-sm ${
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{config.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="from-background via-background to-muted relative flex min-h-screen items-center justify-center bg-gradient-to-br px-3 py-6 sm:p-4 sm:py-10">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative flex w-full max-w-6xl flex-col items-center">
        <div className="grid w-full items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Left Side - Info Section (desktop only, keeps the mobile view short) */}
          <div className="hidden text-center lg:block lg:space-y-6 lg:text-left">
            <div className="space-y-4">
              <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2">
                <KeyRound className="h-4 w-4" />
                <span className="text-sm font-medium">Password Recovery</span>
              </div>

              <div className="space-y-2">
                <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                  Reset Password
                </h1>
                <p className="text-muted-foreground text-xl">
                  {step === 1 ? activeMode.subtitle : "Verify OTP & Set Password"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground mx-auto max-w-md lg:mx-0">
                {step === 1
                  ? activeMode.description
                  : "Enter the OTP code and create a strong new password for your account."}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    step >= 1
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    Request OTP
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Verify your {mode === "admin" ? "account" : "identity"}
                  </p>
                </div>
              </div>

              <div className="border-border ml-5 h-8 border-l-2" />

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    step >= 2
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    Reset Password
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Create new password
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="mx-auto w-full max-w-md space-y-4">
            {/* Mobile-only compact header */}
            <div className="space-y-1.5 text-center lg:hidden">
              <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <KeyRound className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Password Recovery</span>
              </div>
              <h1 className="text-foreground text-2xl font-bold">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Step {step} of 2 &middot;{" "}
                {step === 1 ? activeMode.subtitle : "Verify OTP & set password"}
              </p>
              {step === 1 && (
                <p className="text-muted-foreground/70 text-xs">
                  Swipe the card, or tap above, to switch
                </p>
              )}
            </div>

            {/* Mode Switcher */}
            {ModeSwitcher}

            <div
              ref={swipeTrackRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{ touchAction: step === 1 ? "pan-y" : "auto" }}
              className="bg-card/50 border-border/50 relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-sm sm:p-6 md:p-8"
            >
              {/* Card Header Gradient */}
              <div className="from-primary via-primary/80 to-primary absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

              {/* Step Components */}
              <div
                key={`${mode}-${step}`}
                className="reset-content-fade-in"
                style={{
                  "--reset-slide-x": `${slideDir * 24}px`,
                  "--reset-slide-y": slideDir === 0 ? "6px" : "0px",
                }}
              >
                {mode === "admin" && step === 1 && (
                  <Step1InitiateReset
                    onSuccess={handleAdminStep1Success}
                    initialUsername={adminData.username}
                    initialVerifyVia={adminData.verify_via}
                  />
                )}
                {mode === "admin" && step === 2 && (
                  <Step2CompleteReset
                    username={adminData.username}
                    verifyMethod={adminData.verify_via}
                    onBack={handleBackToStep1}
                  />
                )}
                {mode === "identity" && step === 1 && (
                  <Step1InitiateIdentityReset
                    onSuccess={handleIdentityStep1Success}
                    initialEmailId={identityData.email_id}
                    initialVerifyVia={identityData.verify_via}
                  />
                )}
                {mode === "identity" && step === 2 && (
                  <Step2CompleteIdentityReset
                    emailId={identityData.email_id}
                    verifyMethod={identityData.verify_via}
                    onBack={handleBackToStep1}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
