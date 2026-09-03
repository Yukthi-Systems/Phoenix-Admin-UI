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
 * <Video src="..." poster="..." caption="..." />
 *
 * Self-hosted or externally hosted video file (mp4/webm). For YouTube use
 * the <YouTube> component instead.
 */
const Video = ({ src, poster, caption, autoPlay = false, loop = false }) => {
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
