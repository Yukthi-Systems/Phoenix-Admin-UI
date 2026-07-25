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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useValidateUsername } from "../../hooks/useUser";
import { Input } from "./Inputs";

const UsernameInput = ({
  label = "User Name",
  name = "user_name",
  register,
  errors,
  watch,
  customStyle = "",
  disabled = false,
  placeholder,
  originalUsername = null,
  isRequired = false,
}) => {
  const currentValue = watch(name) || "";

  const shouldValidate = !originalUsername || currentValue !== originalUsername;

  const usernameValidation = shouldValidate
    ? useValidateUsername(currentValue)
    : { isLoading: false, isValid: null, isDebouncing: false, error: null };

  const getValidationState = () => {
    if (!currentValue || currentValue.length < 3) {
      return null;
    }

    if (originalUsername && currentValue === originalUsername) {
      return null;
    }

    if (usernameValidation.isDebouncing || usernameValidation.isLoading) {
      return "loading";
    }

    if (usernameValidation.error) {
      return "error";
    }

    return usernameValidation.isValid ? "valid" : "invalid";
  };

  const validationState = getValidationState();

  const getBorderColor = () => {
    if (validationState === "valid") return "border-success";
    if (validationState === "invalid") return "border-destructive";
    return "";
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case "loading":
        return (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        );
      case "valid":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    if (originalUsername && currentValue === originalUsername) {
      return "";
    }

    if (currentValue && currentValue.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (validationState === "valid") {
      return "Username is available";
    }

    if (validationState === "invalid") {
      return usernameValidation.data?.message || "Username is not available";
    }

    if (usernameValidation.error) {
      return "Error checking username availability";
    }

    return "";
  };

  const getInfoColor = () => {
    if (validationState === "valid") return "text-success";
    if (validationState === "invalid") return "text-destructive";
    return "text-muted-foreground";
  };

  const validationMessage = getValidationMessage();
  const infoWithColor = validationMessage ? (
    <span className={getInfoColor()}>{validationMessage}</span>
  ) : (
    ""
  );

  return (
    <Input
      label={label}
      name={name}
      register={register}
      placeholder={placeholder}
      errors={errors}
      customStyle={customStyle}
      disabled={disabled}
      icon={getValidationIcon()}
      info={infoWithColor}
      borderColor={getBorderColor()}
      isRequired={isRequired}
    />
  );
};

export default UsernameInput;
