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

function FetchLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-18  p-2 bg-card  border-1"></header>
      {/* <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-card  overflow-y-auto border-1 border-t-0 no-scrollbar">

                </aside>
                <main className="flex-1 px-2 py-1  overflow-y-auto no-scrollbar">
                    {children}
                </main>
            </div> */}
    </div>
  );
}

export default FetchLayout;
