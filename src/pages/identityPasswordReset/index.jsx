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

// TEMPORARY standalone portal for mailbox (email identity) users to reset
// their own password. Deliberately separate from pages/auth/resetPassword -
// this whole folder, its two routes in Router.jsx, api/identityPasswordReset.js
// and hooks/useIdentityPasswordReset.js are meant to be deleted together.
//
// Routes:
//   /reset/password                    -> pick a method
//   /reset/password?method=current     -> reset using the current password
//   /reset/password?method=link        -> request an emailed reset link
//   /reset/link?s=<encoded>            -> landing page for that link (ResetLink.jsx)

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import ResetShell from "./components/ResetShell";
import CurrentPasswordForm from "./components/CurrentPasswordForm";
import RequestLinkForm from "./components/RequestLinkForm";
import { LinkButton } from "./components/FormBits";

const METHODS = {
  current: {
    icon: KeyRound,
    title: "I know my existing password",
    description: "Enter your existing password and choose a new one.",
    pageTitle: "Change your password",
    pageSubtitle: "Confirm your existing password to set a new one",
    Form: CurrentPasswordForm,
  },
  link: {
    icon: Mail,
    title: "Email me a reset link",
    description: "Get a one-time link in your mailbox to set a new password.",
    pageTitle: "Get a reset link",
    pageSubtitle: "We'll send a one-time link to your email address",
    Form: RequestLinkForm,
  },
};

const IdentityPasswordReset = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const methodKey = searchParams.get("method");
  const method = METHODS[methodKey];
  // Password actually changed: nothing left to switch to, so the page
  // drops the form header and the "different method" link
  const [completed, setCompleted] = useState(false);

  // Push (not replace) so the browser back button returns to the chooser
  const selectMethod = (key) => {
    setCompleted(false);
    setSearchParams(key ? { method: key } : {});
  };

  if (!method) {
    return (
      <ResetShell
        icon={ShieldCheck}
        title="Reset your password"
        subtitle="How would you like to reset the password for your email account?"
      >
        <div className="space-y-3">
          {Object.entries(METHODS).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectMethod(key)}
                className="border-border hover:border-primary/60 hover:bg-primary/5 group flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all"
              >
                <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="text-card-foreground block text-sm font-semibold">
                    {m.title}
                  </span>
                  <span className="text-muted-foreground block text-sm">
                    {m.description}
                  </span>
                </span>
                <ChevronRight className="text-muted-foreground group-hover:text-primary h-5 w-5 shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
      </ResetShell>
    );
  }

  const { Form } = method;
  return (
    <ResetShell
      icon={completed ? KeyRound : method.icon}
      title={completed ? "All done" : method.pageTitle}
      subtitle={completed ? undefined : method.pageSubtitle}
    >
      {/* key: remount (fresh form + reCAPTCHA) when switching methods */}
      <Form key={methodKey} onComplete={() => setCompleted(true)} />
      {!completed && (
        <div className="mt-5 text-center">
          <LinkButton icon={ArrowLeft} onClick={() => selectMethod(null)}>
            Use a different method
          </LinkButton>
        </div>
      )}
    </ResetShell>
  );
};

export default IdentityPasswordReset;
