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

import ResendButtonWithTimer from "@/components/common/ResendButtonWithTimer";
import { MoveRight, ShieldEllipsis, Smartphone, Mail, Key } from "lucide-react";
import OTPInput from "react-otp-input";
import { Button } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

function StepValidateTOTP({
  otp = "",
  setOtp = () => {},
  onNext = () => {},
  isPending = false,
  type = "",
  rendOTP = () => {},
}) {
  const getConfig = () => {
    switch (type) {
      case "authenticator":
        return {
          icon: Key,
          title: "Validate TOTP Code",
          subtitle: "Enter the 6-digit code from your authenticator app",
          instructionTitle: "Enter authenticator code",
          instructionMessage:
            "Open your authenticator app and enter the 6-digit code displayed for this account.",
          instructionIcon: Key,
        };
      case "email":
        return {
          icon: Mail,
          title: "Validate Email Code",
          subtitle: "Enter the 6-digit code sent to your email",
          instructionTitle: "Check your email",
          instructionMessage:
            "We've sent a 6-digit verification code to your email address. Please check your inbox and spam folder.",
          instructionIcon: Mail,
        };
      case "sms":
        return {
          icon: Smartphone,
          title: "Validate SMS Code",
          subtitle: "Enter the 6-digit code sent to your phone",
          instructionTitle: "Check your messages",
          instructionMessage:
            "We've sent a 6-digit verification code to your phone number via SMS.",
          instructionIcon: Smartphone,
        };
      default:
        return {
          icon: ShieldEllipsis,
          title: "Validate Code",
          subtitle: "Enter the verification code",
          instructionTitle: "Enter verification code",
          instructionMessage: "Please enter the 6-digit verification code.",
          instructionIcon: ShieldEllipsis,
        };
    }
  };

  const config = getConfig();

  return (
    <div className="w-full h-[59vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={config.icon}
        title={config.title}
        subtitle={config.subtitle}
      />

      {/* Content Area */}
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex justify-center items-center">
              <ShieldEllipsis className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Instructions */}
          <InstructionCard
            icon={config.instructionIcon}
            title={config.instructionTitle}
            message={config.instructionMessage}
            variant="info"
          />

          {/* OTP Input */}
          <div className="flex justify-center">
            <OTPInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              isInputNum
              shouldAutoFocus
              renderInput={(props) => <input {...props} />}
              inputStyle={{
                width: "3rem",
                height: "3rem",
                margin: "0 0.3rem",
                fontSize: "1.25rem",
                fontWeight: "600",
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
                color: "hsl(var(--card-foreground))",
                textAlign: "center",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              focusStyle={{
                border: "2px solid hsl(var(--primary))",
                boxShadow: "0 0 0 2px hsl(var(--primary) / 0.2)",
              }}
            />
          </div>

          {/* Resend Button for non-authenticator types */}
          {type !== "authenticator" && (
            <div className="flex justify-center">
              <ResendButtonWithTimer onResend={rendOTP} initialTimer={120} />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 border-t border-border m-2">
        <Button
          variant="primary"
          size="lg"
          disabled={isPending || otp.length !== 6}
          onClick={onNext}
          icon={MoveRight}
          iconPosition="right"
        >
          Verify
        </Button>
      </div>
    </div>
  );
}

export default StepValidateTOTP;
