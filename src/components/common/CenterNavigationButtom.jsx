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

import React from "react";
import { SubmitButton } from "./Buttons";

function CenterNavigationButtom({
  currentStep = 0,
  prevStep = () => {},
  nextStep = () => {},
  steps = [],
  isPending = false,
  label = "",
}) {
  return (
    <div className="flex justify-center items-center gap-4 pb-6">
      {currentStep > 0 && (
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
        >
          Previous
        </button>
      )}

      {currentStep < steps.length - 1 ? (
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Next
        </button>
      ) : (
        <SubmitButton label={label} isPending={isPending} />
      )}
    </div>
  );
}

export default CenterNavigationButtom;
