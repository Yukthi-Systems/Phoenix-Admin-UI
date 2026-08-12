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

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const CRITICAL_THRESHOLD_MS = 60 * 1000; // 1 minute

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
};

// Reads the expiry timestamp api/auth.js's login() writes to localStorage
// from the backend's X-Session-Expiry header (sent on every /login response,
// 2FA or not - see the comment in login() for the small caveat on 2FA
// timing). Renders nothing if the key is ever absent (e.g. a session that
// predates this feature) rather than showing a wrong countdown.
// useSessionMonitor is still the actual source of truth for logging the user
// out; this is purely an informational display.
const SessionTimer = () => {
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    const tick = () => {
      const expiresAt = Number(localStorage.getItem("session_expires_at"));
      if (!expiresAt) {
        setRemainingMs(null);
        return;
      }
      setRemainingMs(expiresAt - Date.now());
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    // Keep in sync if another tab re-logs-in (new expiry) or logs out
    // (useLogout/useSessionMonitor both clear localStorage entirely).
    window.addEventListener("storage", tick);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", tick);
    };
  }, []);

  if (remainingMs === null || remainingMs <= 0) return null;

  const isCritical = remainingMs <= CRITICAL_THRESHOLD_MS;
  const isWarning = remainingMs <= WARNING_THRESHOLD_MS;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        isCritical
          ? "border-destructive/30 bg-destructive/10 text-destructive animate-pulse"
          : isWarning
            ? "border-warning/30 bg-warning/10 text-warning"
            : "border-border bg-muted/40 text-muted-foreground"
      }`}
      title="Time remaining before your session expires"
    >
      <Clock size={14} strokeWidth={2} />
      <span>{formatRemaining(remainingMs)}</span>
    </div>
  );
};

export default SessionTimer;
