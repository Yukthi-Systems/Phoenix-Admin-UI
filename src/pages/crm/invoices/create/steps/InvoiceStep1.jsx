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

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Building2, FileText, Calendar, Users, Bell } from "lucide-react";
import * as yup from "yup";

import { Input, TextArea } from "@/components/common/Inputs";
import { Button } from "@/components/common/Buttons";
import ReactSelect from "@/components/common/Dropdown";
import BranchSelector from "../BranchSelect";
import ContactSelector from "../ContactSelect";
import DateTimePicker from "@/components/common/DateTimePicker"; // Import the DateTimePicker
import { toDateTimeLocalStringDefault } from "@/utils/dateFormat";
import { step1DefaultValues } from "../invoiceDefaultValues";
import { step1Schema } from "../validationSchema";

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Use local timezone instead of UTC to prevent date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
};

function InvoiceStep1({
  organizationDetails,
  latestInvoiceData,
  onComplete,
  initialData,
}) {
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactOptions, setContactOptions] = useState([]);
  const [dueDateError, setDueDateError] = useState("");

  const getInitialValues = () => {
    if (initialData) {
      return {
        ...initialData,
        invoice_date:
          formatDateForInput(initialData.invoice_date) ||
          step1DefaultValues.invoice_date,
        due_date: initialData.due_date ? new Date(initialData.due_date) : null,
        selected_branch: initialData.client_details
          ? initialData.selected_branch || "selected"
          : "",
        selected_contact: initialData.contact_details
          ? initialData.selected_contact || ""
          : "",
        // Notification settings
        notify_users: initialData.notify_users || ["accounts@yukthi.com"],
        send_notification:
          initialData.send_notification !== undefined
            ? initialData.send_notification
            : true,
      };
    }
    return {
      ...step1DefaultValues,
      due_date: null,
      // Default notification settings
      notify_users: [""],
      send_notification: true,
    };
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
    setError,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: getInitialValues(),
    resolver: yupResolver(step1Schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (organizationDetails?.details?.contact_info) {
      const contacts = organizationDetails.details?.contact_info;

      let contactArray = [];
      if (Array.isArray(contacts)) {
        contactArray = contacts;
      } else if (typeof contacts === "object") {
        contactArray = Object.entries(contacts).map(([key, contact]) => ({
          ...contact,
          contact_id: key,
        }));
      }

      const options = [
        ...contactArray.map((contact) => ({
          value: contact.email || `${contact.name}@company.com`,
          label: `${contact.email || `${contact.name}@company.com`}`,
        })),
      ];

      setContactOptions(options);
    } else {
      setContactOptions([
        {
          value: "accounts@yukthi.com",
          label: "accounts@yukthi.com (Default)",
        },
      ]);
    }
  }, [organizationDetails]);

  useEffect(() => {
    if (initialData) {
      if (initialData.client_details) {
        setSelectedClientData(initialData.client_details);
      }
      if (initialData.branch_details) {
        setSelectedBranch(initialData.branch_details);
      }
      if (initialData.contact_details) {
        setSelectedContact(initialData.contact_details);
      }
      reset(getInitialValues());
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!initialData?.invoice_id) {
      if (latestInvoiceData?.latest_invoice_id) {
        const latestId = latestInvoiceData.latest_invoice_id;
        const match = latestId.match(/(\d+)$/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          const nextId = latestId.replace(
            /\d+$/,
            nextNumber.toString().padStart(3, "0"),
          );
          setValue("invoice_id", nextId);
        }
      } else {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        setValue(
          "invoice_id",
          `${currentYear}-${nextYear.toString().slice(-2)}/001`,
        );
      }
    }
  }, [latestInvoiceData, setValue, initialData]);

  const handleBranchSelect = (clientData, branchData) => {
    setSelectedClientData(clientData);
    setSelectedBranch(branchData);
    setValue("client_details", clientData);
    updateClientData(clientData, selectedContact);
  };

  const handleContactSelect = (contactData) => {
    setSelectedContact(contactData);
    setValue("contact_details", contactData);
    updateClientData(selectedClientData, contactData);
  };

  // Update client data with contact info
  const updateClientData = (clientData, contactData) => {
    if (clientData) {
      const updatedClientData = {
        ...clientData,
        contact_details: contactData
          ? {
              name: contactData.name || "",
              email: contactData.email || "",
              phone: contactData.phone || "",
              type: contactData.type || "",
              contact_id: contactData.contact_id || "",
            }
          : null,
      };
      setSelectedClientData(updatedClientData);
      setValue("client_details", updatedClientData);
    }
  };

  const isPaid = watch("is_paid");
  const isRefundable = watch("is_refundable");
  const sendNotification = watch("send_notification");
  const dueDate = watch("due_date");
  const invoiceDate = watch("invoice_date");

  const handleInvoiceDateChange = (date) => {
    setValue("invoice_date", date);

    if (invoiceDate) {
      clearErrors("invoice_date");
      trigger("invoice_date");
    }
  };

  const validateDueDate = (date) => {
    if (!date) return "Please Select a date";
    if (sendNotification && !isPaid) {
      const currentTime = new Date();
      const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);

      if (date < oneHourFromNow) {
        return "Due date must be at least 1 hour from now when notifications are enabled and payment is not marked as paid";
      }
    }

    return "";
  };

  const handleDueDateChange = (date) => {
    setValue("due_date", date);

    const error = validateDueDate(date);
    if (error) {
      setDueDateError(error);
    } else {
      setDueDateError("");
    }
  };

  useEffect(() => {
    if (dueDate) {
      const error = validateDueDate(dueDate);
      setDueDateError(error);
    }
  }, [sendNotification, isPaid, dueDate]);

  const onSubmit = (data) => {
    if (!selectedClientData) {
      return;
    }

    if (data.due_date) {
      const dueDateValidationError = validateDueDate(data.due_date);
      if (dueDateValidationError) {
        setDueDateError(dueDateValidationError);
        return;
      }
    }

    const formattedData = {
      ...data,
      invoice_date: toDateTimeLocalStringDefault(new Date(data.invoice_date)),
      due_date: data.due_date
        ? toDateTimeLocalStringDefault(new Date(data.due_date))
        : null,
      client_details: selectedClientData,
      branch_details: selectedBranch,
      contact_details: selectedContact,
      currency: "INR", // Default currency
      // Include notification settings
      alerts: {
        notify_users: data.notify_users || [""],
        send_notification:
          data.send_notification !== undefined ? data.send_notification : true,
      },
    };

    onComplete(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-border divide-y">
      {/* Branch & Contact Selection Section */}
      <div className="from-accent/30 bg-gradient-to-r to-transparent p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Building2 className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-xl font-semibold">
            Client Branch & Contact Selection
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Branch Selection */}
          <div className="space-y-4">
            <BranchSelector
              control={control}
              errors={errors}
              organizationDetails={organizationDetails}
              onBranchSelect={handleBranchSelect}
              name="selected_branch"
              label="Select Branch"
              isRequired={true}
              initialClientData={selectedClientData}
              initialBranchData={selectedBranch}
            />
          </div>

          {/* Contact Selection */}
          <div className="space-y-4">
            <ContactSelector
              control={control}
              errors={errors}
              organizationDetails={organizationDetails}
              onContactSelect={handleContactSelect}
              name="selected_contact"
              label="Select Contact Person"
              isRequired={false}
            />
          </div>
        </div>
      </div>

      {/* Basic Invoice Details */}
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <FileText className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-xl font-semibold">
            Invoice Information
          </h2>
        </div>

        <div className="space-y-6">
          {/* First Row: ID, Invoice Date, Due Date */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Input
              label="Invoice ID"
              name="invoice_id"
              register={register}
              errors={errors}
              disabled
              isRequired
              icon={<FileText className="h-4 w-4" />}
            />
            <div>
              <DateTimePicker
                label="Invoice Date & Time"
                value={invoiceDate}
                onChange={handleInvoiceDateChange}
                includeTime={false}
                placeholder="Select invoice date"
                isRequired={true}
                error={errors?.invoice_date?.message}
                info="Date and time when the invoice was created"
              />
            </div>
            <div>
              <DateTimePicker
                label="Due Date & Time"
                value={dueDate}
                onChange={handleDueDateChange}
                includeTime={true}
                placeholder="Select due date and time..."
                isRequired={true}
                error={errors?.due_date?.message || dueDateError}
                info={
                  sendNotification && !isPaid
                    ? "Due date must be at least 1 hour from now"
                    : ""
                }
              />
            </div>
          </div>

          {/* Second Row: Description */}
          <div className="grid grid-cols-1">
            <TextArea
              label="Description"
              name="description"
              register={register}
              errors={errors}
              placeholder="Brief description of the invoice"
              isRequired
            />
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Bell className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-xl font-semibold">
            Notification Settings
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 space-y-6">
          {/* Enable Notifications Toggle */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground mb-1 text-left text-sm font-medium">
                  Enable Notifications
                </h3>
                <p className="text-muted-foreground text-left text-xs">
                  Send notification emails for this invoice
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={sendNotification}
                  onChange={(e) =>
                    setValue("send_notification", e.target.checked)
                  }
                />
                <div className="bg-muted peer-focus:ring-primary/20 peer peer-checked:bg-primary relative h-6 w-11 rounded-full peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                <span className="text-foreground ml-3 text-sm font-medium">
                  {sendNotification ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
          </div>

          {/* Notification Details - Only show if notifications are enabled */}
          {sendNotification && (
            <div className="grid grid-cols-1">
              <ReactSelect
                control={control}
                name="notify_users"
                label="Notify Users"
                options={contactOptions}
                errors={errors}
                placeholder="Select users to notify..."
                isMulti={true}
                required={sendNotification}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg p-2">
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <h2 className="text-foreground text-xl font-semibold">
            Invoice Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Is Paid Switch */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground mb-1 text-left text-sm font-medium">
                  Payment Status
                </h3>
                <p className="text-muted-foreground text-left text-xs">
                  Mark if this invoice has been paid
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isPaid}
                  onChange={(e) => setValue("is_paid", e.target.checked)}
                />
                <div className="bg-muted peer-focus:ring-primary/20 peer peer-checked:bg-primary relative h-6 w-11 rounded-full peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                <span className="text-foreground ml-3 text-sm font-medium">
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
              </label>
            </div>
          </div>

          {/* Is Refundable Switch */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground mb-1 text-left text-sm font-medium">
                  Refundable Status
                </h3>
                <p className="text-muted-foreground text-left text-xs">
                  Mark if this invoice is refundable
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isRefundable}
                  onChange={(e) => setValue("is_refundable", e.target.checked)}
                />
                <div className="bg-muted peer-focus:ring-primary/20 peer peer-checked:bg-primary relative h-6 w-11 rounded-full peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                <span className="text-foreground ml-3 text-sm font-medium">
                  {isRefundable ? "Refundable" : "Non-refundable"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="from-muted/30 bg-gradient-to-r to-transparent p-6">
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!selectedClientData || dueDateError}
            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r text-white shadow-lg"
          >
            Continue to Items & Tax →
          </Button>
        </div>

        {!selectedClientData && (
          <div className="bg-warning/10 border-warning/20 mt-4 rounded-lg border p-3">
            <div className="text-warning flex items-center gap-2 text-sm">
              <span className="bg-warning h-2 w-2 rounded-full"></span>
              Please select a branch to continue.
            </div>
          </div>
        )}

        {dueDateError && (
          <div className="bg-destructive/10 border-destructive/20 mt-4 rounded-lg border p-3">
            <div className="text-destructive flex items-center gap-2 text-sm">
              <span className="bg-destructive h-2 w-2 rounded-full"></span>
              {dueDateError}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default InvoiceStep1;
