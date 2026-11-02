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

// Fallback avatar for orgs/users without an uploaded image, drawn locally as
// an SVG data URL so names are never sent to a third-party avatar service.
// Same look as before: up to two initials on a background colour that is
// stable per name.
const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0d9488",
  "#0891b2",
  "#4f46e5",
];

const getInitials = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getColor = (name) => {
  let hash = 0;
  for (const char of String(name || "")) {
    hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const escapeXml = (text) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char],
  );

export const getInitialsAvatar = (name) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${getColor(name)}"/><text x="50%" y="50%" dy=".1em" fill="#fff" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="48" font-weight="500" text-anchor="middle" dominant-baseline="middle">${escapeXml(getInitials(name))}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
