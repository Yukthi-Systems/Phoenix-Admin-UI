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

import { FileX2, Search, Inbox } from "lucide-react";

function NoDataFound({ content = "No data found", variant = "default" }) {
  return (
    <div className="w-full h-[calc(100vh-150px)] shadow-lg overflow-hidden rounded-lg bg-card flex flex-col justify-center items-center gap-6 text-primary relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Icon container */}
        <div className="relative">
          {/* Compact ring */}
          {/* <div className="absolute inset-0 -m-4 rounded-full border border-primary/15"></div> */}
          
          {/* Icon background */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 rounded-full  border border-primary/20">
            <div className="bg-gradient-to-br from-background to-card p-5 rounded-full shadow-inner">
              <FileX2 
                size={56} 
                className="text-primary drop-shadow-sm"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            No Data Available
          </h3>
          <p className="text-base text-muted-foreground font-medium leading-relaxed">
            {content}
          </p>
          
          {/* Subtle decorative line */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="h-1 w-1 rounded-full bg-primary/40"></div>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
        </div>

        {/* Optional suggestions */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground hover:bg-muted transition-colors cursor-default">
            <Search size={14} />
            <span>Try adjusting your filters</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground hover:bg-muted transition-colors cursor-default">
            <Inbox size={14} />
            <span>Check back later</span>
          </div>
        </div>
      </div>

      {/* Bottom subtle gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default NoDataFound;