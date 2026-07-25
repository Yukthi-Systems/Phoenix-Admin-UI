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

import { CircleX } from "lucide-react";
import React, { useState, useEffect } from "react";
import { TableCancelButton, TableDeleteButton } from "./Buttons";

function DeleteModelBox({
  isOpen = false,
  handleDelete = () => {},
  handleCancel = () => {},
  value = "",
  isLoading = false,
  requireConfirmation = false,
  confirmationText = "",
  confirmationPlaceholder = "Type to confirm",
  confirmationLabel = "Please type the name to confirm deletion:",
  title = "Are you sure?",
  description = "It will be removed from the list",
}) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isConfirmationValid, setIsConfirmationValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput("");
      setIsConfirmationValid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (requireConfirmation) {
      if (confirmationText) {
        setIsConfirmationValid(
          confirmationInput.trim() === confirmationText.trim(),
        );
      } else {
        setIsConfirmationValid(confirmationInput.trim().length > 0);
      }
    } else {
      setIsConfirmationValid(true);
    }
  }, [confirmationInput, confirmationText, requireConfirmation]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleDeleteClick = () => {
    if (!requireConfirmation || isConfirmationValid) {
      handleDelete();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isConfirmationValid && !isLoading) {
      handleDeleteClick();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handlePrevent = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[4px] flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-card rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-lg p-6 border border-border">
        <div className="flex text-destructive justify-end items-center mb-4">
          <span
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={handleCancel}
          >
            <CircleX size={25} />
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xl font-semibold mb-3 text-card-foreground">
            {title}
          </p>
          <p className="mb-4 text-card-foreground dis select-none">
            You want to delete{" "}
            <span className="font-medium text-destructive">"{value}"</span>.{" "}
            {description}
          </p>

          {requireConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {confirmationLabel}
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                onCopy={handlePrevent}
                onPaste={handlePrevent}
                onCut={handlePrevent}
                onContextMenu={handlePrevent}
                placeholder={confirmationPlaceholder}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  requireConfirmation && confirmationInput.length > 0
                    ? isConfirmationValid
                      ? "border-success"
                      : "border-destructive"
                    : "border-border"
                }`}
                disabled={isLoading}
                autoFocus
                onKeyDown={handleKeyDown}
              />
              {requireConfirmation &&
                confirmationText &&
                confirmationInput.length > 0 &&
                !isConfirmationValid && (
                  <p className="text-sm text-destructive mt-1 select-none">
                    Please type "{confirmationText}" exactly to confirm
                  </p>
                )}
              {requireConfirmation &&
                !confirmationText &&
                confirmationInput.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Type anything to confirm deletion
                  </p>
                )}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-3">
          <TableCancelButton disabled={isLoading} handleClick={handleCancel} />
          <TableDeleteButton
            disabled={
              isLoading || (requireConfirmation && !isConfirmationValid)
            }
            handleClick={handleDeleteClick}
            label={isLoading ? "Deleting..." : "Delete"}
          />
        </div>
      </div>
    </div>
  );
}

export default DeleteModelBox;
