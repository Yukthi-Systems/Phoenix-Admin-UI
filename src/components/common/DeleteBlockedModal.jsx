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

import EditModelBox from "./EditModelBox";
import { Button } from "./Buttons";
import { AlertTriangle } from "lucide-react";

/**
 * Pairs with usePreDeleteCheck - renders the reasons a delete was blocked
 * (e.g. "3 sub-organizations", "2 domains") instead of letting the user hit
 * a raw backend error after the fact.
 */
const DeleteBlockedModal = ({
  isOpen,
  name = "",
  reasons = [],
  onClose = () => {},
  title = "Can't Delete",
  entityLabel = "item",
  actionLabel,
  onAction,
}) => {
  if (!isOpen) return null;

  return (
    <EditModelBox isOpen={isOpen} label={title} handleCancel={onClose}>
      <div className="w-full sm:w-xl text-left">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-base text-card-foreground">
            <span className="font-medium text-destructive">"{name}"</span>{" "}
            still has:
          </p>
        </div>

        <ul className="list-disc list-inside mb-4 text-sm space-y-1 text-card-foreground">
          {reasons.map((reason) => (
            <li key={reason.label}>
              {reason.count} {reason.label}
              {reason.count !== 1 ? "s" : ""}
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground mb-6">
          Remove or reassign these first, then try deleting this{" "}
          {entityLabel} again.
        </p>

        <div className="flex justify-end items-center gap-3 m-2">
          {onAction && actionLabel && (
            <Button variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </EditModelBox>
  );
};

export default DeleteBlockedModal;
