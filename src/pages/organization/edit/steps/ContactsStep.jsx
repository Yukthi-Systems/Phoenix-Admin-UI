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

import ContactManager from "../../add/ContactManager";

const ContactsStep = ({
  contactKeys,
  setContactKeys,
  editingContact,
  setEditingContact,
  newContact,
  setNewContact,
  register,
  getValues,
  setValue,
}) => {

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Contact Information
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add contact persons for this organization
        </p>
      </div>

      <fieldset className="border-border rounded-md border p-6">
        <div className="mb-4 flex items-center justify-between">
          <legend className="text-foreground text-left text-base font-medium">
            Contacts
          </legend>
          {contactKeys.length === 0 && (
            <span className="text-destructive text-sm">
              At least one contact is required
            </span>
          )}
        </div>

        <ContactManager
          contactKeys={contactKeys}
          setContactKeys={setContactKeys}
          editingContact={editingContact}
          setEditingContact={setEditingContact}
          newContact={newContact}
          setNewContact={setNewContact}
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      </fieldset>

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
              Contact Requirements
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              At least one contact is required. Phone numbers should be in
              international format (e.g., +123456789012).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsStep;
