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

import { CheckCircle, Shield, Key, Info } from "lucide-react";
import { Button } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

const StepConfirmation = ({ activeStatus, onNext = () => {} }) => {
  const showBackupNote = activeStatus === false;

  return (
    <div className="w-full h-[60vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={CheckCircle}
        title="Setup Complete"
        subtitle="Your two-factor authentication has been successfully configured"
      />

      {/* Content Area */}
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex justify-center items-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-card-foreground">
              2FA Successfully Enabled!
            </h2>
            <p className="text-muted-foreground">
              Your account is now more secure with two-factor authentication.
            </p>
          </div>

          {/* Information Cards */}
          <div className="space-y-3">
            <InstructionCard
              icon={Shield}
              title="Enhanced Security"
              message="You'll now be asked for a 6-digit verification code each time you log in, providing an extra layer of protection for your account."
              variant="success"
            />

            {showBackupNote && (
              <>
                <InstructionCard
                  icon={Key}
                  title="Backup Codes Recommended"
                  message="Consider generating backup codes to ensure you can access your account if you lose your authenticator device."
                  variant="warning"
                />

                <InstructionCard
                  icon={Info}
                  title="Keep Backup Codes Safe"
                  message="Store your backup codes in a secure location. They can be used to regain access to your account if your primary 2FA method is unavailable."
                  variant="info"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4 border-t m-2 border-border">
        <Button
          variant="success"
          size="lg"
          onClick={onNext}
          icon={CheckCircle}
          iconPosition="right"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default StepConfirmation;
