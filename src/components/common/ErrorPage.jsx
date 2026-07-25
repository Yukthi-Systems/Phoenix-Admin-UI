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

import React, { useState, useRef } from "react";
import { CircleX, LogOut, AlertTriangle, RotateCcw } from "lucide-react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Cookies from "js-cookie";

export default function ErrorPage() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const error = useRouteError();
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      switch (error.status) {
        case 404:
          return "Page Not Found";
        case 401:
          return "Unauthorized Access";
        case 403:
          return "Forbidden Access";
        case 500:
          return "Internal Server Error";
        default:
          return error.statusText || "Unexpected Error Occurred";
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  };

  const handleLogout = () => {
    try {
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, {
          path: "/",
          domain: window.location.hostname,
        });
      });
      localStorage.clear();
      window.location.href = "/login";
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleLogoutOpen = () => {
    setLogoutOpen(true);
  };

  const handleClose = () => {
    setLogoutOpen(false);
  };

  const handleLogoutBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1),transparent_50%)] pointer-events-none" />

        <div
          className="relative w-full max-w-md"
          ref={cardRef}
          onMouseMove={handleMouseMove}
        >
          <div
            className="relative w-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-8 
            before:absolute before:inset-0 before:rounded-2xl 
            before:opacity-0 before:transition-opacity before:duration-500 
            before:bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.1),transparent_40%)]
            hover:before:opacity-100 
            overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-destructive/80 to-destructive" />

            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                Oops! Something Went Wrong
              </h1>

              <p className="text-muted-foreground text-lg mb-6">
                {getErrorMessage()}
              </p>

              <div className="flex justify-center space-x-4 relative z-[100]">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 rounded-md 
                    bg-primary/10 text-primary hover:bg-primary/20 
                    transition-colors font-medium"
                >
                  <RotateCcw size={16} />
                  Retry
                </button>
                <button
                  onClick={handleLogoutOpen}
                  className="flex items-center gap-2 px-4 py-2 rounded-md 
                    bg-destructive/10 text-destructive hover:bg-destructive/20 
                    transition-colors font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm 
            flex items-center justify-center p-4"
          onClick={handleLogoutBackdropClick}
        >
          <div
            className="bg-card rounded-xl w-full max-w-md 
            border border-border shadow-2xl overflow-hidden 
            animate-scale-in"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full 
                    bg-destructive/10 flex items-center justify-center"
                  >
                    <LogOut size={24} className="text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground text-left">
                      Confirm Logout
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to sign out?
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-destructive 
                    transition-colors"
                >
                  <CircleX size={24} />
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md 
                    border border-border bg-card 
                    text-card-foreground hover:bg-accent 
                    transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md 
                    bg-destructive text-destructive-foreground 
                    hover:bg-destructive/90 
                    transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
