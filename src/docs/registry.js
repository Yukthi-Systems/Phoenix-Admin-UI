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
 * Documentation registry.
 *
 * Docs are authored as first-party `.mdx` files laid out as:
 *
 *   src/docs/<feature>/<flow>/_meta.mdx      -> flow overview (optional)
 *   src/docs/<feature>/<flow>/NN-<slug>.mdx  -> one file per wizard step
 *
 * Frontmatter drives everything - nothing here is hand-maintained:
 *
 *   ---
 *   title: Domain details
 *   feature: domain
 *   flow: create
 *   step: 1            # omit (or 0) for _meta
 *   summary: One-line description shown in nav / search.
 *   updated: 2026-09-03
 *   ---
 */

// Lazy component loaders - one code-split chunk per doc.
const loaders = import.meta.glob("./**/*.mdx");
// Eager frontmatter only (cheap) - used for nav, ordering and search.
const metas = import.meta.glob("./**/*.mdx", {
  eager: true,
  import: "frontmatter",
});

const parseKey = (key) => {
  // "./domain/create/01-domain-details.mdx"
  const parts = key.replace(/^\.\//, "").replace(/\.mdx$/, "").split("/");
  const [feature, flow, file] = parts;
  const isMeta = file === "_meta";
  const prefixMatch = file?.match(/^(\d+)[-_]/);
  return {
    feature,
    flow,
    file,
    isMeta,
    filePrefixStep: prefixMatch ? Number(prefixMatch[1]) : undefined,
  };
};

const ENTRIES = Object.entries(loaders).map(([key, load]) => {
  const { feature, flow, file, isMeta, filePrefixStep } = parseKey(key);
  const meta = metas[key] || {};
  const step = isMeta ? 0 : (meta.step ?? filePrefixStep ?? null);
  return {
    key,
    // Directory relative to src/docs, e.g. "domain/create" - used to resolve
    // relative asset paths written inside the .mdx file.
    dir: `${feature}/${flow}`,
    feature: meta.feature || feature,
    flow: meta.flow || flow,
    file,
    isMeta,
    step,
    meta: {
      title: meta.title || file,
      summary: meta.summary || "",
      updated: meta.updated || null,
      ...meta,
    },
    load,
  };
});

const sortByStep = (a, b) => (a.step ?? 999) - (b.step ?? 999);

/** All step docs for a flow, ordered by step (excludes `_meta`). */
export const getFlowDocs = (feature, flow) =>
  ENTRIES.filter(
    (e) => e.feature === feature && e.flow === flow && !e.isMeta,
  ).sort(sortByStep);

/** The `_meta.mdx` overview for a flow, or null. */
export const getFlowMeta = (feature, flow) =>
  ENTRIES.find((e) => e.feature === feature && e.flow === flow && e.isMeta) ||
  null;

/** The doc for a single wizard step (1-based), or null. */
export const getStepDoc = (feature, flow, step) =>
  ENTRIES.find(
    (e) =>
      e.feature === feature &&
      e.flow === flow &&
      !e.isMeta &&
      Number(e.step) === Number(step),
  ) || null;

/** Does any documentation exist for this flow? */
export const hasFlowDocs = (feature, flow) =>
  ENTRIES.some((e) => e.feature === feature && e.flow === flow);

/**
 * Grouped tree for the standalone /docs navigation:
 *   [{ feature, flows: [{ flow, meta, steps: [entry, ...] }] }]
 */
export const getDocsTree = () => {
  const features = new Map();
  for (const entry of ENTRIES) {
    if (!features.has(entry.feature)) features.set(entry.feature, new Map());
    const flows = features.get(entry.feature);
    if (!flows.has(entry.flow)) flows.set(entry.flow, { meta: null, steps: [] });
    const bucket = flows.get(entry.flow);
    if (entry.isMeta) bucket.meta = entry;
    else bucket.steps.push(entry);
  }
  return [...features.entries()]
    .map(([feature, flows]) => ({
      feature,
      flows: [...flows.entries()]
        .map(([flow, { meta, steps }]) => ({
          flow,
          meta,
          steps: steps.sort(sortByStep),
        }))
        .sort((a, b) => a.flow.localeCompare(b.flow)),
    }))
    .sort((a, b) => a.feature.localeCompare(b.feature));
};

export default ENTRIES;
