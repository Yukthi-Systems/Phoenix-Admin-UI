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

const DataLoading = ({ content = "Loading...", className = "" }) => {
  return (
    <div
      className={`w-full h-full flex flex-col justify-center items-center space-y-4 ${className}`}
    >
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full absolute"></div>
        <div className="w-16 h-16 border-t-4 border-primary animate-spin rounded-full"></div>
      </div>
      <p className="text-base text-muted-foreground font-medium tracking-wide">
        {content}
      </p>
    </div>
  );
};

export default DataLoading;
