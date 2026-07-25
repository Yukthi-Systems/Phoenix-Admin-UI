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

import { useCallback, useState } from "react";

/**
 * Runs a set of { label, fn } existence checks against an id and returns
 * only the ones with a count > 0 - i.e. the reasons a delete should be
 * blocked. Shared by usePreDeleteCheck (single-item delete) and
 * BulkDeleteModal's per-item `getChecks` prop (bulk delete), so both paths
 * agree on what "blocked" means for a given entity.
 *
 * A check that itself throws (network blip, etc.) is treated as count 0 -
 * it never blocks a delete on its own failure, it just falls through to the
 * real delete attempt.
 */
export const evaluateDeleteChecks = async (id, checks = []) => {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        const count = await check.fn(id);
        return { label: check.label, count: Number(count) || 0 };
      } catch (error) {
        console.error(`Pre-delete check "${check.label}" failed:`, error);
        return { label: check.label, count: 0 };
      }
    }),
  );

  return results.filter((r) => r.count > 0);
};

/**
 * Generic "can this be deleted?" gate. Before opening a delete-confirmation
 * modal, run a set of lightweight existence checks (e.g. "does this org have
 * sub-organizations?", "does this domain have mailboxes?"). If any check
 * finds a dependent count > 0, block the delete and surface which ones via
 * `blockInfo` (render with DeleteBlockedModal) instead of letting the user
 * hit a raw backend error.
 *
 * Usage:
 *   const { runCheck, checkingId, blockInfo, clearBlock } = usePreDeleteCheck();
 *   runCheck({
 *     id, name,
 *     checks: [
 *       { label: "sub-organization", fn: (id) => getSubOrgCount(id) },
 *       { label: "domain", fn: (id) => getDomainCount(id) },
 *     ],
 *     onClear: () => openDeleteConfirmModal(id, name),
 *   });
 */
export const usePreDeleteCheck = () => {
  const [checkingId, setCheckingId] = useState(null);
  const [blockInfo, setBlockInfo] = useState(null);

  const runCheck = useCallback(async ({ id, name, checks = [], onClear }) => {
    setCheckingId(id);
    try {
      const reasons = await evaluateDeleteChecks(id, checks);
      if (reasons.length > 0) {
        setBlockInfo({ id, name, reasons });
      } else {
        onClear?.();
      }
    } finally {
      setCheckingId(null);
    }
  }, []);

  const clearBlock = useCallback(() => setBlockInfo(null), []);

  return { runCheck, checkingId, blockInfo, clearBlock };
};

export default usePreDeleteCheck;
