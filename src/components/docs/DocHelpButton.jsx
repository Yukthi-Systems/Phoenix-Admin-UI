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
import { useNavigate } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import { docDrawerOpenAtom, docTargetAtom } from "@/store/docs";

/**
 * The single Help affordance in the header.
 * - On a page that registered docs (via `useDocTarget`): toggles the
 *   step-aware documentation drawer.
 * - Everywhere else: opens the /docs section.
 */
const DocHelpButton = () => {
  const target = useAtomValue(docTargetAtom);
  const [open, setOpen] = useAtom(docDrawerOpenAtom);
  const navigate = useNavigate();

  const hasPageDoc = Boolean(target);

  const onClick = () => {
    if (hasPageDoc) setOpen((v) => !v);
    else navigate("/docs");
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={hasPageDoc ? "Guide for this page" : "Documentation"}
      aria-label={hasPageDoc ? "Guide for this page" : "Documentation"}
      className={`hover:bg-accent relative rounded-lg p-2 transition-all duration-200 ${
        open && hasPageDoc
          ? "bg-primary/10 text-foreground ring-primary/20 ring-2"
          : "text-foreground"
      }`}
    >
      <CircleHelp size={20} strokeWidth={1.5} />
      {hasPageDoc && !open && (
        <span className="bg-primary absolute top-1 right-1 h-2 w-2 rounded-full" />
      )}
    </button>
  );
};

export default DocHelpButton;
