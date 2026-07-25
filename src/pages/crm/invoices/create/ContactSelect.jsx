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

import Dropdown from "@/components/common/Dropdown";
import { useState, useEffect } from "react";

const ContactSelector = ({
  control,
  errors,
  organizationDetails,
  onContactSelect,
  name = "selected_contact",
  label = "Select Contact Person",
  customStyle = "",
  isRequired = false,
}) => {
  const [contactOptions, setContactOptions] = useState([]);

  // Convert contacts object to select options
  useEffect(() => {
    if (organizationDetails?.details?.contact_info) {
      const contacts = organizationDetails.details.contact_info;

      // Handle both object and array formats
      let contactArray = [];
      if (Array.isArray(contacts)) {
        contactArray = contacts;
      } else if (typeof contacts === "object") {
        // Convert contacts object to array with keys
        contactArray = Object.entries(contacts).map(([key, contact]) => ({
          ...contact,
          contact_id: key,
        }));
      }

      const options = contactArray.map((contact, index) => {
        const contactId = contact.contact_id || `contact_${index}`;
        const contactName = contact.name || `Contact ${index + 1}`;
        const contactType = contact.type || "";
        const contactEmail = contact.email || "";
        const contactPhone = contact.phone || "";

        // Create display label with name, type, and contact info
        const contactInfo = [contactEmail, contactPhone]
          .filter(Boolean)
          .join(" | ");
        const displayLabel = `${contactName}${contactType ? ` (${contactType})` : ""}${contactInfo ? ` - ${contactInfo}` : ""}`;

        return {
          value: contactId,
          label: displayLabel,
          contact: {
            ...contact,
            contact_id: contactId,
          },
        };
      });

      setContactOptions(options);
    } else {
      setContactOptions([]);
    }
  }, [organizationDetails]);

  // Handle contact selection
  const handleContactChange = (selectedOption) => {
    if (selectedOption && onContactSelect) {
      const selectedContact = selectedOption.contact;
      onContactSelect(selectedContact);
    } else if (!selectedOption && onContactSelect) {
      // Clear selection
      onContactSelect(null);
    }
  };

  return (
    <Dropdown
      label={label}
      name={name}
      control={control}
      options={contactOptions}
      errors={errors}
      customStyle={customStyle}
      placeholder="Choose a contact person..."
      isRequired={isRequired}
      isClearable={true}
      onChange={handleContactChange}
      noOptionsMessage={() => "No contacts available"}
    />
  );
};

export default ContactSelector;
