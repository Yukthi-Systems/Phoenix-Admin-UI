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

import { CircleX } from "lucide-react";

function EditModelBox({
  isOpen = false,
  label = "",
  showCancel = true,
  handleCancel = () => {},
  children,
  outsideClick = true,
  // "default" keeps the existing bounded-dialog sizing every other caller
  // relies on. "large" is for content-heavy flows (e.g. the 2FA setup
  // wizard) that need real estate: it goes edge-to-edge full screen on
  // small viewports (avoiding a scroll-within-a-scroll) and settles into
  // a big-but-bounded dialog from `sm` up.
  size = "default",
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && outsideClick) {
      handleCancel();
    }
  };

  const sizeClasses =
    size === "large"
      ? "w-full h-full rounded-none sm:w-[90vw] sm:h-auto sm:max-w-4xl sm:max-h-[92vh] sm:rounded-lg"
      : "min-w-sm max-w-[80vw] max-h-[90vh] rounded-lg";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[4px] flex items-center justify-center"
          onMouseDown={handleBackdropClick}
        >
          {/* Added 'flex flex-col' to handle layout and scrolling properly */}
          <div className={`bg-card ${sizeClasses} flex flex-col overflow-hidden shadow-lg p-4 border border-border`}>
            {/* Added 'flex-shrink-0' to prevent header from shrinking */}
            <div className="w-auto flex justify-between items-center mb-2 flex-shrink-0">
              <p className="text-xl font-medium text-card-foreground">
                {label || ""}
              </p>
              {showCancel && (
                <span
                  className="text-destructive cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={handleCancel}
                >
                  <CircleX size={25} />
                </span>
              )}
            </div>
            {/* Changed to 'flex-1' and 'min-h-0' to ensure it takes remaining height and scrolls */}
            <div className="w-full overflow-y-auto flex-1 min-h-0">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditModelBox;