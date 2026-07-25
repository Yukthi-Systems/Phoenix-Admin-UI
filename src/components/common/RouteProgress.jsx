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

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const RouterProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const previousPath = useRef(location.pathname);
  const progressTimers = useRef([]);
  const autoCompleteTimer = useRef(null); // NEW: Timer to auto-complete if stuck

  const startProgress = () => {
    progressTimers.current.forEach((timer) => clearTimeout(timer));
    progressTimers.current = [];

    // Clear any existing auto-complete timer
    if (autoCompleteTimer.current) {
      clearTimeout(autoCompleteTimer.current);
    }

    setIsVisible(true);
    setProgress(10);

    progressTimers.current.push(
      setTimeout(() => setProgress(30), 100),
      setTimeout(() => setProgress(50), 300),
      setTimeout(() => setProgress(70), 600),
      setTimeout(() => setProgress(85), 900),
    );

    // NEW: Auto-complete after 2 seconds if navigation didn't happen
    autoCompleteTimer.current = setTimeout(() => {
      completeProgress();
    }, 2000);
  };

  const completeProgress = () => {
    progressTimers.current.forEach((timer) => clearTimeout(timer));
    progressTimers.current = [];

    // Clear auto-complete timer
    if (autoCompleteTimer.current) {
      clearTimeout(autoCompleteTimer.current);
      autoCompleteTimer.current = null;
    }

    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 200);
  };

  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest("a[href]");
      if (
        link &&
        link.href &&
        !link.href.startsWith("mailto:") &&
        !link.href.startsWith("tel:")
      ) {
        try {
          const url = new URL(link.href);
          if (url.origin === window.location.origin) {
            const targetPath = url.pathname;

            // NEW: If clicking the same page, complete immediately
            if (targetPath === location.pathname) {
              startProgress();
              setTimeout(() => completeProgress(), 300);
            } else {
              startProgress();
            }
          }
        } catch (err) {
          startProgress();
        }
      }
    };

    const handleNavigationStart = () => {
      startProgress();
    };

    document.addEventListener("click", handleLinkClick);
    window.addEventListener("navigationStart", handleNavigationStart);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("navigationStart", handleNavigationStart);
      progressTimers.current.forEach((timer) => clearTimeout(timer));
      if (autoCompleteTimer.current) {
        clearTimeout(autoCompleteTimer.current);
      }
    };
  }, [location.pathname]); // Added location.pathname as dependency

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      if (isVisible) {
        completeProgress();
      }
    }
  }, [location.pathname, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouterProgressBar;
