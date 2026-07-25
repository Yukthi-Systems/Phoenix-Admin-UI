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

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { UserNameInfiniteSelectionFields } from "@/components/common/infiniteSelectors/UserNameInfiniteSelectionFields";

const AssignTicketModal = ({
  isOpen,
  onClose,
  ticket,
  organizationId,
  isPending,
  onAssign,
}) => {
  const [selectedUsers, setSelectedUsers] = useState(ticket?.assigned_to || []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedUsers || selectedUsers.length === 0) {
      return;
    }

    onAssign(selectedUsers);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 z-10 text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {ticket?.assigned_to?.length > 0 ? "Reassign Ticket" : "Assign Ticket"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ticket #{ticket?.ticket_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Ticket Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm font-medium text-foreground">Subject</p>
                <p className="text-sm text-muted-foreground truncate">
                  {ticket?.ticket_title}
                </p>
              </div>
              {ticket?.assigned_to?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Currently Assigned To
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.assigned_to.length} user{ticket.assigned_to.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* User Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {ticket?.assigned_to?.length > 0 ? "Reassign to" : "Assign to"}
                <span className="text-destructive ml-1">*</span>
              </label>
              <UserNameInfiniteSelectionFields
                name="assigned_users"
                label=""
                url={`/user/list/${organizationId}`}
                placeholder="Select users to assign..."
                value={selectedUsers}
                onChange={(value) => setSelectedUsers(value || [])}
                isClearable={true}
                onClear={() => setSelectedUsers([])}
                returnId={true}
                isMulti={true}
              />
              <p className="text-xs text-muted-foreground">
                Select one or more team members to handle this ticket
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedUsers || selectedUsers.length === 0}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{ticket?.assigned_to?.length > 0 ? "Reassign" : "Assign"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTicketModal;