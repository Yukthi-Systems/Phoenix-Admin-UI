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

import { MoveRight, ArrowLeft, Key, Info } from "lucide-react";
import { Button } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

function StepCreateValue({
  onNext = () => {},
  onPrev = () => {},
  isPending = false,
  selectedTypeValue,
  setSelectedTypeValue,
}) {
  return (
    <div className="w-full h-[59vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={Key}
        title="Create Authenticator Name"
        subtitle="Enter a name to identify this authenticator"
      />

      {/* Content Area */}
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto space-y-4">
          {/* Input Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-card-foreground text-left">
              Authenticator Name
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="e.g., My Phone, Work Device"
              value={selectedTypeValue}
              onChange={(e) => setSelectedTypeValue(e.target.value)}
              disabled={isPending}
            />
          </div>

          {/* Info Message */}
          <InstructionCard
            icon={Info}
            title="Choose a recognizable name"
            message="This name will help you identify this authenticator device when managing your 2FA settings."
            variant="info"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mx-2 my-1 pt-4 border-t border-border">
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
          disabled={isPending || !selectedTypeValue?.trim()}
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

export default StepCreateValue;
