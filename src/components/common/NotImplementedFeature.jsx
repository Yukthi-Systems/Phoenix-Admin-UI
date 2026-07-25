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
import { ArrowLeft, Home, Sparkles, Pickaxe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotImplementedFeature({
  title = "Feature Coming Soon",
  description = "We're currently forging this feature in our workshop. It will be available in a future update!",
  icon: Icon = Pickaxe,
  fullPage = false,
  showBack = false,
  showHome = false,
  className = ""
}) {
  const navigate = useNavigate();

  const containerClass = fullPage
    ? "min-h-[80vh] flex items-center justify-center p-4 md:p-6 w-full"
    : `w-full h-full min-h-[400px] flex items-center justify-center p-4 md:p-6 ${className}`;

  return (
    <div className={containerClass}>
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border/40 bg-background/60 shadow-sm backdrop-blur-xl group">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 z-0" />

        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-110" />

        <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center space-y-8">

          {/* Animated Icon Container */}
          <div className="relative flex justify-center items-center">
            {/* Outer animated ring */}
            <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-[-10px] border border-dashed border-accent/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

            {/* Inner glow */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />

            {/* Icon Box */}
            <div className="relative bg-background/80 backdrop-blur-md border border-border/50 w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center shadow-lg shadow-primary/5 -rotate-3 hover:rotate-3 transition-transform duration-500 ease-out">
              <Icon className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />

              {/* Floating Sparkles */}
              <Sparkles className="absolute -top-4 -right-4 w-7 h-7 text-yellow-500 animate-bounce delay-75" strokeWidth={1.5} />
              <Sparkles className="absolute -bottom-2 -left-3 w-5 h-5 text-accent animate-bounce delay-300" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Under Development
            </div>

            <h2 className="text-2xl md:text-4xl my-4 font-bold text-foreground tracking-tight">
              {title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          {(showBack || showHome) && (
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 justify-center w-full sm:w-auto">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                    border border-border/80 bg-background hover:bg-muted hover:border-border
                    text-foreground font-medium
                    transition-all duration-200 active:scale-95 shadow-sm"
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                  <span>Go Back</span>
                </button>
              )}
              {showHome && (
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                    bg-primary text-primary-foreground font-medium
                    hover:bg-primary/90 shadow-lg shadow-primary/25
                    transition-all duration-200 active:scale-95"
                >
                  <Home size={18} strokeWidth={2} />
                  <span>Dashboard</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
