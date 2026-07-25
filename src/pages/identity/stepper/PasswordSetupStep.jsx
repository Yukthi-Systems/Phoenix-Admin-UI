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

import React, { useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Input, PasswordInput } from "@/components/common/Inputs";
import { Switch } from "@/components/common/Switch";
import EditModelBox from "@/components/common/EditModelBox";
import { APP_STORE_LINKS } from "@/constants/constants";

// TODO: replace with real store listings once the app is published


function PasswordSetupStep({ register, errors, control, watch, isEdit }) {
  const secondaryEmail = watch("secondary_email");
  const primaryPhone = watch("primary_phone_number");
  const isAppEnabled = watch("is_app_2fa_enabled");
  const isSmsEnabled = watch("is_sms_2fa_enabled");
  const isEmailEnabled = watch("is_email_2fa_enabled");
  const [qrModalStore, setQrModalStore] = useState(null); // "ios" | "android" | null

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Password Setup
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {isEdit
            ? "Modify the password for this identity (leave blank to keep current)"
            : "Set a secure password for this E-Mail Identity"}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <PasswordInput
          register={register}
          isRequired={!isEdit}
          errors={errors}
          name="password"
          label={isEdit ? "New Password" : "Password"}
          placeholder={isEdit ? "Enter new password (optional)" : "Enter secure password"}
        />
        <Input
          type="password"
          label="Confirm Password"
          name="conform_password"
          placeholder="Re-enter password"
          isRequired={!isEdit}
          register={register}
          errors={errors}
        />
      </div>

      <div className="border-t border-border pt-6 space-y-6 text-left">
        <h4 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Switch
              control={control}
              name="is_app_2fa_enabled"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="App 2FA Disabled"
              trueLabel="App 2FA Enabled"
            />
            {isAppEnabled && (
              <div className="mt-2 space-y-1.5 text-left text-xs">
                <p className="text-muted-foreground flex items-start gap-1">
                  <Info className="mt-0 h-3.5 w-3.5 flex-shrink-0" />
                  User must download our Mail 25 App to get the OTP.
                </p>
                <div className="flex flex-wrap gap-3 pl-5">
                  <button
                    type="button"
                    onClick={() => setQrModalStore("ios")}
                    className="text-primary hover:underline"
                  >
                    Download on the App Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrModalStore("android")}
                    className="text-primary hover:underline"
                  >
                    Get it on Google Play
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Switch
              control={control}
              name="is_sms_2fa_enabled"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="SMS 2FA Disabled"
              trueLabel="SMS 2FA Enabled"
            />
            {isSmsEnabled && (
              <p
                className={`mt-2 flex items-start gap-1 text-left text-xs ${primaryPhone ? "text-muted-foreground" : "text-warning"}`}
              >
                {primaryPhone ? (
                  <>
                    <Info className="mt-0 h-3.5 w-3.5 flex-shrink-0" />
                    Codes will be sent to {primaryPhone}.
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mt-0 h-3.5 w-3.5 flex-shrink-0" />
                    Add a primary phone number in the previous step for SMS 2FA to work.
                  </>
                )}
              </p>
            )}
          </div>

          <div>
            <Switch
              control={control}
              name="is_email_2fa_enabled"
              register={register}
              watch={watch}
              errors={errors}
              falseLabel="Email 2FA Disabled"
              trueLabel="Email 2FA Enabled"
            />
            {isEmailEnabled && (
              <p
                className={`mt-2 flex items-start gap-1 text-left text-xs ${secondaryEmail ? "text-muted-foreground" : "text-warning"}`}
              >
                {secondaryEmail ? (
                  <>
                    <Info className="mt-0 h-3.5 w-3.5 flex-shrink-0" />
                    Codes will be sent to {secondaryEmail}.
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mt-0 h-3.5 w-3.5 flex-shrink-0" />
                    Add a secondary email in the previous step — it's mandatory once Email 2FA is enabled.
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <EditModelBox
        isOpen={!!qrModalStore}
        label={qrModalStore === "ios" ? "Scan to download on the App Store" : "Scan to get it on Google Play"}
        handleCancel={() => setQrModalStore(null)}
      >
        <div className="flex flex-col items-center gap-4 p-2">
          <QRCodeSVG
            value={qrModalStore === "ios" ? APP_STORE_LINKS.ios : APP_STORE_LINKS.android}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin
          />
          <p className="text-muted-foreground text-center text-xs break-all">
            {qrModalStore === "ios" ? APP_STORE_LINKS.ios : APP_STORE_LINKS.android}
          </p>
        </div>
      </EditModelBox>
    </div>
  );
}

export default PasswordSetupStep;
