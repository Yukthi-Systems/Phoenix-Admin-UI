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

import { lazy } from "react";

export const lazyRetry = (importFn) => {
  return lazy(async () => {
    const isChunkError = (error) => {
      const msg = error?.message?.toLowerCase() || "";
      return (
        error?.name === "ChunkLoadError" ||
        msg.includes("loading chunk") ||
        msg.includes("failed to fetch") ||
        msg.includes("network error")
      );
    };

    // Try 3 times with delays
    for (let i = 0; i < 3; i++) {
      try {
        const module = await importFn();
        sessionStorage.removeItem("page-has-been-reloaded");
        return module;
      } catch (error) {
        if (!isChunkError(error)) throw error;

        // On last attempt, try reload
        if (i === 2) {
          const hasReloaded = sessionStorage.getItem("page-has-been-reloaded");
          if (!hasReloaded) {
            sessionStorage.setItem("page-has-been-reloaded", "true");
            window.location.reload();
            return new Promise(() => {}); // Prevents error while reloading
          }
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Final fallback
    sessionStorage.removeItem("page-has-been-reloaded");
    throw new Error("Failed to load component after retries");
  });
};
