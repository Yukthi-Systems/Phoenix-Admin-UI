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

/**
 * Enhanced Stepper Component
 * * Architectural Fix:
 * The padding (px-8) has been moved to a parent wrapper. The inner relative div 
 * now corresponds exactly to the flex content width. This ensures that percentage-based
 * calculations for the lines perfectly align with the flex-1 distributed steps.
 */
const Stepper = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  allowStepNavigation = true,
  isEditMode = false,
}) => {
  const handleStepClick = (stepNumber) => {
    if (!allowStepNavigation || !onStepClick) return;

    if (isEditMode) {
      onStepClick(stepNumber);
      return;
    }

    const isClickable =
      stepNumber === currentStep ||
      completedSteps.includes(stepNumber) ||
      stepNumber < currentStep;

    if (isClickable) {
      onStepClick(stepNumber);
    }
  };

  // Safe math variables
  const totalSteps = steps.length || 1;
  const stepWidthPercentage = 100 / totalSteps; // Width of one step slot
  const halfStepPercentage = stepWidthPercentage / 2; // Center point of first slot

  return (
    <div className="w-full py-4">
      {/* 1. Structural Fix: Wrapper handles the padding and max-width */}
      <div className="mx-auto max-w-3xl px-8">
        
        {/* 2. Positioning Context: Matches the flex content width exactly */}
        <div className="relative flex items-center justify-between">
          
          {/* Progress Bar Background */}
          <div
            className="bg-border absolute top-4 h-[2px]"
            style={{
              // Start center of first step, End center of last step
              left: `${halfStepPercentage}%`,
              right: `${halfStepPercentage}%`,
            }}
          />

          {/* Progress Bar Fill */}
          <div
            className="bg-primary absolute top-4 h-[2px] transition-all duration-500 ease-out"
            style={{
              // Starts at the same point as the background line
              left: `${halfStepPercentage}%`,
              // Width calculation: (Steps to traverse) * (Width of one step)
              width: `${(currentStep - 1) * stepWidthPercentage}%`,
            }}
          />

          {/* Step Items */}
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = currentStep === stepNumber;
            const isPast = stepNumber < currentStep;

            const isClickable =
              allowStepNavigation &&
              onStepClick &&
              (isEditMode || isCompleted || isPast || isCurrent);

            const showCheckmark = !isEditMode && (isCompleted || isPast);

            return (
              <div
                key={step.id || index}
                className="relative flex flex-col items-center"
                style={{ flex: 1 }}
              >
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out ${
                    showCheckmark
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isCurrent
                        ? "border-primary bg-background text-primary ring-primary/20 shadow-lg ring-4"
                        : isEditMode
                          ? "border-primary/60 bg-background text-primary/80 hover:border-primary hover:text-primary"
                          : "border-border bg-card text-muted-foreground"
                  } ${
                    isClickable
                      ? "cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95"
                      : "cursor-not-allowed opacity-60"
                  } `}
                  aria-label={`Go to ${step.label}`}
                  title={isClickable ? `Go to ${step.label}` : step.label}
                >
                  {showCheckmark ? (
                    <Check className="animate-in zoom-in h-4 w-4 duration-200" />
                  ) : (
                    <span className="text-xs font-semibold">{stepNumber}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={`text-center text-xs font-medium transition-colors duration-200 ${
                      isCurrent
                        ? "text-foreground"
                        : isEditMode
                          ? "text-foreground/70"
                          : isPast || isCompleted
                            ? "text-foreground/80"
                            : "text-muted-foreground"
                    } ${isClickable ? "hover:text-foreground cursor-pointer" : ""} `}
                    onClick={() => isClickable && handleStepClick(stepNumber)}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Active Indicator */}
                {isCurrent && (
                  <div className="bg-primary absolute -bottom-1.5 h-0.5 w-10 animate-pulse rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stepper;