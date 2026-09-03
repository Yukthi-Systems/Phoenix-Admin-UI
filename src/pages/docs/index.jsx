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

import { NavLink, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getDocsTree } from "@/docs/registry";
import DocArticle from "./DocArticle";

const titleCase = (s = "") =>
  s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DocsPage = () => {
  const { feature, flow } = useParams();
  const tree = getDocsTree();

  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-1.5 text-sm transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <div className="flex h-[calc(100vh-96px)] gap-6 px-2 text-left">
      {/* Left navigation */}
      <aside className="border-border bg-card w-64 shrink-0 overflow-y-auto rounded-md border p-3">
        <div className="text-card-foreground mb-3 flex items-center gap-2 px-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4" />
          Documentation
        </div>
        <nav className="space-y-4">
          {tree.map((f) => (
            <div key={f.feature}>
              <p className="text-muted-foreground px-3 pb-1 text-xs font-semibold tracking-wide uppercase">
                {titleCase(f.feature)}
              </p>
              {f.flows.map((fl) => (
                <NavLink
                  key={fl.flow}
                  to={`/docs/${f.feature}/${fl.flow}`}
                  className={linkClass}
                >
                  {fl.meta?.meta?.title || titleCase(fl.flow)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {feature && flow ? (
          <DocArticle feature={feature} flow={flow} />
        ) : (
          <div className="mx-auto max-w-3xl">
            <h1 className="text-foreground text-2xl font-semibold">
              Documentation
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Select a guide from the list, or open the{" "}
              <span className="font-medium">Guide</span> panel from any create
              form to see step-by-step help alongside the fields.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {tree.flatMap((f) =>
                f.flows.map((fl) => (
                  <NavLink
                    key={`${f.feature}/${fl.flow}`}
                    to={`/docs/${f.feature}/${fl.flow}`}
                    className="border-border bg-card hover:border-primary/50 rounded-md border p-4 transition-colors"
                  >
                    <p className="text-card-foreground font-medium">
                      {fl.meta?.meta?.title ||
                        `${titleCase(fl.flow)} ${titleCase(f.feature)}`}
                    </p>
                    {fl.meta?.meta?.summary ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {fl.meta.meta.summary}
                      </p>
                    ) : null}
                  </NavLink>
                )),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsPage;
