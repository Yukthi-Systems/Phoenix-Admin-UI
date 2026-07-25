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

import EditModelBox from "@/components/common/EditModelBox";
import DataLoading from "@/components/common/DataLoading";
import DataFechError from "@/components/common/DataFechError";

function PolicyDetailsModal({
  label = "Policy Details",
  isLoading,
  isError,
  onClose,
  children,
}) {
  return (
    <EditModelBox isOpen label={label} handleCancel={onClose}>
      <div className="w-lg max-w-full text-left">
        {isLoading ? (
          <DataLoading content="Loading policy details..." />
        ) : isError ? (
          <DataFechError content="Failed to load policy details." />
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </div>
    </EditModelBox>
  );
}

export default PolicyDetailsModal;
