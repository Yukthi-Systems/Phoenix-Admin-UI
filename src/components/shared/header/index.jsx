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

import { useAtom, useAtomValue } from "jotai";
import { CircleHelp, Bell } from "lucide-react";
import { themeAtom } from "@/store/theme";
import Profile from "./Profile";
import { useNavigate } from "react-router-dom";
import { userProfileAtom } from "@/store/userProfile";
import { useHelpDesk } from "@/hooks/useHelpDesk";
import { useState, useEffect, useRef } from "react";
import Organization from "./organization/Organization";
import Notifications from "./notifications/Notification";
import { notifiTokenAtom } from "@/store/notifitoken";
import { Centrifuge } from "centrifuge";
import { toast, Bounce } from "react-toastify";
import { useUserTimezone } from "@/hooks/useTimezone";
import ThemeCustomizer from "./ThemeCustomizer";
import SessionTimer from "./SessionTimer";
import { useBrowserNotification } from "@/hooks/useBrowserNotification";
import { uiInfoAtom } from "@/store/uiInfo";
import NavSearchBar from "@/components/common/LinkSearchbar";
import DocHelpButton from "@/components/docs/DocHelpButton";
import OrganizationLogo from "../OrgLogo";
import { WSS_URL } from "@/constants/constants";
import { parentOrgAtom } from "@/store/userInfo";
import { getOrganizationDetail } from "@/api/organizations";

