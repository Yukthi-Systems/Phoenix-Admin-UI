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

import {
  MoveRight,
  ArrowLeft,
  Smartphone,
  MessageSquare,
  Info,
} from "lucide-react";
import { Button } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

function StepVerifyMobile({
  mobileValue,
  setMobileValue,
  onNext = () => {},
  onPrev = () => {},
  isPending,
}) {
  return (
    <div className="w-full h-[60vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={Smartphone}
        title="Verify Phone Number"
        subtitle="Confirm your phone number for SMS verification"
      />

      {/* Content Area */}
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto space-y-6">
          {/* Phone Number Display */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-card-foreground text-left">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                disabled
                className="w-full px-4 py-3 pl-11 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
                value={mobileValue}
                onChange={(e) => setMobileValue(e.target.value)}
              />
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Information Card */}
          <InstructionCard
            icon={MessageSquare}
            title="SMS code sent"
            message="We've sent a 6-digit verification code to your phone number via SMS. Please check your messages, then click Next to enter the code."
            variant="info"
          />

          {/* Additional Info */}
          <InstructionCard
            icon={Info}
            title="Didn't receive the SMS?"
            message="SMS messages may take a few minutes to arrive. Make sure you have good cellular coverage. Standard messaging rates may apply."
            variant="warning"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t mx-2 my-1 border-border">
        <Button
          variant="secondary"
          size="lg"
          disabled={isPending}
          onClick={onPrev}
          icon={ArrowLeft}
          iconPosition="left"
        >
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          disabled={isPending}
          onClick={onNext}
          icon={MoveRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default StepVerifyMobile;
