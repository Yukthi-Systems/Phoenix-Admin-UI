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
import { useSetAtom } from "jotai";
import { userProfileAtom, profilePicturesAtom } from "@/store/userProfile";
import { useLogout } from "./useLogout";

const useDisableDevTools = () => {
  const devToolsEnabled = useRef(false);
  const checkCount = useRef(0);
  const nukingRef = useRef(false);
  const { mutate: logoutMutate } = useLogout();
  const setUserProfile = useSetAtom(userProfileAtom);
  const setProfilePictures = useSetAtom(profilePicturesAtom);

  useEffect(() => {
    if (import.meta.env.MODE !== "development") {
      const handleKeyDown = (e) => {
        if (e.ctrlKey && e.shiftKey && e.altKey && e.key === "F12") {
          e.preventDefault();
          devToolsEnabled.current = !devToolsEnabled.current;
          return false;
        }

        if (!devToolsEnabled.current) {
          if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && e.key === "I") ||
            (e.ctrlKey && e.shiftKey && e.key === "J") ||
            (e.ctrlKey && e.key === "u") ||
            (e.ctrlKey && e.key === "s")
          ) {
            e.preventDefault();
            return false;
          }
        }
      };

      const detectDevTools = () => {
        if (devToolsEnabled.current || nukingRef.current) return;

        // More lenient thresholds to avoid false positives
        const widthThreshold = window.outerWidth - window.innerWidth > 250;
        const heightThreshold = window.outerHeight - window.innerHeight > 250;

        // Only check size differences, remove debugger timing check
        if (widthThreshold || heightThreshold) {
          checkCount.current++;
          // Require 5 consecutive detections instead of 2
          if (checkCount.current >= 5) {
            nukeEverything();
          }
        } else {
          // Reset more gradually
          if (checkCount.current > 0) {
            checkCount.current--;
          }
        }
      };

      const nukeEverything = () => {
        if (nukingRef.current) return;
        nukingRef.current = true;

        console.clear();
        setUserProfile({});
        setProfilePictures({});
        localStorage.clear();
        sessionStorage.clear();

        document.cookie.split(";").forEach((c) => {
          const name = c.split("=")[0].trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        });

        if (window.indexedDB) {
          indexedDB.databases().then((dbs) => {
            dbs.forEach((db) => indexedDB.deleteDatabase(db.name));
          });
        }

        logoutMutate(undefined, {
          onSettled: () => {
            window.location.href = "/login";
          },
        });
      };

      // Check less frequently: 2 seconds instead of 500ms
      const interval = setInterval(detectDevTools, 2000);

      // Remove resize listener as it was too sensitive
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        clearInterval(interval);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [logoutMutate, setUserProfile, setProfilePictures]);
};

export default useDisableDevTools;