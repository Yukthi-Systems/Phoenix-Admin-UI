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

import React from "react";
import { X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const BulkActionProgressModal = ({
  isOpen,
  onClose,
  action,
  progress,
  canClose = false,
}) => {
  if (!isOpen) return null;

  const { total, processed, succeeded, failed, currentMessage } = progress;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isComplete = processed === total;

  const actionLabels = {
    remove: "Removing Messages",
    hold: "Holding Messages",
    requeue: "Requeuing Messages",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border-border relative w-full max-w-lg rounded-xl border p-6 shadow-xl text-left">
        {canClose && isComplete && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground absolute right-4 top-4 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mb-6">
          <h2 className="text-foreground mb-2 text-xl font-semibold">
            {actionLabels[action] || "Processing Messages"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isComplete
              ? "Operation completed"
              : `Processing ${processed} of ${total} messages...`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-muted mb-2 h-3 overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete
                  ? succeeded === total
                    ? "bg-success"
                    : "bg-warning"
                  : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>{percentage}% Complete</span>
            <span>
              {processed}/{total}
            </span>
          </div>
        </div>

        {/* Current Processing */}
        {!isComplete && currentMessage && (
          <div className="bg-accent mb-4 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span className="text-accent-foreground text-sm font-medium">
                Processing: {currentMessage}
              </span>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="border-border grid grid-cols-3 gap-4 rounded-lg border p-4">
          <div className="text-center">
            <div className="text-foreground mb-1 text-2xl font-bold">
              {total}
            </div>
            <div className="text-muted-foreground text-xs">Total</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="text-success h-4 w-4" />
              <div className="text-success mb-1 text-2xl font-bold">
                {succeeded}
              </div>
            </div>
            <div className="text-muted-foreground text-xs">Succeeded</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="text-destructive h-4 w-4" />
              <div className="text-destructive mb-1 text-2xl font-bold">
                {failed}
              </div>
            </div>
            <div className="text-muted-foreground text-xs">Failed</div>
          </div>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-4">
            {succeeded === total ? (
              <div className="bg-success/10 border-success/20 rounded-lg border p-3">
                <p className="text-success text-sm font-medium">
                  ✓ All messages processed successfully
                </p>
              </div>
            ) : failed === total ? (
              <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
                <p className="text-destructive text-sm font-medium">
                  ✗ All messages failed to process
                </p>
              </div>
            ) : (
              <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
                <p className="text-warning text-sm font-medium">
                  ⚠ {succeeded} succeeded, {failed} failed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        {canClose && isComplete && (
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-lg px-4 py-2 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkActionProgressModal;
