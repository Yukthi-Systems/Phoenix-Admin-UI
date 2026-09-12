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

/**
 * Contextual-help loader.
 *
 * docs/manifest.json is a flat list of entries:
 *   { match: "<route pattern>", step: <number|null>, file: "<path under docs/>" }
 *
 * "match" is a route pattern in the same shape as the app's own React
 * Router paths (e.g. "/domain/edit/:domain_name") — any segment starting
 * with ":" matches any single path segment, and a trailing slash is
 * optional. "step" is the wizard step number for multi-step forms (as
 * read from wherever the app tracks the current step of a wizard — its
 * component state, or a "?step=" query param if the app starts encoding
 * it there, e.g. /domain/add/?step=1) and is null for pages that aren't
 * a step-based wizard.
 *
 * Usage from a React component:
 *
 *   import { useLocation } from "react-router-dom";
 *   import { findHelpDocFile } from "@/../docs/loadHelpDoc";
 *
 *   const location = useLocation();
 *   const step = Number(new URLSearchParams(location.search).get("step")) || currentWizardStep;
 *   const docFile = findHelpDocFile(location.pathname, step, manifest);
 *   // docFile is a path like "domain/add/step-1.md", relative to docs/ —
 *   // fetch it (or import it, if bundled) and render it as Markdown.
 */

function patternToRegex(pattern) {
  const normalized = pattern.replace(/\/+$/, "") || "/";
  const escaped = normalized
    .split("/")
    .map((segment) =>
      segment.startsWith(":")
        ? "[^/]+"
        : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    )
    .join("/");
  return new RegExp(`^${escaped}/?$`);
}

/**
 * Find the manifest entry (and thus the markdown file) for a given
 * pathname + wizard step. Falls back to a step-less match for that same
 * route if no exact step entry exists, then to the first step of that
 * wizard if no step was given at all.
 *
 * @param {string} pathname current route, e.g. "/domain/edit/example.com"
 * @param {number|null} step current wizard step, if the page is a wizard
 * @param {Array<{match:string, step:number|null, file:string}>} manifest
 * @returns {string|null} the doc file path (relative to docs/), or null
 */
function findHelpDocFile(pathname, step, manifest) {
  const candidates = manifest.filter((entry) =>
    patternToRegex(entry.match).test(pathname),
  );
  if (candidates.length === 0) return null;

  if (step != null) {
    const exact = candidates.find((entry) => entry.step === step);
    if (exact) return exact.file;
  }

  const stepless = candidates.find((entry) => entry.step == null);
  if (stepless) return stepless.file;

  // Last resort: the first step of that wizard, so there's always something to show.
  return candidates[0].file;
}

module.exports = { findHelpDocFile, patternToRegex };
