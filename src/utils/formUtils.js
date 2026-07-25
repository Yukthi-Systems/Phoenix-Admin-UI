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

/**
 * Checks if a specific field path (e.g., "details.first_name") exists in the errors object.
 */
const hasError = (errors, path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], errors);
  };
  
  /**
   * Finds the index of the first step that contains a validation error.
   */
  export const findFirstErrorStep = (errors, steps) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      // Check if any field defined in this step exists in the errors object
      const stepHasError = step.fields.some((field) => hasError(errors, field));

      if (stepHasError) {
        return i + 1; // Return 1-based index to match your currentStep state
      }
    }
    return null;
  };

  /**
   * react-hook-form `onInvalid` handler for multi-step forms: jumps the wizard to the
   * first step containing a validation error and shows a toast, instead of silently
   * doing nothing when the user submits from a later step with an earlier step's field
   * still invalid.
   */
  export const jumpToErroredStep = (formErrors, steps, setCurrentStep, toast, actionLabel = "") => {
    const errorStep = findFirstErrorStep(formErrors, steps);

    if (errorStep) {
      setCurrentStep(errorStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      const stepLabel = steps[errorStep - 1].label;
      toast("error", `Please fix the errors in the "${stepLabel}" step${actionLabel ? ` ${actionLabel}` : ""}`);
    } else {
      toast("error", "Please fix the errors in the form before proceeding");
    }
  };