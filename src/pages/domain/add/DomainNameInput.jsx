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

// src/components/common/DomainNameInput.jsx
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

import axios from "axios";
import { Input } from "@/components/common/Inputs";
import { DNS_API_KEY } from "@/constants/constants";

const dnsURL = import.meta.env.VITE_DNS_URL || "";

const DomainNameInput = ({
  label = "Domain Name",
  name = "domain_name",
  register,
  errors,
  watch,
  customStyle = "",
  disabled = false,
  placeholder = "example.com",
  isRequired = true,
}) => {
  const [dnsValidation, setDnsValidation] = useState({
    state: null,
    isActive: false,
  });
  const [isValidating, setIsValidating] = useState(false);
  const domainName = watch(name) || "";

  useEffect(() => {
    const isValidFormat = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(
      domainName,
    );

    if (!domainName || domainName.length < 3 || !isValidFormat) {
      setDnsValidation({ state: null, isActive: false });
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const response = await axios.get(`${dnsURL}/api/dns/a-record`, {
          params: {
            domain: domainName.toLowerCase(),
          },
          headers: {
            "x-api-key": DNS_API_KEY,
          },
        });

        if (response.data.success && response.data.data.exists) {
          setDnsValidation({
            state: "valid",
            isActive: true,
          });
        } else {
          setDnsValidation({
            state: "warning",
            isActive: false,
          });
        }
      } catch (error) {
        console.error("DNS validation error:", error);

        if (error.response?.status === 401) {
          console.error(
            "API Key authentication failed. Check VITE_DNS_API_KEY.",
          );
        }

        setDnsValidation({
          state: "warning",
          isActive: false,
        });
      } finally {
        setIsValidating(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [domainName]);

  const getValidationIcon = () => {
    if (isValidating)
      return <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />;
    if (dnsValidation.state === "valid")
      return <CheckCircle className="text-success h-4 w-4" />;
    if (dnsValidation.state === "warning")
      return <AlertCircle className="text-warning h-4 w-4" />;
    return null;
  };

  const getValidationMessage = () => {
    const isValidFormat = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(
      domainName,
    );

    if (domainName && domainName.length < 3)
      return "Domain must be at least 3 characters";
    if (domainName && !isValidFormat)
      return "Invalid domain format (e.g., example.com)";

    if (dnsValidation.state === "valid") {
      return "Domain A record is active and working";
    }

    if (dnsValidation.state === "warning") {
      return "Domain A record not found or inactive";
    }

    return "";
  };

  const getBorderColor = () => {
    if (dnsValidation.state === "valid") return "border-success";
    if (dnsValidation.state === "warning") return "border-warning";
    return "";
  };

  const getInfoColor = () => {
    if (dnsValidation.state === "valid") return "text-success";
    if (dnsValidation.state === "warning") return "text-warning";
    return "text-muted-foreground";
  };

  const validationMessage = getValidationMessage();

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
      info={
        validationMessage ? (
          <span className={getInfoColor()}>{validationMessage}</span>
        ) : (
          ""
        )
      }
      borderColor={getBorderColor()}
      isRequired={isRequired}
    />
  );
};

export default DomainNameInput;