const Header = () => {
  const [theme] = useAtom(themeAtom);
  const userDetails = useAtomValue(userProfileAtom);
  const notiToken = useAtomValue(notifiTokenAtom);
  const uiInfo = useAtomValue(uiInfoAtom);
  const [parentOrg, setParentOrg] = useAtom(parentOrgAtom);
  const { toggleHelpDesk, hasHelpForCurrentPage, isOpen, getCurrentPageData } =
    useHelpDesk();
  const [showIndicator, setShowIndicator] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isNotificationStateLoaded, setIsNotificationStateLoaded] =
    useState(false);
  const { showUserNotification, canShowNotifications, getDebugInfo } =
    useBrowserNotification();

  const token = notiToken;
  const channel = `notifications:${userDetails?.organization_id}`;
  const [messages, setMessages] = useState([]);
  const centrifugeRef = useRef(null);

  // Notification queue management
  const notificationQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const activeToastsRef = useRef(0);
  const MAX_ACTIVE_TOASTS = 3;
  const TOAST_DELAY = 800; // Delay between toasts in ms
  const MAX_QUEUE_SIZE = 10; // Maximum notifications to queue before showing summary

  const isBrowserNotificationsEnabled =
    (uiInfo?.notifications?.enabled ?? true) &&
    (uiInfo?.notifications?.browser_enabled ?? true);

  const headerLog = (level, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `📱 [${timestamp}] Header:`;

    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  };

  // Process notification queue
  const processNotificationQueue = async () => {
    if (isProcessingQueueRef.current || notificationQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;

    while (notificationQueueRef.current.length > 0) {
      // Wait if we've hit the max active toasts
      if (activeToastsRef.current >= MAX_ACTIVE_TOASTS) {
        await new Promise(resolve => setTimeout(resolve, TOAST_DELAY));
        continue;
      }

      const notification = notificationQueueRef.current.shift();

      activeToastsRef.current++;

      toast(<NotificationView item={notification} />, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: theme,
        transition: Bounce,
        onClose: () => {
          activeToastsRef.current = Math.max(0, activeToastsRef.current - 1);
        }
      });

      // Add delay between toasts
      if (notificationQueueRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, TOAST_DELAY));
      }
    }

    isProcessingQueueRef.current = false;
  };

  // Show summary notification for bulk notifications
  const showSummaryNotification = (count, latestMessage) => {
    toast(
      <div className="w-full flex items-center gap-2 mt-2.5">
        <div className="w-9 h-9 flex justify-center items-center rounded-full bg-primary/10 text-primary flex-shrink-0">
          <Bell size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-left font-medium">
            You have {count} new notifications
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Click the notification icon to view all
          </p>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: theme,
        transition: Bounce,
      }
    );
  };

  // Add notification to queue
  const queueNotification = async (message) => {
    // Add to messages list for notification panel
    setMessages((prev) => [...prev, message]);

    // Check if page is hidden (tab not active)
    const isPageHidden = document.hidden || !document.hasFocus();

    // If queue is getting too large, show summary instead
    if (notificationQueueRef.current.length >= MAX_QUEUE_SIZE) {
      headerLog("warn", "Queue full, showing summary notification", {
        queueSize: notificationQueueRef.current.length
      });

      // Clear queue and show summary
      const totalCount = notificationQueueRef.current.length + 1;
      notificationQueueRef.current = [];
      showSummaryNotification(totalCount, message);

      return;
    }

    // Add to queue
    notificationQueueRef.current.push(message);

    // Process queue
    processNotificationQueue();

    // Handle browser notifications (only if page is hidden)
    if (isPageHidden) {
      const shouldShowBrowserNotification =
        canShowNotifications && isBrowserNotificationsEnabled;

      headerLog("info", "Browser notification check (page hidden)", {
        canShowNotifications,
        isBrowserNotificationsEnabled,
        shouldShow: shouldShowBrowserNotification,
      });

      if (shouldShowBrowserNotification) {
        try {
          await showUserNotification(
            message?.details?.message || "New notification",
            message?.user_name || "System",
            message?.details?.action_timestamp,
            () => {
              headerLog("info", "Browser notification clicked - focusing window");
              window.focus();
            }
          );
        } catch (error) {
          headerLog("error", "❌ Failed to show browser notification", {
            error: error.message,
          });
        }
      }
    } else {
      headerLog("info", "Page is visible, skipping browser notification");
    }
  };

  useEffect(() => {
    if (hasHelpForCurrentPage() && !isOpen) {
      setShowIndicator(true);
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 3000);
        return () => clearTimeout(hideTimer);
      }, 500);

      return () => clearTimeout(tooltipTimer);
    } else {
      setShowIndicator(false);
      setShowTooltip(false);
    }
  }, [hasHelpForCurrentPage, isOpen]);

  const pageData = getCurrentPageData();

  const handleNotificationToggle = (enabled) => {
    headerLog("info", "Notification settings changed", { enabled });
    setNotificationsEnabled(enabled);
    setIsNotificationStateLoaded(true);

    if (!enabled && centrifugeRef.current) {
      headerLog(
        "info",
        "Disconnecting WebSocket due to notifications being disabled"
      );
      centrifugeRef.current.disconnect();
      sessionStorage.setItem("centrifugeConnected", "false");
    }
  };

  useEffect(() => {
    if (uiInfo?.notifications?.enabled !== undefined) {
      headerLog("info", "Initializing from uiInfoAtom", {
        enabled: uiInfo.notifications.enabled,
        browserEnabled: uiInfo.notifications.browser_enabled,
      });
      setNotificationsEnabled(uiInfo.notifications.enabled);
    } else {
      headerLog("info", "Using default notification settings (enabled)");
      setNotificationsEnabled(true);
    }
    setIsNotificationStateLoaded(true);
  }, [uiInfo?.notifications?.enabled]);

  useEffect(() => {
    if (!isNotificationStateLoaded) return;

    if (!notificationsEnabled) {
      headerLog(
        "warn",
        "Notifications disabled, skipping WebSocket connection"
      );
      return;
    }

    if (!token || !userDetails?.organization_id) {
      headerLog("warn", "Missing token or organization_id");
      return;
    }

    const centrifugeConnected = sessionStorage.getItem("centrifugeConnected");
    if (centrifugeConnected === "true" && centrifugeRef.current) {
      headerLog("info", "Already connected to Centrifuge in this session");
      return;
    }

    headerLog("info", "Connecting to Centrifuge...", {
      channel,
      wsUrl: `${WSS_URL}/connection/websocket`,
    });

    const centrifuge = new Centrifuge(`${WSS_URL}/connection/websocket`, {
      token,
    });

    centrifugeRef.current = centrifuge;

    const sub = centrifuge.newSubscription(channel);

    sub.on("publication", async (ctx) => {
      const userID = ctx.data?.body?.user_id || "";
      const message = ctx.data?.body || {};

      headerLog("info", "Received publication", {
        fromUser: userID,
        currentUser: userDetails?.user_id,
        messageType: message?.type || "unknown",
      });

      if (userDetails?.user_id !== userID) {
        // Queue the notification instead of showing immediately
        queueNotification(message);
      }
    });

    sub.on("subscribe", (ctx) => {
      headerLog("info", "📡 Subscribed to channel", { channel });
      sessionStorage.setItem("centrifugeConnected", "true");
    });

    sub.on("unsubscribe", () => {
      headerLog("warn", "📭 Unsubscribed from channel");
      sessionStorage.setItem("centrifugeConnected", "false");
    });

    sub.on("disconnect", () => {
      headerLog("warn", "🔌 Disconnected from channel");
      sessionStorage.setItem("centrifugeConnected", "false");
    });

    sub.subscribe();
    centrifuge.connect();

    return () => {
      headerLog("info", "🧹 Cleaning up Centrifuge connection...");
      if (centrifuge) {
        centrifuge.disconnect();
      }
      // Clear queue on unmount
      notificationQueueRef.current = [];
      sessionStorage.setItem("centrifugeConnected", "false");
    };
  }, [
    notificationsEnabled,
    isNotificationStateLoaded,
    token,
    userDetails?.organization_id,
    channel,
    canShowNotifications,
  ]);

  // Clear queue when component unmounts
  useEffect(() => {
    return () => {
      notificationQueueRef.current = [];
      isProcessingQueueRef.current = false;
      activeToastsRef.current = 0;
    };
  }, []);


  useEffect(() => {
    const fetchParentOrg = async () => {
      if (userDetails?.organization_id) {
        try {
          const data = await getOrganizationDetail(userDetails?.organization_id);
          setParentOrg({
            id: data?.organization_id,
            name: data?.organization_name,
            allocated_size: data?.quota_allocated,
            utilized_size: data?.quota_utilized,
            available_size: data?.quota_allocated - data?.quota_utilized,
            chat_service_enabled: data?.chat_service_enabled,
            email_service_enabled: data?.email_service_enabled,
            file_service_enabled: data?.file_service_enabled,
          });
        } catch (error) {
          console.error("Failed to fetch parent organization:", error);
        }
      }
    };

    fetchParentOrg();
  }, [userDetails?.organization_id, setParentOrg]);

  return (
    <div className="h-full flex items-center px-4 gap-6">
      {/* Left Section: Logo and Organization */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <OrganizationLogo rounded={false} showUpload size="xs" />
        <Organization />
      </div>

      {/* Center Section: Search */}
      <div className="flex items-center justify-center flex-1 mx-auto">
        <NavSearchBar />
      </div>

      {/* Right Section: Actions and User */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Session expiry countdown */}
        <SessionTimer />

        {/* Theme Customizer */}
        <ThemeCustomizer />

        {/* Documentation / page guide */}
        <DocHelpButton />

        {/* Help Button - disabled for v2 */}
        {/* <div className="relative">
          <button
            onClick={toggleHelpDesk}
            className={`
            relative p-2 rounded-lg transition-all duration-200
            ${hasHelpForCurrentPage()
                ? showIndicator
                  ? "hover:bg-accent text-foreground bg-primary/10 ring-2 ring-primary/20"
                  : "hover:bg-accent text-foreground"
                : "text-muted-foreground cursor-not-allowed opacity-50"
              }
          `}
            title={
              hasHelpForCurrentPage()
                ? "Open help for this page"
                : "No help available for this page"
            }
            disabled={!hasHelpForCurrentPage()}
          >
            <CircleHelp size={20} strokeWidth={1.5} />

            {showIndicator && hasHelpForCurrentPage() && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </button>

          {showTooltip && hasHelpForCurrentPage() && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-3 animate-in slide-in-from-top-2 duration-300 z-50">
              <div className="flex items-start gap-2">
                <div className="relative">
                  <CircleHelp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-card-foreground">
                    Help Available!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pageData?.title || "Get help with this page"} - Click to
                    learn more.
                  </p>
                </div>
              </div>

              <div className="absolute -top-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-border"></div>
              <div className="absolute -top-1 right-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-card"></div>
            </div>
          )}
        </div> */}

        {/* Notifications */}
        <Notifications
          list={messages}
          clear={() => setMessages([])}
          handleNotificationToggle={handleNotificationToggle}
        />

        {/* User Profile */}
        <Profile userDetails={userDetails} />
      </div>
    </div>
  );
};

export default Header;

function NotificationView({ item }) {
  const { formatUserDateNice } = useUserTimezone();

  return (
    <div className="w-full flex items-center gap-2 mt-2.5">
      <div className="w-9 h-9 flex justify-center items-center rounded-full bg-primary/10 text-primary flex-shrink-0">
        <Bell size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-left font-medium line-clamp-3">
          {item?.details?.message || ""}
        </p>
        <div className="w-full flex justify-between items-center mt-1.5 gap-2">
          <p className="text-[11px] font-medium text-muted-foreground truncate">
            by {item?.user_name || ""}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground flex-shrink-0">
            {formatUserDateNice(item?.details?.action_timestamp) || ""}
          </p>
        </div>
      </div>
    </div>
  );
}