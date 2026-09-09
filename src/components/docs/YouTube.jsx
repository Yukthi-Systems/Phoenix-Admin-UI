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

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Accepts a raw 11-char video id, or any YouTube URL
 * (watch?v=, youtu.be/, /embed/, /shorts/).
 */
const parseYouTubeId = (input = "") => {
  if (!input) return null;
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const m = url.pathname.match(/\/(embed|shorts)\/([\w-]{11})/);
    if (m) return m[2];
  } catch {
    /* not a URL - fall through */
  }
  return null;
};

/**
 * <YouTube id="dQw4w9WgXcQ" start={30} title="..." />
 *
 * Click-to-load facade: only shows a thumbnail until the user clicks, then
 * mounts the privacy-friendly youtube-nocookie iframe. Keeps the heavy
 * YouTube player off every doc view.
 */
const YouTube = ({ id, url, start, title = "YouTube video" }) => {
  const [active, setActive] = useState(false);
  const videoId = parseYouTubeId(id || url);

  if (!videoId) {
    return (
      <p className="not-prose text-destructive my-4 text-sm">
        Invalid YouTube reference: {String(id || url)}
      </p>
    );
  }

  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (start) params.set("start", String(start));

  return (
    <div className="not-prose border-border my-5 aspect-video w-full overflow-hidden rounded-md border">
      {active ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}
          className="group relative flex h-full w-full items-center justify-center"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
};

export default YouTube;
