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

import { useEffect, useRef } from "react";
import Cookies from "js-cookie";

export const useSessionMonitor = () => {
  const intervalRef = useRef(null);
  const isLoggingOutRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    // Wait 2 seconds after component mount before starting to monitor
    const startupTimeout = setTimeout(() => {
      hasInitializedRef.current = true;

      const clearSessionAndLogout = () => {
        if (isLoggingOutRef.current) {
          return;
        }

        isLoggingOutRef.current = true;

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Clear all cookies (including HttpOnly ones will be cleared by backend)
        Object.keys(Cookies.get()).forEach((cookieName) => {
          Cookies.remove(cookieName, { path: "/" });
          Cookies.remove(cookieName, { path: "/", domain: ".yukthi.net" });
          Cookies.remove(cookieName, { path: "/", domain: "yukthi.net" });
        });

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/login";
      };

      const checkSession = () => {
        if (isLoggingOutRef.current) {
          return;
        }

        const isSessionValid = Cookies.get("IS_SESSION_VALID");

        if (!isSessionValid) {
          console.warn("IS_SESSION_VALID cookie missing");
          clearSessionAndLogout();
          return;
        }
      };

      // Check immediately
      checkSession();

      // Check every 5 seconds
      intervalRef.current = setInterval(checkSession, 5000);

      // Cross-tab sync
      const handleStorageChange = (e) => {
        if (isLoggingOutRef.current) return;
        if (e.key === null) {
          console.warn("Storage cleared in another tab");
          clearSessionAndLogout();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Check when tab becomes visible
      const handleVisibilityChange = () => {
        if (isLoggingOutRef.current) return;
        if (document.visibilityState === "visible") {
          setTimeout(checkSession, 500);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        window.removeEventListener("storage", handleStorageChange);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }, 2000); // 2 second delay

    return () => {
      clearTimeout(startupTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
