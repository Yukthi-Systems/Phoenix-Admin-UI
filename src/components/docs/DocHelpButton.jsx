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

import { useAtom, useAtomValue } from "jotai";
import { CircleHelp } from "lucide-react";
import { docDrawerOpenAtom, docTargetAtom } from "@/store/docs";

/**
 * Header Help affordance. Rendered only when the current page has registered
 * documentation (via `useDocTarget`); otherwise nothing shows. Toggles the
 * step-aware documentation drawer.
 */
const DocHelpButton = () => {
  const target = useAtomValue(docTargetAtom);
  const [open, setOpen] = useAtom(docDrawerOpenAtom);

  if (!target) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      title="Guide for this page"
      aria-label="Guide for this page"
      className={`hover:bg-accent relative rounded-lg p-2 transition-all duration-200 ${
        open
          ? "bg-primary/10 text-foreground ring-primary/20 ring-2"
          : "text-foreground"
      }`}
    >
      <CircleHelp size={20} strokeWidth={1.5} />
      {!open && (
        <span className="bg-primary absolute top-1 right-1 h-2 w-2 rounded-full" />
      )}
    </button>
  );
};

export default DocHelpButton;
