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

// Lets route chunks be downloaded before the route is opened, without the
// sidebar/layout importing Router.jsx (which would be a circular import).
// Router.jsx registers every lazy route's import function here.
const preloads = new Map();
const started = new Set();

const normalize = (path) =>
  path && path.length > 1 ? path.replace(/\/+$/, "") : path;

export const registerRoutePreload = (path, preload) => {
  preloads.set(normalize(path), preload);
};

// Starts downloading a route's chunk. The browser caches the module, so the
// later lazy() import resolves immediately. Failures are ignored here - the
// real navigation still goes through lazyRetry's retry handling.
export const prefetchRoute = (path) => {
  const key = normalize(path);
  const preload = preloads.get(key);
  if (!preload || started.has(key)) return;
  started.add(key);
  preload().catch(() => started.delete(key));
};

// The most-used pages, fetched in the background once the app has settled.
const COMMON_ROUTES = ["/domain", "/mailbox", "/identities", "/organization"];

export const prefetchCommonRoutes = () => {
  // Respect data-saver / very slow connections.
  const connection = navigator.connection;
  if (connection?.saveData || /2g/.test(connection?.effectiveType || "")) {
    return;
  }
  const run = () => COMMON_ROUTES.forEach(prefetchRoute);
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 5000 });
  } else {
    setTimeout(run, 1000);
  }
};
