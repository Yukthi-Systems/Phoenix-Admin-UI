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

import { ListEditorEmail } from "@/pages/mailbox/add/ListEditors";
import React from "react";

function MailInfoStep({
  watch,
  domain_name,
  forwardToEmails,
  setForwardToEmails,
  fromEmails,
  setFromEmails,
  subjectContains,
  setSubjectContains,
}) {
  return (
    <div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ListEditorEmail
            placeholder="user@yourdomain.com"
            label="Forward to emails"
            list={forwardToEmails}
            setList={setForwardToEmails}
            type="email"
          />
          <ListEditorEmail
            placeholder="user@externaldomain.com"
            label="From emails"
            list={fromEmails}
            setList={setFromEmails}
            type="email"
          />
        </div>
      </div>

      <div className="space-y-2 mt-8">
        <div className="text-left">
          <h3 className="text-foreground text-lg font-semibold">
            Specific Email Subject
          </h3>
        </div>

        <ListEditorEmail
          placeholder="Enter email Subject"
          label="Email Subject"
          list={subjectContains}
          setList={setSubjectContains}
          type="text"
        />
      </div>
    </div>
  );
}

export default MailInfoStep;
