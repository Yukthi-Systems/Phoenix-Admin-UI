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

import ListEditor from "../ListEditor";

const ExceptionListsStep = ({
  incomingDomains,
  setIncomingDomains,
  incomingEmails,
  setIncomingEmails,
  outgoingDomains,
  setOutgoingDomains,
  outgoingEmails,
  setOutgoingEmails,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Exception Lists
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure exception domains and email addresses for incoming and
          outgoing rules
        </p>
      </div>

      {/* Domain Exceptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListEditor
          placeholder="Enter domain (e.g., example.com)"
          label="Incoming Exception Domains"
          list={incomingDomains}
          setList={setIncomingDomains}
          type="domain"
        />
        <ListEditor
          placeholder="Enter domain (e.g., example.com)"
          label="Outgoing Exception Domains"
          list={outgoingDomains}
          setList={setOutgoingDomains}
          type="domain"
        />
      </div>

      {/* Email Exceptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ListEditor
          placeholder="Enter email address (e.g., user@example.com)"
          label="Incoming Exception Emails"
          list={incomingEmails}
          setList={setIncomingEmails}
          type="email"
          domainLists={[incomingDomains, outgoingDomains]}
        />

        <ListEditor
          placeholder="Enter email address (e.g., user@example.com)"
          label="Outgoing Exception Emails"
          list={outgoingEmails}
          setList={setOutgoingEmails}
          type="email"
          domainLists={[incomingDomains, outgoingDomains]}
        />
      </div>

      <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
        <div className="flex items-start gap-2">
          <svg
            className="text-primary mt-0.5 h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-left">
            <p className="text-foreground text-sm font-medium">
              About Exception Lists
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Exception lists allow specific domains or email addresses to
              bypass blocking rules. You can add multiple entries separated by
              commas. Email addresses cannot be from domains that are already in
              the domain exception lists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionListsStep;
