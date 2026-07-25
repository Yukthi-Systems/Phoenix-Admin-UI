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

import { useState, useCallback } from "react";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { Input, InputOnly } from "@/components/common/Inputs";
import { useToastify } from "@/hooks/useToastify";
import { nanoid } from "nanoid";
import PhoneInput, { PhoneInputOnly } from "@/components/common/PhoneInput";

const ContactManager = ({
  contactKeys,
  setContactKeys,
  editingContact,
  setEditingContact,
  newContact,
  setNewContact,
  register,
  getValues,
  setValue,
  watch,
}) => {
  const toast = useToastify();

  const handleContactChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  }, [setNewContact]);

  const addContact = () => {
    if (!newContact.name.trim()) {
      toast("error", "Contact name is required");
      return;
    }

    if (newContact.phone && !/^\+?\d{1,15}$/.test(newContact.phone)) {
      toast("error", "Phone number must be in international format");
      return;
    }

    const newId = nanoid();
    setValue(`details.contact_info.${newId}`, newContact);
    setContactKeys((prev) => [...prev, newId]);
    setNewContact({
      name: "",
      phone: "",
      email: "",
      type: "",
      notes: "",
    });
    toast("success", "Contact added successfully");
  };

  const saveContact = (id) => {
    setEditingContact(null);
    toast("success", "Contact updated successfully");
  };

  const removeContact = (id) => {
    setContactKeys((prev) => prev.filter((key) => key !== id));
    setValue(`details.contact_info.${id}`, undefined);
    if (editingContact === id) setEditingContact(null);
    toast("success", "Contact removed successfully");
  };

  return (
    <div className="space-y-6">
      {/* Contact Form */}
      <div className="bg-muted/10 grid grid-cols-1 gap-4 rounded-md p-4 md:grid-cols-2 xl:grid-cols-3">
        <InputOnly
          label="Name"
          name="name"
          value={newContact.name}
          onChange={handleContactChange}
          placeholder="Full name"
          isRequired={true}
        />
        {/* <InputOnly
          label="Phone"
          name="phone"
          type="tel"
          value={newContact.phone}
          onChange={handleContactChange}
          placeholder="+123456789012"
          pattern="^\+?\d{1,15}$"
          title="Enter up to 15 digits, with an optional leading +"
        /> */}

        <PhoneInputOnly
          label="Phone"
          name="phone"
          placeholder="1234567890"
          register={register}
          value={newContact.phone}
          onChange={handleContactChange}
          watch={watch}
          setValue={setValue}
          isRequired={false}
        />

        <InputOnly
          label="Email"
          name="email"
          type="email"
          value={newContact.email}
          onChange={handleContactChange}
          placeholder="Email"
        />
        <InputOnly
          label="Type"
          name="type"
          value={newContact.type}
          onChange={handleContactChange}
          placeholder="Contact Type (Technical, Accounts...)"
        />
        <InputOnly
          label="Notes"
          name="notes"
          value={newContact.notes}
          onChange={handleContactChange}
          placeholder="Additional notes"
        />
        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={addContact}
            className="text-primary-foreground bg-primary hover:bg-primary/90 flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Contact Table */}
      <div className="overflow-x-auto">
        <table className="border-border min-w-full rounded-lg border">
          <thead>
            <tr className="bg-muted/20">
              <th className="text-card-foreground border-border border-r border-b p-2 text-center text-sm font-medium">
                Name
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-center text-sm font-medium">
                Phone
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-center text-sm font-medium">
                Email
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-center text-sm font-medium">
                Type
              </th>
              <th className="text-card-foreground border-border border-r border-b p-2 text-center text-sm font-medium">
                Notes
              </th>
              <th className="text-card-foreground border-border w-24 border-b p-2 text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contactKeys.map((id) => (
              <tr key={id} className="border-border hover:bg-muted/10 border-b">
                <td className="border-border border-r p-2">
                  {editingContact === id ? (
                    <Input
                      name={`details.contact_info.${id}.name`}
                      register={register}
                      placeholder="Full name"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2">
                      {getValues(`details.contact_info.${id}.name`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingContact === id ? (
                    <Input
                      name={`details.contact_info.${id}.phone`}
                      register={register}
                      placeholder="+123456789012"
                      hideLabel
                      type="tel"
                    />
                  ) : (
                    <div className="p-2">
                      {getValues(`details.contact_info.${id}.phone`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingContact === id ? (
                    <Input
                      name={`details.contact_info.${id}.email`}
                      register={register}
                      placeholder="Email"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2">
                      {getValues(`details.contact_info.${id}.email`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingContact === id ? (
                    <Input
                      name={`details.contact_info.${id}.type`}
                      register={register}
                      placeholder="Contact Type"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2">
                      {getValues(`details.contact_info.${id}.type`) || "-"}
                    </div>
                  )}
                </td>
                <td className="border-border border-r p-2">
                  {editingContact === id ? (
                    <Input
                      name={`details.contact_info.${id}.notes`}
                      register={register}
                      placeholder="Notes"
                      hideLabel
                    />
                  ) : (
                    <div className="p-2">
                      {getValues(`details.contact_info.${id}.notes`) || "-"}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-1">
                    {editingContact === id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveContact(id)}
                          className="text-success hover:bg-success/10 rounded-full p-1.5"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingContact(null)}
                          className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingContact(id)}
                          className="text-primary hover:bg-primary/10 rounded-full p-1.5"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContact(id)}
                          className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contactKeys.length === 0 && (
          <div className="text-muted-foreground py-4 text-center">
            No contacts added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;
