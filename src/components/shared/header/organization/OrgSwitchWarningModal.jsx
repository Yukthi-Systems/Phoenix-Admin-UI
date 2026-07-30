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
import { AlertTriangle } from "lucide-react";
import EditModelBox from "@/components/common/EditModelBox";
import { Button } from "@/components/common/Buttons";

const OrgSwitchWarningModal = ({
  isOpen,
  organizationName,
  onConfirm,
  onCancel,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
    setDontShowAgain(false);
  };

  const handleCancel = () => {
    setDontShowAgain(false);
    onCancel();
  };

  return (
    <EditModelBox
      isOpen={isOpen}
      label="Switch Organization"
      handleCancel={handleCancel}
    >
      <div className="w-sm text-left space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/5 p-3">
          <AlertTriangle className="text-warning mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-card-foreground text-sm">
            Switching to{" "}
            <span className="font-semibold">
              {organizationName || "this organization"}
            </span>{" "}
            will take you away from the current page and reset any unsaved
            work or selections.
          </p>
        </div>

        <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="text-primary bg-background border-border focus:ring-primary h-4 w-4 rounded focus:ring-2"
          />
          Don't show this again
        </label>

        <div className="m-1 flex items-center justify-end gap-3 border-t pt-3">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Continue
          </Button>
        </div>
      </div>
    </EditModelBox>
  );
};

export default OrgSwitchWarningModal;
