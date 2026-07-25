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

import { useState } from "react";
import EditModelBox from "@/components/common/EditModelBox";
import StepBackupCode from "./twoFactAuthSteps/StepBackupCode";
import { useBackupCheck, useGenerateBackupCode } from "@/hooks/useTFA";
import { useToastify } from "@/hooks/useToastify";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import { Button } from "@/components/common/Buttons";
import { Key, RefreshCw, Shield, AlertTriangle, Info } from "lucide-react";

function BackupCode({ isOpen = false, setIsOpen = () => {} }) {
  const { user_id, display_name } = useAtomValue(userProfileAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const [totpBackupCode, setTotpBackupCode] = useState([]);
  const [showTOTP, setShowTOTP] = useState(false);
  const { mutate: genBackup, isPending } = useGenerateBackupCode();
  const { data, isLoading } = useBackupCheck({
    organization_id,
    user_id,
    userName: display_name,
  });
  const toast = useToastify();

  const handleClose = () => {
    setIsOpen(false);
    setShowTOTP(false);
    setTotpBackupCode([]);
  };

  const generateBackupCodes = () => {
    genBackup(
      { orgId: organization_id, user_id: user_id, userName: display_name },
      {
        onSuccess: (response) => {
          setTotpBackupCode(response?.codes || []);
          setShowTOTP(true);
          toast("success", "Backup codes generated successfully.");
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
          console.error(error);
        },
      },
    );
  };

  const renderContent = () => {
    if (showTOTP) {
      return (
        <StepBackupCode backupCode={totpBackupCode} onNext={handleClose} />
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading backup code status...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Backup Verification Codes
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Backup codes help you regain access to your account if you lose your
            authenticator device.
          </p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {data?.has_backup_codes ? (
            <>
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg border-l-4 border-l-success">
                <div className="flex gap-3">
                  <div className="p-1.5 h-fit bg-success/10 text-success rounded flex-shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-card-foreground text-left">
                      Backup codes already exist
                    </h4>
                    <p className="text-sm text-muted-foreground text-left">
                      You have {data?.valid_backup_codes_count || 0} unused
                      backup codes remaining.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Card */}
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg border-l-4 border-l-warning">
                <div className="flex gap-3">
                  <div className="p-1.5 h-fit bg-warning/10 text-warning rounded flex-shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-card-foreground text-left">
                      Regenerating will invalidate old codes
                    </h4>
                    <p className="text-sm text-muted-foreground text-left">
                      Creating new backup codes will make your existing codes
                      unusable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  variant="warning"
                  size="lg"
                  onClick={generateBackupCodes}
                  disabled={isPending}
                  loading={isPending}
                  icon={RefreshCw}
                  iconPosition="left"
                >
                  Regenerate Backup Codes
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg border-l-4 border-l-primary">
                <div className="flex gap-3">
                  <div className="p-1.5 h-fit bg-primary/10 text-primary rounded flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-card-foreground text-left">
                      No backup codes generated
                    </h4>
                    <p className="text-sm text-muted-foreground text-left">
                      Generate backup codes to ensure you can access your
                      account if you lose your authenticator device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground text-left">
                  Why generate backup codes?
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-left">
                      Access your account if you lose your phone
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-left">
                      Emergency recovery when traveling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-left">
                      Backup for device malfunctions
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-center pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={generateBackupCodes}
                  disabled={isPending}
                  loading={isPending}
                  icon={Key}
                  iconPosition="left"
                >
                  Generate Backup Codes
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Generate Backup Codes"
      handleCancel={handleClose}
    >
      <div className="w-[75vw] h-[70vh] overflow-y-auto no-scrollbar">
        <div className="p-6">{renderContent()}</div>
      </div>
    </EditModelBox>
  );
}

export default BackupCode;
