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

import { Suspense, lazy, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import DataLoading from "@/components/common/DataLoading";
import DocContent from "@/components/docs/DocContent";
import { getFlowDocs, getFlowMeta } from "@/docs/registry";

const titleCase = (s = "") =>
  s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Section = ({ entry, anchor }) => {
  const Lazy = useMemo(() => lazy(entry.load), [entry]);
  return (
    <section id={anchor} className="scroll-mt-24">
      <Suspense fallback={<DataLoading content="Loading section..." />}>
        <DocContent Content={Lazy} baseDir={entry.dir} />
      </Suspense>
    </section>
  );
};

/**
 * Full guide for one flow: the `_meta` overview followed by every step doc,
 * each anchored as #step-N so the wizard's "Open the full guide" links land
 * on the right section.
 */
const DocArticle = ({ feature, flow }) => {
  const meta = getFlowMeta(feature, flow);
  const steps = getFlowDocs(feature, flow);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, feature, flow]);

  if (!meta && steps.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No documentation found for {feature} / {flow}.
      </p>
    );
  }

  return (
    <article className="mx-auto max-w-3xl pb-24 text-left">
      <header className="mb-6">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          {titleCase(feature)}
        </p>
        <h1 className="text-foreground text-2xl font-semibold">
          {meta?.meta?.title || `${titleCase(flow)} ${titleCase(feature)}`}
        </h1>
      </header>

      <div className="space-y-10">
        {meta && <Section entry={meta} anchor="overview" />}
        {steps.map((entry) => (
          <Section
            key={entry.key}
            entry={entry}
            anchor={entry.step ? `step-${entry.step}` : entry.file}
          />
        ))}
      </div>
    </article>
  );
};

export default DocArticle;
