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

import { Info, Lightbulb, AlertTriangle, OctagonAlert } from "lucide-react";

/**
 * <Callout type="info|tip|warning|danger"> ... </Callout>
 *
 * Coloured note box for use inside MDX documentation. Colours are driven by
 * the app theme tokens so it adapts to light/dark automatically.
 */
const VARIANTS = {
  info: {
    Icon: Info,
    wrap: "border-primary/30 bg-primary/5",
    icon: "text-primary",
  },
  tip: {
    Icon: Lightbulb,
    wrap: "border-emerald-500/30 bg-emerald-500/5",
    icon: "text-emerald-500",
  },
  warning: {
    Icon: AlertTriangle,
    wrap: "border-amber-500/30 bg-amber-500/5",
    icon: "text-amber-500",
  },
  danger: {
    Icon: OctagonAlert,
    wrap: "border-destructive/30 bg-destructive/5",
    icon: "text-destructive",
  },
};

const Callout = ({ type = "info", title, children }) => {
  const variant = VARIANTS[type] || VARIANTS.info;
  const { Icon } = variant;

  return (
    <div
      className={`not-prose my-4 flex gap-3 rounded-md border p-3 text-sm ${variant.wrap}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${variant.icon}`} />
      <div className="text-foreground/90 min-w-0 space-y-2 leading-relaxed">
        {title ? <p className="text-foreground font-semibold">{title}</p> : null}
        {children}
      </div>
    </div>
  );
};

export default Callout;
