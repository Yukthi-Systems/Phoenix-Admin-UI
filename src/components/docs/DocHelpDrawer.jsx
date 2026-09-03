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
import { docDrawerOpenAtom, docTargetAtom } from "@/store/docs";
import DocDrawer from "./DocDrawer";
import StepDoc from "./StepDoc";

/**
 * Mounted once (in FullLayout). Renders the step-aware documentation drawer
 * that the header Help button opens. Driven entirely by jotai atoms so any
 * page can register its docs with `useDocTarget`.
 */
const DocHelpDrawer = () => {
  const target = useAtomValue(docTargetAtom);
  const [open, setOpen] = useAtom(docDrawerOpenAtom);

  const visible = open && Boolean(target);

  return (
    <DocDrawer open={visible} onClose={() => setOpen(false)} title="Guide">
      {visible && <StepDoc docId={target.docId} step={target.step} />}
    </DocDrawer>
  );
};

export default DocHelpDrawer;
