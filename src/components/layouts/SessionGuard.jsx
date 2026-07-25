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
import { Monitor, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToastify } from "@/hooks/useToastify";
import { useLogout } from "@/hooks/useLogout";
import Cookies from "js-cookie";

const SessionGuard = ({ children }) => {
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);
  const cardRef = useRef(null);
  const MIN_WIDTH = 1024;
  const navigate = useNavigate();
  const toast = useToastify();
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();

  const isSessionValid = Cookies.get("IS_SESSION_VALID");

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsScreenTooSmall(window.innerWidth < MIN_WIDTH);
    };

    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // store CSS variables for spotlight position
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        toast("success", "Logged out successfully");
        window.location.href = "/login";
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message || error.message || "Logout failed";
        const tracebackId = error?.response?.data?.traceback_id;
        toast(
          "error",
          `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
        );
      },
    });
  };

  if (isScreenTooSmall) {
    return (
      <div className="from-background via-background to-muted relative flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        {/* Decorative background gradients — pointer-events-none so they never capture clicks */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1),transparent_50%)]"
          aria-hidden
        />

        <div
          className="relative z-10 w-full max-w-md"
          ref={cardRef}
          onMouseMove={handleMouseMove}
        >
          {/* Card */}
          <div className="bg-card/50 border-border/50 relative w-full overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-sm">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
              style={{
                background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent 40%)`,
                opacity: 0.0,
              }}
            />

            {/* Top gradient line */}
            <div className="from-warning via-warning/80 to-warning absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

            <div className="space-y-6 text-center">
              <div className="bg-warning/10 border-warning/20 pointer-events-none mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border">
                <Monitor className="text-warning h-8 w-8 animate-pulse" />
              </div>

              <h1 className="from-warning to-warning/70 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
                Screen Too Small
              </h1>

              <p className="text-muted-foreground mb-6 text-lg">
                This admin panel requires a larger screen to display properly.
                Please use a desktop computer or tablet in landscape mode.
              </p>

              <div className="text-muted-foreground space-y-2 text-sm">
                <p className="text-left font-medium">
                  To access the admin panel:
                </p>
                <ul className="list-inside list-disc space-y-1 text-left">
                  <li>Use a desktop or laptop computer</li>
                  <li>Rotate your tablet to landscape mode</li>
                  <li>Maximize your browser window</li>
                  <li>Reduce browser zoom (Ctrl/Cmd + minus key)</li>
                </ul>
              </div>

              {/* Logout Button */}
              {isSessionValid && (
                <div className="border-border/50 border-t pt-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    // ensure pointer cursor & clickable even if some layers are present
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20 disabled:hover:bg-destructive/10 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    // make sure button is above any decorative layer
                    style={{ position: "relative", zIndex: 20 }}
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default SessionGuard;
