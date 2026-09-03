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
import { useSetAtom } from "jotai";
import { docDrawerOpenAtom, docTargetAtom } from "@/store/docs";
import { hasFlowDocs } from "@/docs/registry";

/**
 * Registers the documentation the header Help button should show for the
 * current page. Call it from a create/edit page:
 *
 *   useDocTarget("domain/create", currentStep);
 *
 * Pass a falsy `docId` (or omit it) when there are no page docs - Help then
 * falls back to the /docs section.
 */
export const useDocTarget = (docId, step = 1) => {
  const setTarget = useSetAtom(docTargetAtom);
  const setDrawerOpen = useSetAtom(docDrawerOpenAtom);

  const [feature, flow] = (docId || "").split("/");
  const active = Boolean(docId) && hasFlowDocs(feature, flow);

  useEffect(() => {
    setTarget(active ? { docId, step } : null);
  }, [active, docId, step, setTarget]);

  // Clear the target (and close the drawer) when the page unmounts.
  useEffect(() => {
    return () => {
      setTarget(null);
      setDrawerOpen(false);
    };
  }, [setTarget, setDrawerOpen]);
};

export default useDocTarget;
