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

import { useContext } from "react";
import { DocAssetContext } from "./DocAssetContext";
import { resolveDocAsset } from "@/docs/assets";

/**
 * <Video src="..." poster="..." caption="..." />
 *
 * Self-hosted or externally hosted video file (mp4/webm). Local files in a
 * docs `assets/` folder work with a relative path. For YouTube use the
 * <YouTube> component instead.
 */
const Video = ({
  src: rawSrc,
  poster: rawPoster,
  caption,
  autoPlay = false,
  loop = false,
}) => {
  const baseDir = useContext(DocAssetContext);
  const src = resolveDocAsset(rawSrc, baseDir);
  const poster = resolveDocAsset(rawPoster, baseDir);

  if (!src) return null;

  return (
    <figure className="not-prose my-5">
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        loop={loop}
        muted={autoPlay}
        className="border-border bg-background w-full rounded-md border"
      />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-xs">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default Video;
