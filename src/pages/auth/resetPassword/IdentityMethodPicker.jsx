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

import { Link2, LockKeyhole, Mail, Phone } from "lucide-react";


// email OTP -> identity's secondary_email, phone OTP -> primary_phone,
// email link -> the identity's own address (primary email).
const IDENTITY_RESET_METHODS = [
  {
    value: "email",
    label: "Email OTP",
    hint: "To secondary email",
    title:
      "We'll send a 6-digit OTP to the secondary email saved on this identity",
    icon: Mail,
  },
  {
    value: "phone",
    label: "Phone OTP",
    hint: "To registered phone",
    title:
      "We'll send a 6-digit OTP by SMS to the phone number saved on this identity",
    icon: Phone,
  },
  {
    value: "link",
    label: "Email link",
    hint: "To this mailbox",
    title: "We'll email a one-time reset link to this email address itself",
    icon: Link2,
  },
  {
    value: "current",
    label: "Existing password",
    hint: "If you remember it",
    title: "Set a new password by entering the existing one",
    icon: LockKeyhole,
  },
];

const IdentityMethodPicker = ({ value, onChange }) => (
  <div className="space-y-2">
    <p className="text-card-foreground block text-left text-sm font-medium">
      Reset method
    </p>
    <div role="radiogroup" className="grid grid-cols-2 gap-2.5">
      {IDENTITY_RESET_METHODS.map(
        ({ value: key, label, hint, title, icon: Icon }) => {
          const isActive = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={title}
              onClick={() => onChange(key)}
              className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2.5 text-left transition-all ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm leading-tight font-medium ${isActive ? "text-primary" : "text-foreground"}`}
                >
                  {label}
                </span>
                <span className="text-muted-foreground mt-0.5 block truncate text-xs leading-tight">
                  {hint}
                </span>
              </span>
            </button>
          );
        },
      )}
    </div>
  </div>
);

export default IdentityMethodPicker;
