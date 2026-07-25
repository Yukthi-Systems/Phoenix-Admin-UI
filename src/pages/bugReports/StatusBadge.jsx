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

const statusMap = {
  OPEN: {
    label: "Open",
    class: "bg-warning/15 text-warning border-warning/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    class: "bg-primary/15 text-primary border-primary/30",
  },
  RESOLVED: {
    label: "Resolved",
    class: "bg-success/15 text-success border-success/30",
  },
};

const StatusBadge = ({ status }) => {
  const data = statusMap[status] || statusMap.OPEN;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs border font-medium ${data.class}`}
    >
      {data.label}
    </span>
  );
};

export default StatusBadge;
