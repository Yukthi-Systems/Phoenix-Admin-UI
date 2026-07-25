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

import { Button } from "@/components/common/Buttons";
import { MoveRight, Shield, Smartphone, Mail, Key } from "lucide-react";
import StepHeader from "./Stepheader";
import InstructionCard from "./InstructionCard";

const method = [
  {
    label: "Authenticator App",
    type: "authenticator",
    icon: Key,
    description: "Use an authenticator app like Google Authenticator or Authy",
  },
  {
    label: "Email",
    type: "email",
    icon: Mail,
    description: "Receive verification codes via email",
  },
  {
    label: "SMS",
    type: "sms",
    icon: Smartphone,
    description: "Receive verification codes via text message",
  },
];

const ViewMessage = ({ type }) => {
  const getMessageConfig = () => {
    switch (type) {
      case "authenticator":
        return {
          title: "About Authenticator Apps",
          message:
            "Authenticator apps are free and work offline. Download Google Authenticator, Authy, or similar apps from your device's app store.",
          icon: Key,
          variant: "info",
        };
      case "email":
        return {
          title: "Email Verification",
          message:
            "A 6-digit verification code will be sent to your registered email address. Check your inbox and spam folder.",
          icon: Mail,
          variant: "info",
        };
      case "sms":
        return {
          title: "SMS Verification",
          message:
            "A 6-digit verification code will be sent via text message. Standard messaging rates may apply.",
          icon: Smartphone,
          variant: "warning",
        };
      default:
        return null;
    }
  };

  const config = getMessageConfig();
  if (!config) return null;

  return (
    <InstructionCard
      icon={config.icon}
      title={config.title}
      message={config.message}
      variant={config.variant}
    />
  );
};

const StepSelectMethod = ({
  selectedType = "",
  setSelectedType = () => {},
  onCancel = () => {},
  onNext = () => {},
  isPending = false,
  isSMSAuth = false,
  isEmailAuth = false,
}) => {
  const availableMethods = method.filter((item) => {
    if (item.type === "sms" && isSMSAuth) return false;
    if (item.type === "email" && isEmailAuth) return false;
    return true;
  });

  return (
    <div className="w-full h-[60vh] flex flex-col bg-card">
      {/* Header */}
      <StepHeader
        icon={Shield}
        title="Two-Factor Authentication"
        subtitle="Choose your preferred authentication method"
      />

      {/* Content Area */}
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto space-y-2">
          {availableMethods.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.type;

            return (
              <div
                key={idx}
                className={`
                  group p-3 border rounded-lg cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                      : "bg-background border-border hover:border-primary/30 hover:bg-accent/30"
                  }
                `}
                onClick={() => setSelectedType(item.type)}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Radio */}
                  <div className="relative">
                    <div
                      className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground group-hover:border-primary/50"
                      }
                    `}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div
                    className={`
                    p-2 rounded-md transition-all duration-200
                    ${
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }
                  `}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`
                      font-medium text-left transition-colors duration-200
                      ${isSelected ? "text-primary" : "text-card-foreground group-hover:text-primary"}
                    `}
                    >
                      {item.label}
                    </h3>
                    <p className="text-xs text-muted-foreground text-left mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Message */}
        {selectedType && (
          <div className="max-w-md mx-auto mt-3">
            <ViewMessage type={selectedType} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t mx-2 my-1 border-border">
        <Button
          variant="secondary"
          size="lg"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          size="lg"
          disabled={isPending || !selectedType}
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

export default StepSelectMethod;
