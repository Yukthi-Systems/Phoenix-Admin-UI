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

import { useCallback, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useAtomValue } from "jotai";
import { RECAPTCHA_SITE_KEY } from "@/constants/constants";
import { themeAtom } from "@/store/theme";

/**
 * reCAPTCHA state for one form. Every backend call consumes the token, so
 * call `reset()` after each attempt (success or failure).
 */
export const useRecaptcha = () => {
  const ref = useRef(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    ref.current?.reset();
    setToken(null);
  }, []);

  const widgetProps = {
    ref,
    onChange: (value) => {
      setToken(value);
      setError("");
    },
    onExpired: () => {
      setToken(null);
      setError("Security check expired. Please verify again.");
    },
    onErrored: () => {
      setToken(null);
      setError("Security check failed to load. Please refresh and try again.");
    },
  };

  return { token, error, reset, widgetProps };
};

export const RecaptchaWidget = ({ recaptcha, action }) => {
  const theme = useAtomValue(themeAtom);
  return (
    <div className="space-y-2">
      <div className="flex justify-center overflow-x-auto">
        <ReCAPTCHA
          {...recaptcha.widgetProps}
          sitekey={RECAPTCHA_SITE_KEY}
          action={action}
          theme={theme === "dark" ? "dark" : "light"}
        />
      </div>
      {recaptcha.error && (
        <p className="text-destructive text-center text-sm">
          {recaptcha.error}
        </p>
      )}
    </div>
  );
};
