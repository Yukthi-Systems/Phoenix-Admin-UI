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
 * Local documentation assets (images + video).
 *
 * Every file under any `src/docs/**\/assets/` folder is picked up here and
 * given a hashed, build-optimised URL by Vite. MDX authors reference them
 * with a plain relative path - `<Figure src="../assets/foo.png" />` or
 * `![alt](../assets/foo.png)` - and `resolveDocAsset` maps that to the real
 * URL at render time (see DocContent / Figure / Video).
 */
const modules = import.meta.glob(
  "./**/assets/**/*.{png,jpg,jpeg,gif,svg,webp,avif,mp4,webm,mov,m4v,ogg}",
  { eager: true, query: "?url", import: "default" },
);

// Keys normalised to be relative to `src/docs`, e.g. "domain/assets/foo.png".
const ASSET_MAP = Object.fromEntries(
  Object.entries(modules).map(([key, url]) => [key.replace(/^\.\//, ""), url]),
);

const isAbsolute = (src) =>
  /^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("/");

/**
 * Resolve an MDX asset reference to its real URL.
 *
 * @param {string} src   - the `src` written in the .mdx file
 * @param {string} baseDir - the doc file's directory relative to src/docs,
 *                            e.g. "domain/create" (from registry entry.dir)
 */
export const resolveDocAsset = (src, baseDir = "") => {
  if (!src || isAbsolute(src)) return src;

  // Resolve "../assets/foo.png" against the doc's directory.
  const segments = `${baseDir}/${src}`.split("/");
  const stack = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") stack.pop();
    else stack.push(seg);
  }
  const resolved = stack.join("/");

  return (
    ASSET_MAP[resolved] ||
    ASSET_MAP[src.replace(/^\.?\//, "")] ||
    // last resort: match by filename so a bare "foo.png" still works
    ASSET_MAP[
      Object.keys(ASSET_MAP).find((k) => k.endsWith(`/${src.split("/").pop()}`))
    ] ||
    src
  );
};

export default ASSET_MAP;
