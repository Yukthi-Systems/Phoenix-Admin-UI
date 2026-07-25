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

import { useState, useEffect } from "react";

const ResendButtonWithTimer = ({ onResend = () => {}, initialTimer = 30 }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialTimer);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;

    if (!canResend) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [canResend]);

  const handleResend = () => {
    if (!canResend) return;

    onResend?.();
    setCanResend(false);
    setSecondsLeft(initialTimer);
  };

  // Format secondsLeft as m:ss
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-center mt-2">
      {canResend ? (
        <button
          onClick={handleResend}
          className="px-2 text-sm py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Resend Again
        </button>
      ) : (
        <p className="text-gray-500 text-sm">
          Resend in {formatTime(secondsLeft)}
        </p>
      )}
    </div>
  );
};

export default ResendButtonWithTimer;
