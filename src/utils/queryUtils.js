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

// While a paginated list moves to another page, page size or search, keep the
// rows already on screen instead of dropping back to the loading state. Only
// applies when the scope (the queryKey up to the paging params) is unchanged,
// so rows from another org/domain/server never show up under the new one.
export const keepPreviousPage = (scope) => (previousData, previousQuery) => {
  const previousKey = previousQuery?.queryKey || [];
  const sameScope = scope.every((part, i) => previousKey[i] === part);
  return sameScope ? previousData : undefined;
};

// Profile pictures and org logos are fetched one request per image, so a user
// list or org tree can fire dozens at once and push the page's own API calls
// into the browser's connection queue. Run at most this many at a time.
const MAX_IMAGE_REQUESTS = 2;
let activeImageRequests = 0;
const waitingImageRequests = [];

// Runs `task` once an image slot is free. If `signal` aborts while still
// waiting (e.g. the page changed), it leaves the queue without ever starting;
// once started, the same signal cancels the request itself via axios.
export const withImageRequestSlot = (task, signal) =>
  new Promise((resolve, reject) => {
    const run = () => {
      activeImageRequests += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          activeImageRequests -= 1;
          waitingImageRequests.shift()?.();
        });
    };

    if (activeImageRequests < MAX_IMAGE_REQUESTS) {
      run();
      return;
    }

    const onAbort = () => {
      const index = waitingImageRequests.indexOf(start);
      if (index !== -1) waitingImageRequests.splice(index, 1);
      reject(signal.reason);
    };
    const start = () => {
      signal?.removeEventListener("abort", onAbort);
      run();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    waitingImageRequests.push(start);
  });
