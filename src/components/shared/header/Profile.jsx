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

import { useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  LogOut,
  X,
  User,
  CircleX,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useToastify } from "@/hooks/useToastify";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { profilePicturesAtom } from "@/store/userProfile";
import ProfilePicture from "@/pages/profile/ProfilePic";
import { useTranslation } from "react-i18next";
import { useGetMaintenanceStatus } from "@/hooks/useMaintenanceStatus";
import { parseISO } from "date-fns";

const Profile = ({ userDetails }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [profilePic] = useAtom(profilePicturesAtom);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef(null);
  const { mutate, isPending } = useLogout();
  const navigate = useNavigate();
  const toast = useToastify();
  const { data: statusData } = useGetMaintenanceStatus();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfile = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate("/profile");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    mutate(null, {
      onSuccess: () => {
        setLogoutOpen(false);
        toast("success", "Logout successful.");
        window.location.href = "/login";
      },
      onError: (error) => {
        toast("error", "Logout failed. Please try again.");
        console.error("Logout error:", error);
      },
    });
  };

  const handleLogoutOpen = () => {
    setLogoutOpen(true);
    setIsOpen(false);
  };

  const handleClose = () => {
    setLogoutOpen(false);
  };

  const handleLogoutBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setLogoutOpen(false);
    }
  };

  const handleStatusClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate("/status");
  };

  const handleTicketClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    navigate("support/tickets?modal=open");
  };

  // Calculate alert counts
  const alertCounts = { active: 0, upcoming: 0 };
  if (statusData?.data) {
    const now = new Date();
    alertCounts.active = statusData.data.filter((item) => {
      try {
        const start = parseISO(item.start_time);
        const end = parseISO(item.end_time);
        return start < now && end > now;
      } catch {
        return false;
      }
    }).length;

    alertCounts.upcoming = statusData.data.filter((item) => {
      try {
        return parseISO(item.start_time) > now;
      } catch {
        return false;
      }
    }).length;
  }

  const totalAlerts = alertCounts.active + alertCounts.upcoming;
  const displayName = userDetails?.display_name || "Guest";

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
        >
          <ProfilePicture size="xs" showUpload={false} showStatus={false} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg shadow-lg border border-border z-[1000] overflow-hidden">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pb-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <ProfilePicture
                  size="small"
                  showUpload={false}
                  showStatus={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-card-foreground truncate">
                    {displayName}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    @{userDetails?.user_name || "user"}
                  </div>
                </div>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-muted cursor-pointer text-sm text-card-foreground transition-colors"
              >
                <User size={16} className="text-muted-foreground" />
                My Profile
              </button>

              {/* <button
                onClick={handleTicketClick}
                className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-muted cursor-pointer text-sm text-card-foreground transition-colors"
              >
                <Ticket size={16} className="text-muted-foreground" />
                Raise a Ticket
              </button> */}
              {totalAlerts > 0 && (
                <>
                  <button
                    onClick={handleStatusClick}
                    className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-warning/10 cursor-pointer text-sm text-warning transition-colors"
                  >
                    <AlertCircle size={16} className="text-warning" />
                    <div className="flex-1">
                      <span>System Status</span>
                      <span className="ml-1 font-semibold">
                        ({totalAlerts})
                      </span>
                    </div>
                  </button>
                  <div className="border-t border-border my-1" />
                </>
              )}
              <button
                onClick={handleLogoutOpen}
                className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-destructive/10 cursor-pointer text-sm text-destructive transition-colors"
              >
                <LogOut size={16} className="text-destructive" />
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px] flex items-center justify-center"
          onClick={handleLogoutBackdropClick}
        >
          <div className="bg-card rounded-lg w-[90%] max-w-sm overflow-hidden shadow-lg border border-border">
            <div className="flex justify-end p-3">
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-destructive transition-colors"
                disabled={isPending}
              >
                <CircleX size={20} />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <LogOut size={20} className="text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-card-foreground">
                    Confirm Logout
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to Logout?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-4 py-2 rounded-md border border-border bg-card text-card-foreground hover:bg-muted font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground"></div>
                      Loging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
