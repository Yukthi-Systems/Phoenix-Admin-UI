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

import { useState, useEffect, useCallback, useRef } from "react";

export const useBrowserNotification = () => {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [isRequesting, setIsRequesting] = useState(false);
  const activeNotifications = useRef(new Set());
  const notificationTimeouts = useRef(new Map());

  // Enhanced logging function
  const log = (level, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `🔔 [${timestamp}] BrowserNotification:`;

    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  };

  // Track permission changes
  useEffect(() => {
    if ("Notification" in window) {
      // Check immediately
      setPermission(Notification.permission);
      
      // Poll for permission changes (since there isn't a native event for this)
      const interval = setInterval(() => {
        if (Notification.permission !== permission) {
          log("info", `Permission changed polling: ${permission} → ${Notification.permission}`);
          setPermission(Notification.permission);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [permission]);

  // Initial setup logging
  useEffect(() => {
    const isSupported = "Notification" in window;
    const platform = navigator.platform;

    log("info", "Hook Initialized", {
      supported: isSupported,
      permission: permission,
      platform: platform,
    });
  }, []);

  const requestPermission = useCallback(async () => {
    log("info", "Requesting notification permission...");

    if (!("Notification" in window)) {
      throw new Error("Browser notifications not supported");
    }

    if (Notification.permission === "granted") {
      log("info", "Permission already granted (checked directly)");
      setPermission("granted");
      return "granted";
    }

    setIsRequesting(true);

    try {
      const result = await Notification.requestPermission();
      log("info", `Permission request completed: ${result}`);
      setPermission(result);
      return result;
    } catch (error) {
      log("error", "Permission request failed", error);
      throw error;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const showNotification = useCallback(
    (title, options = {}) => {
      return new Promise((resolve) => {
        if (!("Notification" in window)) {
          resolve(null);
          return;
        }

        // Check permission directly from API to avoid state staleness
        if (Notification.permission !== "granted") {
          log("warn", `Cannot show: Permission is ${Notification.permission}`);
          resolve(null);
          return;
        }

        const isPageVisible = document.visibilityState === "visible";
        const isPageFocused = document.hasFocus();

        // LOGIC: Show if Force OR Page Hidden OR (Page Visible but NOT Focused)
        // This covers side-by-side windows or second monitors where app is visible but user is typing elsewhere
        const forceShow = options.forceShow === true;
        const shouldShow = !isPageVisible || !isPageFocused || forceShow;

        if (!shouldShow) {
          log("info", "Skipping: Page is visible and focused");
          resolve(null);
          return;
        }

        try {
          // Use a valid icon path or fallback to prevent errors
          const iconPath = options.icon || "/favicon.ico"; 

          const notification = new Notification(title, {
            icon: iconPath,
            tag: options.tag || `notification-${Date.now()}`,
            requireInteraction: false,
            silent: false,
            renotify: true,
            ...options,
          });

          activeNotifications.current.add(notification);

          // Auto-close logic
          const autoCloseTime =
            options.autoClose !== false ? options.duration || 5000 : null;
          
          if (autoCloseTime) {
            const timeoutId = setTimeout(() => {
              if (activeNotifications.current.has(notification)) {
                notification.close();
              }
            }, autoCloseTime);

            notificationTimeouts.current.set(notification, timeoutId);
          }

          notification.onclick = () => {
            if (options.onClick) options.onClick();
            window.focus();
            notification.close();
          };

          notification.onclose = () => {
            activeNotifications.current.delete(notification);
            const timeoutId = notificationTimeouts.current.get(notification);
            if (timeoutId) clearTimeout(timeoutId);
          };

          resolve(notification);
        } catch (error) {
          log("error", "Failed to create notification", error);
          resolve(null);
        }
      });
    },
    []
  );

  const showUserNotification = useCallback(
    (message, userName, timestamp, onClick = null) => {
      const title = userName || "System";
      return showNotification(title, {
        body: message || "New notification",
        tag: `user-${Date.now()}`, // Unique tag to prevent overwriting
        onClick,
        // Optional: Force show if needed for testing, defaults to false
        forceShow: false, 
      });
    },
    [showNotification]
  );

  const closeAllNotifications = useCallback(() => {
    activeNotifications.current.forEach((n) => n.close());
    activeNotifications.current.clear();
    notificationTimeouts.current.forEach((t) => clearTimeout(t));
    notificationTimeouts.current.clear();
  }, []);

  return {
    permission,
    isSupported: "Notification" in window,
    isGranted: permission === "granted",
    isRequesting,
    requestPermission,
    showNotification,
    showUserNotification,
    closeAllNotifications,
    // Safely check current state
    canShowNotifications: "Notification" in window && permission === "granted",
    getDebugInfo: () => ({
      permission,
      realPermission: "Notification" in window ? Notification.permission : "N/A",
      isSupported: "Notification" in window,
    }),
  };
};