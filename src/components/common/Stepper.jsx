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

// components/common/Stepper.jsx
import React from "react";

export const Stepper = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="flex flex-col items-center my-2">
      <div className="flex items-center w-full max-w-4xl">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {index > 0 && (
                <div
                  className={`flex-1 h-1 ${
                    currentStep >= index ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-[11px] ${
                  currentStep >= index
                    ? "bg-primary border-primary text-white"
                    : "border-border text-muted-foreground"
                } ${
                  currentStep === index
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
              >
                {index + 1}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    currentStep > index ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-center max-w-24">
              {step.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
