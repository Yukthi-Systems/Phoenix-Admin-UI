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

import React, { useEffect, useRef } from "react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton } from "@/components/common/Buttons";
import Stepper from "@/components/common/NewStepper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RequiredNote from "@/components/common/RequiredNote";
import useDocTarget from "@/hooks/useDocTarget";

/**
 * Enhanced FormLayout - Reusable layout that adapts for Single Step or Multi-Step forms.
 *
 * Capabilities:
 * - Automatically hides the Stepper UI if steps.length === 1
 * - Uses Flexbox for dynamic height adjustment (no more fixed calc-80px)
 * - Persists standard Header (Breadcrumbs) and Footer (Actions) architecture
 * - Updates URL with ?step=X query parameter
 */
const FormLayout = ({
  breadcrumbItems = [],
  steps = [],
  currentStep = 1,
  completedSteps = [],
  onNext,
  onPrevious,
  onStepClick,
  onSubmit,
  children,
  isPending = false,
  submitLabel = "Submit",
  showRequiredNote = true,
  customHeight = "h-[calc(100vh-135px)]",
  isEditMode = false,
  allowStepNavigation = true,
  showSubmitOnAllSteps = false,
  showStepper, // Optional: Force show/hide stepper manually
  // "<feature>/<flow>" (e.g. "domain/create"). When docs exist for it, the
  // header Help button opens a step-aware documentation drawer for this form.
  docId,
}) => {
  useDocTarget(docId, steps.length > 1 ? currentStep : 1);
  const isLastStep = steps.length === 0 || currentStep === steps.length;
  // Auto-hide stepper if there is only one step, unless explicitly overridden
  const shouldShowStepper =
    showStepper !== undefined ? showStepper : steps.length > 1;

  const showSubmit = showSubmitOnAllSteps || isEditMode || isLastStep;

  // Update URL query parameter when step changes
  useEffect(() => {
    if (steps.length > 1) {
      const url = new URL(window.location.href);
      url.searchParams.set("step", currentStep);
      window.history.replaceState({}, "", url);
    }
  }, [currentStep, steps.length]);

  // Scroll to top when step changes
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  return (
    <div className="h-full w-full overflow-hidden px-2">
      {/* Header with Breadcrumbs and Back Button */}
      <div className="mb-2.5 flex w-full">
        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Form Container - Converted to Flex Column for dynamic sizing */}
      <div
        className={`bg-card border-border flex flex-col overflow-hidden rounded-md border shadow-lg ${customHeight}`}
      >
        {/* Stepper Header - Conditionally Rendered */}
        {shouldShowStepper && (
          <div className="border-border bg-card border-b px-6">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={onStepClick}
              allowStepNavigation={allowStepNavigation}
              isEditMode={isEditMode}
            />
          </div>
        )}

        {/* Form Body - flex-1 allows it to fill remaining space regardless of Stepper presence */}
        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Form Content - Scrollable Area */}
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex-1 overflow-y-auto px-6 py-6"
          >
            <div className="mx-auto space-y-5">{children}</div>
          </div>

          {/* Navigation Footer */}
          <div className="border-border bg-card border-t px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onPrevious();
                    }}
                    className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-primary inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                )}
              </div>

              {/* Navigation and Submit Buttons */}
              <div className="flex items-center gap-3">
                {showRequiredNote && !isLastStep && !showSubmit && (
                  <RequiredNote />
                )}

                {/* Next/Review Button - Only show if not on last step */}
                {!isLastStep && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNext();
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    {currentStep === steps.length - 1 && !isEditMode
                      ? "Review"
                      : "Next"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {/* Submit Button */}
                {showSubmit && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      submitLabel
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormLayout;
