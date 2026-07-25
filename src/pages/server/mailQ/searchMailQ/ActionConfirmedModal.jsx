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
import { X, AlertTriangle } from "lucide-react";
import { SERVER_ACTIONS } from "@/constants/constants";

const QueueActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  messageCount = 0,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const actionLabels = {
    [SERVER_ACTIONS.REMOVE_MESSAGE]: "Remove",
    [SERVER_ACTIONS.CLEAR_QUEUE]: "Clear All Queue",
    [SERVER_ACTIONS.FLUSH_QUEUE]: "Flush Queue",
    [SERVER_ACTIONS.HOLD_MESSAGE]: "Hold",
    [SERVER_ACTIONS.HOLD_ALL]: "Hold All Queue",
    [SERVER_ACTIONS.REQUEUE_MESSAGE]: "Requeue",
    [SERVER_ACTIONS.REQUEUE_ALL]: "Requeue All",
  };

  const actionDescriptions = {
    [SERVER_ACTIONS.REMOVE_MESSAGE]:
      "This will permanently remove the selected message(s) from the queue.",
    [SERVER_ACTIONS.CLEAR_QUEUE]:
      "This will permanently delete ALL messages in the queue. This action cannot be undone.",
    [SERVER_ACTIONS.FLUSH_QUEUE]:
      "This will attempt to deliver all messages in the queue immediately.",
    [SERVER_ACTIONS.HOLD_MESSAGE]:
      "This will place the selected message(s) on hold, preventing delivery.",
    [SERVER_ACTIONS.HOLD_ALL]:
      "This will place ALL messages in the queue on hold.",
    [SERVER_ACTIONS.REQUEUE_MESSAGE]:
      "This will requeue the selected message(s) for delivery.",
    [SERVER_ACTIONS.REQUEUE_ALL]:
      "This will requeue ALL messages in the queue for delivery.",
  };

  const isGlobalAction = [
    SERVER_ACTIONS.CLEAR_QUEUE,
    SERVER_ACTIONS.FLUSH_QUEUE,
    SERVER_ACTIONS.HOLD_ALL,
    SERVER_ACTIONS.REQUEUE_ALL,
  ].includes(action);

  const isDangerousAction = [
    SERVER_ACTIONS.REMOVE_MESSAGE,
    SERVER_ACTIONS.CLEAR_QUEUE,
  ].includes(action);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border-border relative w-full max-w-md rounded-xl border p-6 text-left shadow-xl">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isDangerousAction ? "bg-destructive/10" : "bg-warning/10"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                isDangerousAction ? "text-destructive" : "text-warning"
              }`}
            />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">
              Confirm {actionLabels[action]}
            </h2>
            {messageCount > 0 && !isGlobalAction && (
              <p className="text-muted-foreground text-sm">
                {messageCount} {messageCount === 1 ? "message" : "messages"}{" "}
                selected
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground mb-3">
            {actionDescriptions[action]}
          </p>

          {isGlobalAction && (
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
              <p className="text-warning text-sm font-medium">
                ⚠ This action will affect all messages in the queue and may
                take up to 1 minute to complete.
              </p>
            </div>
          )}

          {isDangerousAction && (
            <div className="bg-destructive/10 border-destructive/20 mt-3 rounded-lg border p-3">
              <p className="text-destructive text-sm font-medium">
                This is a destructive action and cannot be undone.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/80 flex-1 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isDangerousAction
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Processing...
              </div>
            ) : (
              `Confirm ${actionLabels[action]}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueActionConfirmModal;
