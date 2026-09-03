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

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Non-modal right-side slide-over. Deliberately has no backdrop so the user
 * can keep interacting with the form while reading. Closes on Esc or the
 * close button.
 */
const DocDrawer = ({ open, onClose, title = "Documentation", children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return createPortal(
    <div
      className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l shadow-2xl transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      } bg-card border-border`}
      role="complementary"
      aria-hidden={!open}
    >
      <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
        <p className="text-card-foreground text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close documentation"
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default DocDrawer;
