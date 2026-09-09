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

import { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { DocAssetContext } from "./DocAssetContext";
import { resolveDocAsset } from "@/docs/assets";

/**
 * <Figure src="..." alt="..." caption="..." />
 *
 * Works with both local asset paths (resolved by Vite at build time when the
 * MDX author writes `<Figure src={imgImport} />` or a relative string that
 * the bundler rewrites) and remote URLs / image links (`https://...`).
 *
 * Lazy-loaded, and click-to-zoom into a full-screen lightbox.
 */
const Figure = ({ src: rawSrc, alt = "", caption, zoom = true }) => {
  const [open, setOpen] = useState(false);
  const baseDir = useContext(DocAssetContext);
  const src = resolveDocAsset(rawSrc, baseDir);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!src) return null;

  return (
    <figure className="not-prose my-5">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onClick={zoom ? () => setOpen(true) : undefined}
        className={`border-border bg-background w-full rounded-md border ${
          zoom ? "cursor-zoom-in" : ""
        }`}
      />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-xs">
          {caption}
        </figcaption>
      ) : null}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 rounded-md bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full rounded-md object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </figure>
  );
};

export default Figure;
