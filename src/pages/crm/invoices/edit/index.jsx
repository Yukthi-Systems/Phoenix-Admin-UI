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

import {
  useFetchInvoiceWithRevisions,
  useUpdateInitialInvoice,
} from "@/hooks/useInvoice";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useToastify } from "@/hooks/useToastify";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { BackButton, SubmitButton } from "@/components/common/Buttons";
import { FormHeader } from "@/components/common/labels";
import { Checkbox, Input } from "@/components/common/Inputs";
import ReactSelect from "@/components/common/Dropdown";
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import DataErrorWithReload from "@/components/common/DataErrorWithReload";
import {
  toDateTimeLocalStringDefault,
  toLocalISOString,
} from "@/utils/dateFormat";
import { Bell, Calendar, CreditCard, Settings } from "lucide-react";

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Use local timezone instead of UTC to prevent date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    return "";
  }
};

// Validation schema for edit invoice
const editInvoiceFormSchema = yup.object().shape({
  is_paid: yup.boolean().required("Payment status is required"),
  is_refundable: yup.boolean().required("Refundable status is required"),
  due_date: yup
    .string()
    .required("Due date is required")
    .test("is-valid-date", "Invalid due date", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return date instanceof Date && !isNaN(date);
    }),
  alerts: yup.object().shape({
    send_notification: yup
      .boolean()
      .required("Notification setting is required"),
    notification_period: yup.number().when("send_notification", {
      is: true,
      then: (schema) =>
        schema
          .required(
            "Notification period is required when notifications are enabled",
          )
          .min(1, "Notification period must be at least 1 day")
          .max(365, "Notification period cannot exceed 365 days"),
      otherwise: (schema) => schema.nullable(),
    }),
    notify_users: yup.array().when("send_notification", {
      is: true,
      then: (schema) =>
        schema
          .min(
            1,
            "At least one email is required when notifications are enabled",
          )
          .max(10, "Maximum 10 email addresses allowed")
          .test(
            "unique-emails",
            "Duplicate email addresses are not allowed",
            function (emails) {
              if (!emails) return true;
              // Extract actual email values from potential objects
              const emailValues = emails.map((email) =>
                typeof email === "string" ? email : email?.value || email,
              );
              const unique = new Set(emailValues);
              return unique.size === emailValues.length;
            },
          )
          .test(
            "valid-format",
            "All selected emails must be valid",
            function (emails) {
              if (!emails) return true;
              // Handle both string array and object array formats from ReactSelect
              return emails.every((email) => {
                const emailValue =
                  typeof email === "string" ? email : email?.value || email;
                return (
                  typeof emailValue === "string" &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
                );
              });
            },
          ),
      otherwise: (schema) => schema.optional(),
    }),
  }),
});

// Default values
const editInvoiceDefaultValues = {
  is_paid: false,
  is_refundable: false,
  due_date: "",
  alerts: {
    send_notification: false,
    notification_period: 7,
    notify_users: [],
  },
};

const EditInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useAtomValue(userInfoAtom);
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get("invoice_id");

  // API hooks
  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
  } = useFetchInvoiceWithRevisions(organization_id, invoiceId);
  const { mutate: updateInvoice, isPending } = useUpdateInitialInvoice();
  const { data: organizationDetails } =
    useGetOrganizationDetail(organization_id);

  // State for managing contact options
  const [contactOptions, setContactOptions] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: editInvoiceDefaultValues,
    resolver: yupResolver(editInvoiceFormSchema),
    mode: "onChange",
  });

  const sendNotification = watch("alerts.send_notification");
  const isPaid = watch("is_paid");
  const isRefundable = watch("is_refundable");

  // Set up contact options from organization details
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

  // Populate form when data is loaded
  useEffect(() => {
    if (invoiceData?.data?.invoice) {
      const invoice = invoiceData.data.invoice;
      const alerts = invoice.alerts || {};

      reset({
        is_paid: invoice.is_paid || false,
        is_refundable: invoice.is_refundable || false,
        due_date: invoice.due_date
          ? toDateTimeLocalStringDefault(new Date(invoice.due_date))
          : "",
        alerts: {
          send_notification: alerts.send_notification || false,
          notification_period: alerts.notification_period || 7,
          notify_users: alerts.notify_users || [],
        },
      });
    }
  }, [invoiceData, reset]);

  const onSubmit = (formData) => {
    const notifyUsers = formData.alerts.notify_users || [];
    const emailList = notifyUsers.map((user) =>
      typeof user === "string" ? user : user.value || user,
    );

    const payload = {
      is_paid: formData.is_paid,
      is_refundable: formData.is_refundable,
      due_date: formatDateTimeForInput(formData.due_date),
      alerts: {
        send_notification: formData.alerts.send_notification,
        notification_period: formData.alerts.send_notification
          ? formData.alerts.notification_period
          : null,
        notify_users: formData.alerts.send_notification ? emailList : [],
      },
      invoice_date: invoiceData.data.invoice.invoice_date,
      invoice_id: invoiceId,
    };

    updateInvoice(
      {
        organization_id: organization_id,
        payload,
      },
      {
        onSuccess: () => {
          toast("success", "Invoice updated successfully");
          navigate("/crm/invoice");
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || error.message || "Unknown error";
          const tracebackId = error.response?.data?.traceback_id;
          toast(
            "error",
            `Message: ${message}${tracebackId ? `\nTraceback ID: ${tracebackId}` : ""}`,
          );
        },
      },
    );
  };

  if (!permissions.includes("crm:invoice:edit")) {
    return (
      <AccessDenied content="You don't have permission to edit invoices." />
    );
  }

  if (isLoading) {
    return <DataLoading />;
  }

  if (isError) {
    return <DataErrorWithReload error={error} />;
  }

  // No invoice data
  if (!invoiceData?.data?.invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-muted-foreground">
          <p>Invoice not found</p>
        </div>
      </div>
    );
  }

  const invoice = invoiceData.data.invoice;

  return (
    <div className="p-6  mx-auto">
      <Breadcrumbs
        items={[
          { name: "CRM" },
          { name: "Invoices", link: "/crm/invoice" },
          {
            name: "View Invoice",
            link: `/crm/invoice/view?invoice_id=${invoice?.invoice_id}`,
          },
          { name: `Edit Invoice` },
        ]}
      />

      <div className="mt-6">
        <FormHeader
          title={`Edit Invoice ${invoice.invoice_id}`}
          subtitle="Update payment status, due date, and notification settings"
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 not-last:divide-y "
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Notification Settings
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1 text-left">
                    Enable Notifications
                  </h3>
                  <p className="text-xs text-muted-foreground text-left">
                    Send notification emails for this invoice
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={sendNotification}
                    onChange={(e) =>
                      setValue("alerts.send_notification", e.target.checked)
                    }
                  />
                  <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    {sendNotification ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>

            {sendNotification && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Notification Period (Days)"
                  name="alerts.notification_period"
                  type="number"
                  register={register}
                  errors={errors}
                  min="1"
                  max="365"
                  placeholder="7"
                />

                <ReactSelect
                  control={control}
                  name="alerts.notify_users"
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

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Invoice Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1 text-left">
                    Payment Status
                  </h3>
                  <p className="text-xs text-muted-foreground text-left">
                    Mark if this invoice has been paid
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPaid}
                    onChange={(e) => setValue("is_paid", e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    {isPaid ? "Paid" : "Unpaid"}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Due Date & Time"
                name="due_date"
                type="datetime-local"
                register={register}
                errors={errors}
                isRequired={true}
              />
            </div>
          </div>
        </div>

        <div className="p-6 ">
          <div className="flex gap-3 justify-end">
            <BackButton handleClick={() => navigate("/crm/invoice")} />
            <SubmitButton
              label="Update Invoice"
              isPending={isPending}
              disabled={isPending}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInvoice;
