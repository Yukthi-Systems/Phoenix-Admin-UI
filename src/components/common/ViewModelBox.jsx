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
import { useEffect } from "react";

function ViewModelBox({
  isOpen = false,
  label = "",
  showCancel = true,
  handleCancel = () => {},
  children,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[4px] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg w-[60vw] max-w-[80vw] max-h-[90vh] overflow-hidden shadow-lg border border-border flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-medium text-card-foreground">{label}</p>
          {showCancel && (
            <span
              className="text-destructive cursor-pointer hover:opacity-70 transition-opacity"
              onClick={handleCancel}
            >
              <CircleX size={25} />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default ViewModelBox;
