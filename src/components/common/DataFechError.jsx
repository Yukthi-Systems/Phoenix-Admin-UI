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

import { RotateCcw, WifiOff, RefreshCw, AlertCircle } from "lucide-react";

function DataFetchError({ content = "Network Error", hasReload = false }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] shadow-lg overflow-hidden rounded-lg bg-card border border-border flex flex-col justify-center items-center gap-6 text-primary relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-warning/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-warning/3 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Icon container */}
        <div className="relative">
          {/* Compact ring */}

          {/* Icon background */}
          <div className="relative bg-gradient-to-br from-warning/10 via-warning/5 to-warning/8 p-6 rounded-full border border-warning/20">
            <div className="bg-gradient-to-br from-background to-card p-5 rounded-full shadow-inner">
              <WifiOff
                size={56}
                className="text-warning drop-shadow-sm"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            Connection Error
          </h3>
          <p className="text-base text-muted-foreground font-medium leading-relaxed">
            {content}
          </p>

          {/* Subtle decorative line */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="h-1 w-1 rounded-full bg-warning/40"></div>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
        </div>

        {/* Retry button or info badges */}
        {hasReload ? (
          <button
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-warning-foreground bg-warning hover:bg-warning/90 border border-warning/20 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleRetry}
          >
            <RotateCcw size={16} />
            Retry Connection
          </button>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/5 border border-warning/20 text-xs text-warning cursor-default">
              <RefreshCw size={14} />
              <span>Check your connection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/5 border border-warning/20 text-xs text-warning cursor-default">
              <AlertCircle size={14} />
              <span>Try again later</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom subtle gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default DataFetchError;
