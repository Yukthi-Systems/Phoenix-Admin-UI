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
 * Runs `fn(item)` for every item with at most `limit` calls in flight, and
 * never rejects: resolves to `[{ item, ok, error }]` in input order. Used
 * for multi-select "add" flows that only have a per-item create endpoint.
 */
export const runInBatches = async (items, fn, limit = 4) => {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      try {
        await fn(items[index]);
        results[index] = { item: items[index], ok: true };
      } catch (error) {
        results[index] = { item: items[index], ok: false, error };
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
};
