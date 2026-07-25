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

import { ShieldX, AlertTriangle, Info, AlertCircle } from "lucide-react";

const MESSAGE_TYPES = {
  error: {
    icon: ShieldX,
    colorClass: "destructive",
    bgGradient: "from-destructive/10 via-destructive/5 to-destructive/8",
  },
  warning: {
    icon: AlertTriangle,
    colorClass: "warning",
    bgGradient: "from-yellow-500/10 via-yellow-500/5 to-yellow-500/8",
  },
  info: {
    icon: Info,
    colorClass: "primary",
    bgGradient: "from-primary/10 via-primary/5 to-primary/8",
  },
  blocked: {
    icon: AlertCircle,
    colorClass: "destructive",
    bgGradient: "from-destructive/10 via-destructive/5 to-destructive/8",
  },
};

function MessageDisplay({
  type = "error",
  title,
  message,
  showBadges = false,
  badges = [],
  children, // Add this
}) {
  const config = MESSAGE_TYPES[type];
  const Icon = config.icon;

  return (
    <div className="w-full h-[calc(100vh-100px)] shadow-lg overflow-hidden rounded-lg bg-card border border-border flex flex-col justify-center items-center gap-6 relative">
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 max-w-2xl">
        <div
          className={`bg-gradient-to-br ${config.bgGradient} p-4 rounded-full border border-${config.colorClass}/20`}
        >
          <Icon
            size={48}
            className={`text-${config.colorClass}`}
            strokeWidth={1.5}
          />
        </div>
        <div className="text-center space-y-2">
          {title && (
            <h3 className={`text-xl font-semibold text-${config.colorClass}`}>
              {title}
            </h3>
          )}
          <p className="text-muted-foreground">{message}</p>
        </div>
        {showBadges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-md bg-${config.colorClass}/5 border border-${config.colorClass}/20 text-xs text-${config.colorClass}/80`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        {children} {/* Add this */}
      </div>
    </div>
  );
}

export default MessageDisplay;
