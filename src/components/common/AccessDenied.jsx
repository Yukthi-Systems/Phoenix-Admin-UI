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

import { ShieldX, Lock, AlertTriangle } from "lucide-react";

function AccessDenied({ content = "Access Denied" }) {
  return (
    <div className="w-full h-[calc(100vh-100px)] shadow-lg overflow-hidden rounded-lg bg-card border border-border flex flex-col justify-center items-center gap-6 text-destructive relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-destructive/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/3 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Icon container */}
        <div className="relative">
          {/* Compact ring */}
          
          
          {/* Icon background */}
          <div className="relative bg-gradient-to-br from-destructive/10 via-destructive/5 to-destructive/8 p-6 rounded-full  border border-destructive/20">
            <div className="bg-gradient-to-br from-background to-card p-5 rounded-full shadow-inner">
              <ShieldX 
                size={56} 
                className="text-destructive drop-shadow-sm"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <h3 className="text-2xl font-bold text-destructive tracking-tight">
            Access Denied
          </h3>
          <p className="text-base text-muted-foreground font-medium leading-relaxed">
            {content}
          </p>
          
          {/* Subtle decorative line */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="h-1 w-1 rounded-full bg-destructive/40"></div>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
        </div>

        {/* Information badges */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive/80 cursor-default">
            <Lock size={14} />
            <span>Insufficient Permissions</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive/80 cursor-default">
            <AlertTriangle size={14} />
            <span>Contact Administrator</span>
          </div>
        </div>
      </div>

      {/* Bottom subtle gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default AccessDenied;