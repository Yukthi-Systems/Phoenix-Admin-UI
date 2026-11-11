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

import { ShieldCheck } from "lucide-react";

/**
 * Page frame for the identity password reset portal: a single centred card.
 * `icon`, `title` and `subtitle` render the card header; `children` is the body.
 */
const ResetShell = ({
  icon: Icon = ShieldCheck,
  title,
  subtitle,
  children,
}) => (
  <div className="from-background text-left via-background to-muted relative flex min-h-screen items-center justify-center bg-gradient-to-br px-4 py-8 sm:py-12">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

    <div className="relative w-full max-w-md space-y-5">
      <div className="text-center">
        <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          Email Account Password Reset
        </span>
      </div>

      <div className="bg-card/60 border-border/50 relative overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="from-primary via-primary/80 to-primary absolute top-0 right-0 left-0 h-1 bg-gradient-to-r" />

        <div className="mb-6 space-y-2 text-center">
          <div className="bg-primary/10 border-primary/20 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border">
            <Icon className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-card-foreground text-2xl font-semibold">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  </div>
);

export default ResetShell;
