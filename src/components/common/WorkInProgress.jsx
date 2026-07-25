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
import { Hammer, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkInProgressPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Blurred color splashes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -left-10 w-[500px] h-[500px]  bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-40  bg-accent/20 w-[500px] h-[500px] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center space-y-8 max-w-xl relative z-10">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <Hammer
              className="w-24 h-24 text-primary relative"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            Work In Progress
          </h1>
          <p className="text-xl text-muted-foreground">
            We're building something great. Check back soon!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg 
              border-2 border-border hover:border-primary
              text-foreground hover:text-primary
              transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg 
              bg-primary text-primary-foreground 
              hover:bg-primary/90
              transition-all duration-200"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
