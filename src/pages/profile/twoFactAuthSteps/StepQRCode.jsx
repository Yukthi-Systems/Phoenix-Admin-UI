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
import QRCodeComponent from "./QRCodeComponent";
import {
  MoveRight,
  QrCode,
  Copy,
  Check,
  Key,
  Smartphone,
  Info,
} from "lucide-react";
import { Button } from "@/components/common/Buttons";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

const StepQRCode = ({
  qrData,
  qrCodeType,
  setQrCodeType = () => {},
  onNext = () => {},
  isPending = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getHeaderConfig = () => {
    if (qrCodeType === "qr") {
      return {
        icon: QrCode,
        title: "Scan QR Code",
        subtitle: "Use your authenticator app to scan the QR code below",
      };
    } else if (qrCodeType === "code") {
      return {
        icon: Key,
        title: "Manual Setup",
        subtitle: "Enter the secret key manually in your authenticator app",
      };
    }
    return {
      icon: QrCode,
      title: "Setup Authenticator",
      subtitle: "Loading...",
    };
  };

  const headerConfig = getHeaderConfig();
  const HeaderIcon = headerConfig.icon;

  if (!qrData) {
    return (
      <div className="w-full h-[60vh] flex flex-col bg-card">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading QR code...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[60vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={HeaderIcon}
        title={headerConfig.title}
        subtitle={headerConfig.subtitle}
      />

      {/* Content Area */}
      <div className="flex-1 py-6 overflow-y-auto no-scrollbar">
        <div className="max-w-lg mx-auto space-y-6">
          {/* QR Code View */}
          {qrCodeType === "qr" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-background border-2 border-primary/20 rounded-xl shadow-sm">
                  {qrData?.uri ? (
                    <div className="w-60 h-60 flex items-center justify-center">
                      <QRCodeComponent uri={qrData.uri} />
                    </div>
                  ) : (
                    <div className="w-60 h-60 flex items-center justify-center bg-muted rounded-lg">
                      <p className="text-muted-foreground">
                        Loading QR code...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <InstructionCard
                icon={Smartphone}
                title="How to scan"
                message="Open your authenticator app and scan this QR code to add your account."
                variant="info"
              />

              <div className="text-center">
                <button
                  onClick={() => setQrCodeType("code")}
                  className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                >
                  Can't scan? Enter code manually
                </button>
              </div>
            </div>
          )}

          {/* Manual Code View */}
          {qrCodeType === "code" && (
            <div className="space-y-4">
              {/* Secret Code Display */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-card-foreground text-left">
                  Secret Key
                </label>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-lg font-mono text-card-foreground break-all">
                      {qrData?.secret || ""}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(qrData?.secret || "")}
                      icon={copied ? Check : Copy}
                      className="flex-shrink-0"
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <InstructionCard
                icon={Key}
                title="Manual setup"
                message="Copy this secret key and enter it manually in your authenticator app."
                variant="info"
              />

              {/* Success Message */}
              {copied && (
                <InstructionCard
                  icon={Check}
                  title="Secret key copied to clipboard!"
                  message=""
                  variant="success"
                />
              )}

              {/* Switch to QR */}
              <div className="text-center">
                <button
                  onClick={() => setQrCodeType("qr")}
                  className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                >
                  Prefer to scan? Show QR code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 border-t m-2 border-border">
        <Button
          variant="primary"
          size="lg"
          disabled={isPending}
          onClick={onNext}
          icon={MoveRight}
          iconPosition="right"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepQRCode;
