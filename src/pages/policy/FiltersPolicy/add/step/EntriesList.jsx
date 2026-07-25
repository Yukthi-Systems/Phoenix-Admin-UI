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

import InfoBox from "@/components/common/InfoBox";
import FiltersListEditor from "../FilterListEditor";

const EntriesStep = ({ list, setList, isEmail }) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          {isEmail ? "Email" : "Domain"} Entries
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add {isEmail ? "email addresses" : "domains"} to the filter list
        </p>
      </div>

      <fieldset className="border-border rounded-md border p-6">
        <legend className="text-foreground px-2 text-left text-base font-medium">
          {isEmail ? "Email" : "Domain"} List
        </legend>

        <FiltersListEditor list={list} setList={setList} isEmail={isEmail} />
      </fieldset>

      <InfoBox
        title="Batch Entry Support"
        description={
          isEmail
            ? "You can add multiple entries at once by separating them with commas. For example: user1@example.com, user2@example.com, user3@example.com"
            : "You can add multiple entries at once by separating them with commas. For example: example.com, domain.org, site.net"
        }
      />
    </div>
  );
};

export default EntriesStep;
