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

import { ExternalLink } from "lucide-react";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const InfoCard = ({ icon: Icon, title, children, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative bg-card border border-border/50 rounded-lg p-4 
        hover:border-primary/30 transition-colors duration-200 
        before:absolute before:inset-0 before:rounded-lg 
        before:opacity-0 before:transition-opacity before:duration-500 
        before:bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.1),transparent_60%)]
        hover:before:opacity-30 
        overflow-hidden
        ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-card-foreground text-left">
          {title}
        </h3>
      </div>
      <div className="space-y-2.5 relative z-10">{children}</div>
    </div>
  );
};

const InfoItem = ({ label, value, sublabel, link }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="flex items-start justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground min-w-0 flex-1 text-left pt-0.5">
        {label}:
      </span>
      
      <div className="flex flex-col items-end min-w-0 flex-1">
        {link ? (
          <button
            onClick={handleClick}
            className="group flex items-center justify-end gap-1.5 p-0 m-0 bg-transparent border-none cursor-pointer text-right"
          >
            <span className="text-sm font-medium text-nowrap text-primary underline decoration-primary/40 underline-offset-4 group-hover:decoration-primary group-hover:text-primary/90 transition-all duration-200">
              {value}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          </button>
        ) : (
          <span className="text-sm font-medium text-card-foreground text-right">
            {value}
          </span>
        )}
        
        {sublabel && (
          <span className="text-xs text-muted-foreground mt-1 text-right">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export { InfoCard, InfoItem };
