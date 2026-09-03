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

import { Suspense, lazy, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowUpRight } from "lucide-react";
import DataLoading from "@/components/common/DataLoading";
import DocContent from "./DocContent";
import { getStepDoc } from "@/docs/registry";

/**
 * Renders the documentation for a single wizard step inside the DocDrawer.
 * `docId` is "<feature>/<flow>", e.g. "domain/create".
 */
const StepDoc = ({ docId, step }) => {
  const [feature, flow] = (docId || "").split("/");
  const entry = getStepDoc(feature, flow, step);

  // `entry` is a stable module-level object from the registry, so keying on
  // it is safe and recomputes only when the step actually changes.
  const LazyDoc = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);

  if (!entry || !LazyDoc) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
        <BookOpen className="h-6 w-6 opacity-50" />
        <p>No documentation for this step yet.</p>
        <Link
          to={`/docs/${feature}/${flow}`}
          className="text-primary inline-flex items-center gap-1 hover:underline"
        >
          Open the full guide <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="mb-3">
        <p className="text-card-foreground text-base font-semibold">
          {entry.meta.title}
        </p>
        {entry.meta.updated ? (
          <p className="text-muted-foreground mt-0.5 text-xs">
            Updated {entry.meta.updated}
          </p>
        ) : null}
      </div>

      <Suspense fallback={<DataLoading content="Loading guide..." />}>
        <DocContent Content={LazyDoc} baseDir={entry.dir} />
      </Suspense>

      <div className="border-border mt-6 border-t pt-3">
        <Link
          to={`/docs/${feature}/${flow}#step-${step}`}
          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
        >
          Open the full guide <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default StepDoc;
