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

import React, { useEffect, useRef, useState } from "react";
import { MessageSquareDot, X, Bell, BellOff, ChevronRight } from "lucide-react";
import NotificationDetailsModal from "./NotificationDetailsModal";
import ProfilePicture from "@/pages/profile/ProfilePic";
import { useUserTimezone } from "@/hooks/useTimezone";
import NotificationToggle from "./NotificationToggle";
import { useAtom } from "jotai";
import { uiInfoAtom as uiInfoAtomStorage } from "@/store/uiInfo";
import { useGetUserUiInfo } from "@/hooks/useUser";

const Notifications = ({
  list = [],
  clear = () => {},
  handleNotificationToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState({});
  const { data: apiUiInfoData } = useGetUserUiInfo();
  const menuRef = useRef(null);
  const { formatUserDateNice } = useUserTimezone();

  const [uiInfoAtom] = useAtom(uiInfoAtomStorage);
  const apiUiInfo = apiUiInfoData?.ui_info;

  const getNotificationsEnabled = () => {
    if (uiInfoAtom?.notifications?.enabled !== undefined) {
      return uiInfoAtom.notifications.enabled;
    }

    if (apiUiInfo?.notifications?.enabled !== undefined) {
      return apiUiInfo.notifications.enabled;
    }
    return true;
  };

  const notificationsEnabled = getNotificationsEnabled();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShow = (row) => {
    setSelected(row);
    setShow(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setShow(false);
    setSelected({});
  };

  const handleClearAll = () => {
    clear();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-accent/50 focus:ring-primary/20 group relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 focus:ring-2 focus:outline-none"
        >
          {list.length > 0 && notificationsEnabled && (
            <div className="border-background absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-red-500 text-[9px] font-semibold text-white shadow-sm">
              {list.length > 9 ? "9+" : list.length}
            </div>
          )}

          {notificationsEnabled ? (
            <Bell
              strokeWidth={1.5}
              className="text-foreground group-hover:text-foreground h-5 w-5 transition-colors"
            />
          ) : (
            <BellOff
              strokeWidth={1.5}
              className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors"
            />
          )}
        </button>

        {isOpen && (
          <div className="bg-card/80 border-border/50 absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
            <div className="border-border/30 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    notificationsEnabled ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {notificationsEnabled ? (
                    <Bell className="text-primary h-3.5 w-3.5" />
                  ) : (
                    <BellOff className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-foreground text-sm font-medium">
                    Notifications
                  </h2>
                </div>

                {list.length > 0 && notificationsEnabled && (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium">
                    {list.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {list.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md px-2.5 py-1 text-xs transition-all duration-200"
                  >
                    Clear all
                  </button>
                )}

                <NotificationToggle onToggle={handleNotificationToggle} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-accent/50 rounded-md p-1.5 transition-colors"
                >
                  <X className="text-muted-foreground h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="scrollbar-thin scrollbar-thumb-border/20 max-h-[28rem] overflow-y-auto">
              {!notificationsEnabled ? (
                <div className="flex flex-col items-center justify-center px-6 py-16">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-100 bg-red-50 dark:border-red-800/30 dark:bg-red-900/20">
                    <BellOff className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-foreground mb-1 text-sm font-medium">
                    Notifications Disabled
                  </h3>
                  <p className="text-muted-foreground mb-3 text-center text-xs leading-relaxed">
                    You won't receive real-time notifications.
                    <br />
                    Enable notifications to stay updated.
                  </p>
                </div>
              ) : list.length > 0 ? (
                <div className="space-y-1 p-2">
                  {list.map((item, idx) => (
                    <div
                      className="group hover:bg-accent/30 hover:border-border/20 relative cursor-pointer rounded-lg border border-transparent bg-transparent p-3 transition-all duration-200"
                      key={idx}
                      onClick={() => handleShow(item)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          <ProfilePicture
                            userId={item.user_id}
                            showStatus={false}
                            showUpload={false}
                            displayName={item.user_name}
                            size="xs"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-foreground line-clamp-2 text-sm leading-relaxed font-normal">
                            {item?.details?.message || "No message available"}
                          </p>

                          <div className="flex items-center">
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                              <span className="font-medium">
                                {item?.user_name || "System"}
                              </span>
                              <span className="bg-muted-foreground/40 h-1 w-1 rounded-full"></span>
                            </div>
                            <span className="text-muted-foreground/60 ml-2 text-left text-xs text-nowrap">
                              {formatUserDateNice(
                                item?.details?.action_timestamp,
                                "relative",
                              ) || "now"}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <ChevronRight className="text-muted-foreground/60 h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-16">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-100 bg-green-50 dark:border-green-800/30 dark:bg-green-900/20">
                    <Bell className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-foreground mb-1 text-sm font-medium">
                    All caught up!
                  </h3>
                  <p className="text-muted-foreground text-center text-xs leading-relaxed">
                    No new notifications right now.
                    <br />
                    We'll notify you when something happens.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <NotificationDetailsModal
        isOpen={show}
        notification={selected}
        onClose={handleCancel}
      />
    </>
  );
};

export default Notifications;
