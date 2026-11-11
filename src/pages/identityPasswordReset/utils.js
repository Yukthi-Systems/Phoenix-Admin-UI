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

// UTF-8 safe base64. Plain btoa() throws on anything outside Latin-1, and the
// backend decodes these with .decode("utf-8").
export const toBase64Utf8 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

// The backend looks identities up with a case-sensitive `email = $1` and
// doesn't normalise the input itself, so it has to happen here.
export const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// Secrets are generated from an uppercase-only alphabet; people may retype
// or paste them with stray whitespace / lowercase.
export const normalizeSecret = (value) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();

/**
 * Decode the reset link's `s` param back into { email, secret }.
 * Built by V3-Notifications-Worker (utils/password_reset.py): URL-safe base64
 * without padding of JSON {"email": ..., "secret": ...}. Not encryption, it
 * only keeps the URL from spelling out what it carries.
 * Returns null for anything missing/malformed.
 */
export const decodeResetLinkParam = (value) => {
  if (!value) return null;
  try {
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof data?.email !== "string" || typeof data?.secret !== "string") {
      return null;
    }
    return {
      email: normalizeEmail(data.email),
      secret: normalizeSecret(data.secret),
    };
  } catch {
    return null;
  }
};

/**
 * Turn an API error into a message suitable for an end user.
 * Unknown/disabled accounts surface from the backend as a 424 with an
 * internal-looking message ("Failed to fetch password information for ..."),
 * so those are replaced with something readable.
 */
export const getResetErrorMessage = (error) => {
  if (!error) return "";
  if (error.status === 404 || error.status === 424) {
    return "We couldn't find an active email account with that address. Check the address and try again.";
  }
  if (!error.status) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return error.message || "Something went wrong. Please try again.";
};
