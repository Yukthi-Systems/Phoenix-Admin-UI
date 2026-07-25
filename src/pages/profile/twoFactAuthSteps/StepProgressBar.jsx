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

import { Check } from "lucide-react";

const StepProgressBar = ({ step, type }) => {
  const stepsMap = {
    authenticator: [
      "Choose Method",
      "Create Authenticator",
      "Generate QR Code",
      "Validate TOTP",
      "Complete",
    ],
    email: ["Choose Method", "Verify Email", "Validate OTP", "Complete"],
    sms: ["Choose Method", "Verify Phone", "Validate OTP", "Complete"],
  };

  const steps = stepsMap[type] || [];
  const progressPercent =
    steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0;

  return (
    <div className="mb-6">
      {/* Progress Container */}
      <div className="relative flex items-center justify-between">
        {/* Background Progress Line */}
        <div
          className="absolute top-4 h-0.5 bg-border z-0"
          style={{
            left: `${100 / (steps.length * 2)}%`,
            right: `${100 / (steps.length * 2)}%`,
          }}
        >
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((label, idx) => {
          const isCompleted = step > idx;
          const isCurrent = step === idx;
          const isPending = step < idx;

          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center flex-1"
            >
              {/* Step Circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCurrent
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                        : "bg-muted text-muted-foreground border border-border"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-2 text-xs transition-colors duration-300 text-center leading-tight max-w-20
                  ${
                    isCurrent
                      ? "font-semibold text-primary"
                      : isCompleted
                        ? "font-medium text-card-foreground"
                        : "text-muted-foreground"
                  }
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
