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

import { useState } from "react";
import { useAtomValue } from "jotai";
import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import {
  useCreateInitialInvoice,
  useGetLatestInvoiceId,
  useUploadInvoice,
} from "@/hooks/useInvoice";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import Breadcrumbs from "@/components/common/Breadcrumbs";

import { pdf } from "@react-pdf/renderer";
import InvoicePDFDocument from "./InvoicePDF";
import { COMPANY_DATA, BANK_DETAILS } from "./invoiceData";
import { getValidDate, toDateTimeLocalStringDefault } from "@/utils/dateFormat";
import InvoiceStep1 from "./steps/InvoiceStep1";
import InvoiceStep2 from "./steps/InvoiceStep2";
import { useNavigate } from "react-router-dom";
import { useUserTimezone } from "@/hooks/useTimezone";
import { toFixedNumber } from "@/utils/numberFormat";
import { BackButton } from "@/components/common/Buttons";

function InvoiceCreationWrapper() {
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const navigate = useNavigate();
  const { convertToUTC } = useUserTimezone();
  const [currentStep, setCurrentStep] = useState(0);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const { data: latestInvoiceData } = useGetLatestInvoiceId();
  const { mutate: createInitialInvoice, isPending: isCreatingInitial } =
    useCreateInitialInvoice();
  const { mutate: uploadInvoice, isPending: isUploading } = useUploadInvoice();
  const { data: organizationDetails } =
    useGetOrganizationDetail(organization_id);
  const isPending = isCreatingInitial || isUploading;

  // Handle step 1 completion
  const handleStep1Complete = (data) => {
    setStep1Data(data);
    setCurrentStep(1);
  };

  // Handle step 2 completion (form submission)
  const handleStep2Complete = async (data) => {
    if (!step1Data) {
      toast(
        "error",
        "Step 1 data is missing. Please go back and complete step 1.",
      );
      return;
    }

    setStep2Data(data);

    try {
      // Generate PDF blob
      const pdfBlob = await generatePDFBlob({ ...step1Data, ...data });

      // Prepare initial data
      const initialData = {
        alerts: {
          notification_period: step1Data.notification_period,
          notify_users: step1Data.notify_users,
          send_notification: step1Data.send_notification,
        },

        due_date: convertToUTC(step1Data.due_date),
        invoice_date: convertToUTC(step1Data.invoice_date),
        invoice_id: step1Data.invoice_id,
        is_paid: step1Data.is_paid || false,
      };

      // Prepare invoice data
      const invoiceData = {
        basic_details: {
          amount: toFixedNumber(data.totalAmount),
          currency: step1Data.currency || "INR",
          is_refundable: step1Data.is_refundable || false,
          description: step1Data.description,
          client_details: step1Data.client_details,
          company_details: COMPANY_DATA,
        },
        invoice_details: {
          description: step1Data.description,
          gst_number: step1Data.client_details?.gst_number || "",
          invoice_date: convertToUTC(step1Data.invoice_date),
          invoice_id: step1Data.invoice_id,
          items: data.items.map((item) => ({
            ...item,
            amount: parseFloat(item.amount) || 0,
            rate: item.rate || "",
          })),
          tax_details: {
            tax_type: data.taxType,
            tax_amount: data.taxAmount,
            tax_rate:
              data.taxType === "igst"
                ? data.igstRate
                : data.sgstRate + data.cgstRate,
            sgst_rate:
              data.taxType === "sgst_cgst" ? parseFloat(data.sgstRate) || 9 : 0,
            cgst_rate:
              data.taxType === "sgst_cgst" ? parseFloat(data.cgstRate) || 9 : 0,
            igst_rate:
              data.taxType === "igst" ? parseFloat(data.igstRate) || 18 : 0,
            sgst_amount: data.sgstAmount,
            cgst_amount: data.cgstAmount,
            igst_amount: data.igstAmount,
            total_amount: toFixedNumber(data.totalAmount),
          },
          template_type: data.template_type || "standard-v1",
          roundOffEnabled: data?.roundOffEnabled || false,

          total_amount: data.subtotal,
          ...(data.template_type === "standard-v2" && {
            domain: data.domain,
            period: data.period,
          }),
        },
        invoice_id: step1Data.invoice_id,
        revision_date: convertToUTC(step1Data.invoice_date),
        revision_number: 1,
      };

      const formData = new FormData();
      const payload = {
        initial_data: initialData,
        invoice_data: invoiceData,
      };

      formData.append(
        "invoice",
        pdfBlob,
        `invoice-${step1Data.invoice_id}.pdf`,
      );

      createInitialInvoice(
        { organization_id: organization_id, payload },
        {
          onSuccess: (response) => {
            uploadInvoice(
              {
                organization_id,
                revision_id: response?.revision_id,
                formData,
              },
              {
                onSettled: () => {
                  toast(
                    "success",
                    "Invoice created and uploaded successfully!",
                  );

                  navigate(`/crm/invoice`);
                  setCurrentStep(0);
                  setStep1Data(null);
                  setStep2Data(null);
                },
              },
            );
          },
          onError: (error) => {
            toast("error", error?.message || "Failed to create invoice");
          },
        },
      );
    } catch (error) {
      console.error("Error in invoice submission:", error);
      toast("error", "Failed to generate invoice PDF");
    }
  };

  // Helper function to generate PDF blob
  const generatePDFBlob = async (combinedData) => {
    try {
      const invoiceDetails = {
        ...combinedData,
        invoice_date: getValidDate(combinedData.invoice_date),
        bill_number: combinedData.invoice_id,
        date: combinedData.invoice_date,
        po_date: new Date(combinedData.invoice_date).toLocaleDateString(
          "en-IN",
        ),
        state_code: "29",
        gstin_code: COMPANY_DATA.gst_number,
        items:
          combinedData.items?.map((item) => ({
            ...item,
            rate: parseFloat(item.rate) || "",
            price: parseFloat(item.amount) || 0,
          })) || [],
        subtotal: combinedData.subtotal,
        tax_amount: combinedData.taxAmount,
        total_amount: combinedData.totalAmount,
        tax_type: combinedData.taxType,
        sgst_amount: combinedData.sgstAmount,
        cgst_amount: combinedData.cgstAmount,
        sgst_rate:
          combinedData.taxType === "sgst_cgst" ? combinedData.sgstRate || 9 : 0,
        cgst_rate:
          combinedData.taxType === "sgst_cgst" ? combinedData.cgstRate || 9 : 0,
        igst_amount: combinedData.igstAmount,
        igst_rate:
          combinedData.taxType === "igst" ? combinedData.igstRate || 18 : 0,
        ...(combinedData.roundOffEnabled && {
          roundOffAmount: combinedData.roundOffAmount || 0,
          roundOffEnabled: true,
        }),
      };

      const pdfDocument = (
        <InvoicePDFDocument
          companyData={COMPANY_DATA}
          clientData={combinedData.client_details}
          invoiceDetails={invoiceDetails}
          bankDetails={BANK_DETAILS}
        />
      );

      const blob = await pdf(pdfDocument).toBlob();
      return blob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  };

  // Go back to previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <InvoiceStep1
            organizationDetails={organizationDetails}
            latestInvoiceData={latestInvoiceData}
            onComplete={handleStep1Complete}
            initialData={step1Data}
          />
        );
      case 1:
        return (
          <InvoiceStep2
            step1Data={step1Data}
            onComplete={handleStep2Complete}
            onPrevious={handlePreviousStep}
            isPending={isPending}
            initialData={step2Data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto w-full space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}

        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[
              { name: "CRM" },
              { name: "Invoices", link: "/crm/invoice" },
              { name: "Create Invoice" },
            ]}
          />
        </div>

        <div className="bg-card border-border overflow-hidden rounded-xl border">
          {/* Current Step Content */}
          <div className="min-h-[600px]">{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceCreationWrapper;
