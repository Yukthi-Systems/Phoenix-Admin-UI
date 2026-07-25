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

import React, { useState, useEffect } from "react";
import { Shield, Check } from "lucide-react";
import { useSyncedUiInfo } from "@/hooks/useSyncedUiInfo"; // ✅ New Hook
import { useToastify } from "@/hooks/useToastify";
import { useBrowserNotification } from "@/hooks/useBrowserNotification";

const NotificationToggle = ({ onToggle }) => {
  // ✅ Replaced manual state/query logic with the centralized hook
  const { uiInfo, updateUiInfo, isLoading, isSaving } = useSyncedUiInfo();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const toast = useToastify();

  const {
    permission: browserPermission,
    isSupported: isBrowserSupported,
    isGranted: isBrowserGranted,
    requestPermission,
    isRequesting,
    getDebugInfo,
  } = useBrowserNotification();

  // Enhanced logging for NotificationToggle
  const toggleLog = (level, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `🔘 [${timestamp}] NotificationToggle:`;

    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  };

  // ✅ Simplified retrieval of settings using safe hook data
  const isNotificationsEnabled = uiInfo?.notifications?.enabled ?? true;

  // ✅ Unified Store Function using safe merge hook
  const storeNotificationSettings = (enabled, skipApiCall = false) => {
    toggleLog("info", "Storing notification settings", {
      enabled,
      skipApiCall,
      browserPermission,
      debugInfo: getDebugInfo(),
    });

    const currentNotifications = uiInfo?.notifications || {};

    updateUiInfo(
      {
        notifications: {
          ...currentNotifications,
          enabled,
          browser_enabled: enabled && isBrowserGranted,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        localOnly: skipApiCall,
        onSuccess: () => {
          toggleLog("info", "Notification settings saved to server successfully");
          toast("success", `Notifications ${enabled ? "enabled" : "disabled"}`);
        },
        onError: (error) => {
          toggleLog("error", "Failed to save notification settings to server", {
            error: error.message,
          });
          toast("error", "Failed to save notification settings");
        },
      }
    );
  };

  // Enhanced initialization
  useEffect(() => {
    // Wait for the hook to sync with server
    if (isLoading || isInitialized) return;

    toggleLog("info", "Initializing notification settings...", {
      isLoading,
      uiInfoExists: !!uiInfo,
      browserSupported: isBrowserSupported,
      browserPermission,
    });

    // Auto-request permission for new users who enable notifications
    if (
      isNotificationsEnabled &&
      isBrowserSupported &&
      browserPermission === "default"
    ) {
      toggleLog("info", "Auto-requesting browser notification permission...");
      requestPermission()
        .then((result) => {
          toggleLog("info", "Auto-request permission completed", { result });
        })
        .catch((err) => {
          toggleLog("warn", "Auto-request permission failed", {
            error: err.message,
          });
        });
    }

    if (onToggle) {
      onToggle(isNotificationsEnabled);
    }

    setIsInitialized(true);
  }, [
    uiInfo,
    isLoading,
    isInitialized,
    onToggle,
    isBrowserSupported,
    browserPermission,
    requestPermission,
    getDebugInfo,
    isNotificationsEnabled
  ]);

  const handleToggle = async () => {
    const newState = !isNotificationsEnabled;
    toggleLog("info", "Notification toggle clicked", {
      currentState: isNotificationsEnabled,
      newState,
      browserPermission,
      isBrowserSupported,
    });

    if (newState && isBrowserSupported) {
      if (browserPermission === "default") {
        toggleLog("info", "Showing permission modal for first-time users");
        setShowPermissionModal(true);
        return;
      } else if (browserPermission === "denied") {
        toggleLog("warn", "Browser notifications are blocked by user");
        toast(
          "warning",
          "Browser notifications are blocked. You'll only see in-app notifications.",
        );
      }
    }

    storeNotificationSettings(newState, false);

    if (onToggle) {
      onToggle(newState);
    }
  };

  const handlePermissionRequest = async () => {
    toggleLog("info", "User requested browser notification permission");

    try {
      const permission = await requestPermission();

      toggleLog("info", "Permission request completed", { permission });

      setShowPermissionModal(false);

      if (permission === "granted") {
        storeNotificationSettings(true, false);
        if (onToggle) onToggle(true);
        toast("success", "Notifications enabled with browser support!");
      } else if (permission === "denied") {
        storeNotificationSettings(true, false);
        if (onToggle) onToggle(true);
        toast(
          "warning",
          "Notifications enabled, but browser notifications are blocked.",
        );
      }
    } catch (error) {
      toggleLog("error", "Error requesting permission", {
        error: error.message,
      });
      setShowPermissionModal(false);
      storeNotificationSettings(true, false);
      if (onToggle) onToggle(true);
      toast(
        "warning",
        "Notifications enabled, but browser notifications may not work.",
      );
    }
  };

  const handlePermissionCancel = () => {
    toggleLog("info", "User cancelled permission request");
    setShowPermissionModal(false);
    storeNotificationSettings(true, false);
    if (onToggle) onToggle(true);
    toast("success", "Notifications enabled (in-app only)");
  };

  // Check isLoading from the hook
  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg opacity-50">
        <div className="w-5 h-5 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center">
        <button
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
            isNotificationsEnabled
              ? "text-foreground hover:bg-accent"
              : "text-muted-foreground hover:bg-accent"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={`${isNotificationsEnabled ? "Disable" : "Enable"} notifications`}
        >
          <div
            className={`w-11 h-6 rounded-full border-2 transition-all duration-200 ${
              isNotificationsEnabled
                ? "bg-primary border-primary"
                : "bg-muted border-border"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all duration-200 transform ${
                isNotificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>

          {/* Browser notification status indicator */}
          {isNotificationsEnabled && isBrowserSupported && (
            <div
              className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-background ${
                isBrowserGranted ? "bg-green-500" : "bg-yellow-500"
              }`}
              title={
                isBrowserGranted
                  ? "Browser notifications enabled"
                  : "Browser notifications not allowed"
              }
            />
          )}

          {/* Saving indicator */}
          {isSaving && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-2xl border border-border max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Enable Browser Notifications
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Allow browser notifications to get notified even when the app is
              closed or you're on another tab. You can still use notifications
              without this permission.
            </p>

            <div className="bg-muted/30 rounded-lg p-3 mb-6">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Platform: {navigator.platform}</div>
                <div>
                  Browser Support: {isBrowserSupported ? "✅ Yes" : "❌ No"}
                </div>
                <div>Current Permission: {browserPermission}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePermissionCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handlePermissionRequest}
                disabled={isRequesting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRequesting ? (
                  <>
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Allow Browser Notifications
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationToggle;