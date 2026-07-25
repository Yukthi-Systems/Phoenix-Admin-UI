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

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import * as yup from "yup";
import {
  FileText,
  DollarSign,
  Calculator,
  Eye,
  ArrowLeft,
  Copy,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { useToastify } from "@/hooks/useToastify";
import {
  useFetchInvoiceWithRevisions,
  useCreateInitialInvoice,
  useUploadInvoice,
  useGetLatestInvoiceId,
} from "@/hooks/useInvoice";
import { useGetOrganizationDetail } from "@/hooks/useOrganization";
import { useUserTimezone } from "@/hooks/useTimezone";
import { toDateTimeLocalStringDefault } from "@/utils/dateFormat";
import { toFixedNumber } from "@/utils/numberFormat";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Input, TextArea, ControlledInput } from "@/components/common/Inputs";
import { Button } from "@/components/common/Buttons";
import { pdf } from "@react-pdf/renderer";
import InvoicePDFDocument from "../create/InvoicePDF";
import { COMPANY_DATA, BANK_DETAILS } from "../create/invoiceData";
import InvoicePreviewModal from "../create/InvoicePreviewModal";
import DataLoading from "@/components/common/DataLoading";

// Validation schema for copy invoice (minimal fields)
const copyInvoiceSchema = yup.object().shape({
  invoice_id: yup.string().required("Invoice ID is required"),
  invoice_date: yup.string().required("Invoice date is required"),
  description: yup.string().required("Description is required"),
  items: yup
    .array()
    .of(
      yup.object().shape({
        description: yup.string().required("Item description is required"),
        rate: yup.string(),
        amount: yup
          .number()
          .required("Amount is required")
          .min(0, "Amount must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
  sgst_rate: yup.number().min(0).max(100),
  cgst_rate: yup.number().min(0).max(100),
  igst_rate: yup.number().min(0).max(100),
  manual_total_amount: yup.string().optional(),
});

// Default values
const getDefaultValues = () => ({
  invoice_id: "",
  invoice_date: new Date().toISOString().split("T")[0],
  description: "",
  items: [{ description: "", rate: "", amount: 0 }],
  sgst_rate: 9,
  cgst_rate: 9,
  igst_rate: 18,
  manual_total_amount: "",
});

function CreateCopy() {
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get("invoice_id");
  const navigate = useNavigate();
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const { convertToUTC } = useUserTimezone();

  // State
  const [showPreview, setShowPreview] = useState(false);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [taxType, setTaxType] = useState("sgst_cgst");
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);

  // API hooks
  const {
    data: invoiceData,
    isLoading,
    isError,
  } = useFetchInvoiceWithRevisions(organization_id, invoiceId);
  const { data: latestInvoiceData } = useGetLatestInvoiceId();
  const { mutate: createInitialInvoice, isPending: isCreatingInitial } =
    useCreateInitialInvoice();
  const { mutate: uploadInvoice, isPending: isUploading } = useUploadInvoice();
  const { data: organizationDetails } =
    useGetOrganizationDetail(organization_id);

  const isPending = isCreatingInitial || isUploading;

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset,
    getValues,
  } = useForm({
    defaultValues: getDefaultValues(),
    resolver: yupResolver(copyInvoiceSchema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const sgstRate = parseFloat(watch("sgst_rate")) || 0;
  const cgstRate = parseFloat(watch("cgst_rate")) || 0;
  const igstRate = parseFloat(watch("igst_rate")) || 0;
  const manualTotalAmount = watch("manual_total_amount");

  // Load original invoice data
  useEffect(() => {
    if (invoiceData?.data && !isDataLoaded) {
      const invoice = invoiceData.data.invoice;
      const revisions = invoiceData.data.revisions || [];
      const latestRevision = revisions[0];

      if (invoice && latestRevision) {
        setOriginalInvoice({ invoice, latestRevision });

        // Set initial tax type and other settings from original invoice
        const originalTaxType =
          latestRevision.invoice_details?.tax_details?.tax_type || "sgst_cgst";
        setTaxType(originalTaxType);
        setRoundOffEnabled(
          latestRevision.invoice_details?.roundOffEnabled || false,
        );

        // Pre-fill form with original data
        const items = latestRevision.invoice_details?.items || [];
        const formData = {
          invoice_id: "", // Will be set when latest invoice ID is available
          invoice_date: new Date().toISOString().split("T")[0], // Default to today
          description:
            latestRevision.revision_details?.description ||
            latestRevision.invoice_details?.description ||
            "",
          items:
            items.length > 0
              ? items.map((item) => ({
                  description: item.description || "",
                  rate: item.rate || "",
                  amount: item.amount || 0,
                }))
              : [{ description: "", rate: "", amount: 0 }],
          // Add tax rate fields
          sgst_rate:
            latestRevision.invoice_details?.tax_details?.sgst_rate || 9,
          cgst_rate:
            latestRevision.invoice_details?.tax_details?.cgst_rate || 9,
          igst_rate:
            latestRevision.invoice_details?.tax_details?.igst_rate || 18,
          manual_total_amount: "",
        };

        reset(formData);
        setIsDataLoaded(true);
      }
    }
  }, [invoiceData, reset, isDataLoaded]);

  // Set new invoice ID when latest invoice data is available
  useEffect(() => {
    if (latestInvoiceData?.latest_invoice_id && isDataLoaded) {
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
    }
  }, [latestInvoiceData, setValue, isDataLoaded]);

  // Calculate totals (using original tax details or advanced options)
  const calculateTotals = () => {
    if (!originalInvoice) return { subtotal: 0, taxAmount: 0, totalAmount: 0 };

    const subtotal =
      watchedItems?.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0) || 0;

    let taxAmount = 0;
    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;

    if (showAdvancedOptions) {
      // Use form values for tax calculation when advanced options are shown
      if (taxType === "igst") {
        igstAmount = (subtotal * (igstRate || 0)) / 100;
        taxAmount = igstAmount;
      } else {
        sgstAmount = (subtotal * (sgstRate || 0)) / 100;
        cgstAmount = (subtotal * (cgstRate || 0)) / 100;
        taxAmount = sgstAmount + cgstAmount;
      }
    } else {
      // Use original tax configuration when advanced options are hidden
      const taxDetails =
        originalInvoice.latestRevision.invoice_details?.tax_details;
      const taxRate = taxDetails?.tax_rate || 18;
      taxAmount = (subtotal * taxRate) / 100;

      // Calculate individual tax amounts based on original type
      if (taxDetails?.tax_type === "igst") {
        igstAmount = taxAmount;
      } else {
        sgstAmount = taxAmount / 2;
        cgstAmount = taxAmount / 2;
      }
    }

    const calculatedTotal = subtotal + taxAmount;
    const totalAmount = manualTotalAmount
      ? parseFloat(manualTotalAmount)
      : calculatedTotal;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      calculatedTotal,
      sgstAmount,
      cgstAmount,
      igstAmount,
      taxDetails: originalInvoice.latestRevision.invoice_details?.tax_details,
    };
  };

  const {
    subtotal,
    taxAmount,
    totalAmount,
    calculatedTotal,
    sgstAmount,
    cgstAmount,
    igstAmount,
    taxDetails,
  } = calculateTotals();

  // Handle tax type change
  const handleTaxTypeChange = (newTaxType) => {
    setTaxType(newTaxType);

    // Reset tax rates when switching
    if (newTaxType === "igst") {
      setValue("igst_rate", 18);
      setValue("sgst_rate", 0);
      setValue("cgst_rate", 0);
    } else {
      setValue("sgst_rate", 9);
      setValue("cgst_rate", 9);
      setValue("igst_rate", 0);
    }
  };

  // Handle round-off toggle
  const handleRoundOffToggle = (enabled) => {
    setRoundOffEnabled(enabled);
    if (enabled) {
      const roundedAmount = Math.round(calculatedTotal);
      setValue("manual_total_amount", roundedAmount);
    } else {
      setValue("manual_total_amount", "");
    }
  };

  // Handle manual total change
  const handleManualTotalChange = (e) => {
    const value = e.target.value;
    setValue("manual_total_amount", value);

    if (value && roundOffEnabled) {
      setRoundOffEnabled(false);
    }
  };

  // Clear overrides when items change
  useEffect(() => {
    if (!isDataLoaded) return;

    const itemDependencies =
      watchedItems
        ?.map((item) => `${item.description}-${item.rate}-${item.amount}`)
        .join("|") || "";

    if (itemDependencies && (manualTotalAmount || roundOffEnabled)) {
      setValue("manual_total_amount", "");
      if (roundOffEnabled) {
        setRoundOffEnabled(false);
      }
    }
  }, [
    watchedItems,
    setValue,
    taxType,
    sgstRate,
    cgstRate,
    igstRate,
    isDataLoaded,
  ]);

  // Generate PDF blob
  const generatePDFBlob = async (formData) => {
    try {
      const finalTaxDetails = showAdvancedOptions
        ? {
            tax_type: taxType,
            tax_rate: taxType === "igst" ? igstRate : sgstRate + cgstRate,
            sgst_rate: taxType === "sgst_cgst" ? sgstRate : 0,
            cgst_rate: taxType === "sgst_cgst" ? cgstRate : 0,
            igst_rate: taxType === "igst" ? igstRate : 0,
            sgst_amount: sgstAmount,
            cgst_amount: cgstAmount,
            igst_amount: igstAmount,
          }
        : taxDetails;

      const invoiceDetails = {
        ...formData,
        bill_number: formData.invoice_id,
        date: formData.invoice_date,
        po_date: new Date(formData.invoice_date).toLocaleDateString("en-IN"),
        state_code: "29",
        gstin_code: COMPANY_DATA.gst_number,
        items:
          formData.items?.map((item) => ({
            ...item,
            rate: parseFloat(item.rate) || "",
            price: parseFloat(item.amount) || 0,
          })) || [],
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        // Use final tax configuration
        tax_type: finalTaxDetails?.tax_type || "sgst_cgst",
        sgst_amount: finalTaxDetails?.sgst_amount || 0,
        cgst_amount: finalTaxDetails?.cgst_amount || 0,
        sgst_rate: finalTaxDetails?.sgst_rate || 9,
        cgst_rate: finalTaxDetails?.cgst_rate || 9,
        igst_amount: finalTaxDetails?.igst_amount || 0,
        igst_rate: finalTaxDetails?.igst_rate || 18,
        ...(roundOffEnabled && {
          roundOffAmount: Math.abs(
            calculatedTotal - Math.round(calculatedTotal),
          ),
          roundOffEnabled: true,
        }),
      };

      const pdfDocument = (
        <InvoicePDFDocument
          companyData={COMPANY_DATA}
          clientData={
            originalInvoice.latestRevision.revision_details?.client_details
          }
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

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      // Generate PDF blob
      const pdfBlob = await generatePDFBlob(formData);

      // Prepare data from original invoice
      const originalRevision = originalInvoice.latestRevision;
      const originalInvoiceData = originalInvoice.invoice;

      // Prepare final tax details
      const finalTaxDetails = showAdvancedOptions
        ? {
            tax_type: taxType,
            tax_rate: taxType === "igst" ? igstRate : sgstRate + cgstRate,
            sgst_rate: taxType === "sgst_cgst" ? sgstRate : 0,
            cgst_rate: taxType === "sgst_cgst" ? cgstRate : 0,
            igst_rate: taxType === "igst" ? igstRate : 0,
            sgst_amount: sgstAmount,
            cgst_amount: cgstAmount,
            igst_amount: igstAmount,
            total_amount: toFixedNumber(totalAmount),
          }
        : {
            ...taxDetails,
            total_amount: toFixedNumber(totalAmount),
          };

      // Prepare initial data (using original settings but new dates)
      const initialData = {
        alerts: originalInvoiceData.alerts || {
          notification_period: 7,
          notify_users: ["accounts@yukthi.com"],
          send_notification: true,
        },
        due_date: convertToUTC(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
        invoice_date: convertToUTC(formData.invoice_date),
        invoice_id: formData.invoice_id,
        is_paid: false, // Always unpaid for new copy
      };

      // Prepare invoice data (using original structure with new items)
      const invoiceData = {
        basic_details: {
          amount: toFixedNumber(totalAmount),
          currency: "INR",
          is_refundable:
            originalRevision.revision_details?.is_refundable || false,
          description: formData.description,
          client_details: originalRevision.revision_details?.client_details,
          company_details: COMPANY_DATA,
        },
        invoice_details: {
          description: formData.description,
          gst_number:
            originalRevision.revision_details?.client_details?.gst_number || "",
          invoice_date: convertToUTC(formData.invoice_date),
          invoice_id: formData.invoice_id,
          items: formData.items.map((item) => ({
            ...item,
            amount: parseFloat(item.amount) || 0,
            rate: item.rate || "",
          })),
          tax_details: finalTaxDetails,
          template_type:
            originalRevision.invoice_details?.template_type || "standard-v1",
          roundOffEnabled: roundOffEnabled,
          total_amount: subtotal,
          // Include template-specific fields if they exist
          ...(originalRevision.invoice_details?.domain && {
            domain: originalRevision.invoice_details.domain,
          }),
          ...(originalRevision.invoice_details?.period && {
            period: originalRevision.invoice_details.period,
          }),
        },
        invoice_id: formData.invoice_id,
        revision_date: convertToUTC(formData.invoice_date),
        revision_number: 1,
      };

      const formDataObj = new FormData();
      const payload = {
        initial_data: initialData,
        invoice_data: invoiceData,
      };

      formDataObj.append(
        "invoice",
        pdfBlob,
        `invoice-${formData.invoice_id}.pdf`,
      );

      createInitialInvoice(
        { organization_id: organization_id, payload },
        {
          onSuccess: (response) => {
            uploadInvoice(
              {
                organization_id,
                revision_id: response?.revision_id,
                formData: formDataObj,
              },
              {
                onSettled: () => {
                  toast(
                    "success",
                    "Invoice created and uploaded successfully!",
                  );

                  navigate(`/crm/invoice`);
                },
              },
            );
          },
          onError: (error) => {
            toast("error", error?.message || "Failed to create invoice copy");
          },
        },
      );
    } catch (error) {
      console.error("Error creating invoice copy:", error);
      toast("error", "Failed to generate invoice PDF");
    }
  };

  // Handle adding new item
  const addItem = () => {
    append({ description: "", rate: "", amount: 0 });
  };

  // Handle removing item
  const removeItem = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (!originalInvoice) {
      toast("error", "Original invoice data not loaded");
      return;
    }
    setShowPreview(true);
  };

  if (isLoading) {
    return <DataLoading />;
  }

  if (isError || !invoiceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load invoice data</p>
          <Button onClick={() => navigate("/crm/invoice")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumbs */}

        <div className="flex items-center gap-3">
          <BackButton />
          <Breadcrumbs
            items={[
              { name: "CRM" },
              { name: "Invoices", link: "/crm/invoice" },
              { name: "Copy Invoice" },
            ]}
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-accent/30 to-transparent border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Copy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-left">
                  Copy Invoice
                </h1>
                <p className="text-sm text-muted-foreground">
                  Create a new invoice based on invoice #
                  {originalInvoice?.invoice?.invoice_id}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="divide-y divide-border"
          >
            {/* Basic Details Section */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Basic Details
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Invoice ID"
                  name="invoice_id"
                  register={register}
                  errors={errors}
                  disabled
                  isRequired
                  icon={<FileText className="w-4 h-4" />}
                />
                <Input
                  label="Invoice Date"
                  name="invoice_date"
                  type="date"
                  register={register}
                  errors={errors}
                  isRequired
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-1">
                    Client
                  </label>
                  <div className="p-2 bg-muted rounded-md border text-sm text-muted-foreground">
                    {originalInvoice?.latestRevision?.revision_details
                      ?.client_details?.name || "Loading..."}
                  </div>
                </div>
              </div>

              <TextArea
                label="Description"
                name="description"
                register={register}
                errors={errors}
                placeholder="Brief description of the invoice"
                isRequired
              />
            </div>

            {/* Items Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Invoice Items
                  </h2>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  className="flex items-center gap-2"
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {/* Items Header */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-3 text-center">Amount (₹)</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Items List */}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-2 bg-accent/20 rounded-lg border border-accent/30"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-6">
                        <Input
                          name={`items.${index}.description`}
                          register={register}
                          errors={errors}
                          placeholder="Enter service or product description"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          name={`items.${index}.rate`}
                          placeholder="Enter Rate"
                          type="text"
                          register={register}
                          errors={errors}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          name={`items.${index}.amount`}
                          type="number"
                          register={register}
                          errors={errors}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="w-10 h-10 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-6 bg-muted/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-card rounded-lg shadow-sm border">
                      <Calculator className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Invoice Summary
                    </h2>
                  </div>
                  <div className="py-2  flex border-border">
                    <div
                      onClick={() =>
                        setShowAdvancedOptions(!showAdvancedOptions)
                      }
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span>More Tax Options</span>
                      {showAdvancedOptions ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="text-base font-medium text-foreground">
                        ₹{subtotal?.toFixed(2)}
                      </span>
                    </div>

                    {!showAdvancedOptions ? (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">
                          Tax ({taxDetails?.tax_rate || 18}%)
                        </span>
                        <span className="text-base font-medium text-foreground">
                          ₹{taxAmount?.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {taxType === "sgst_cgst" ? (
                          <>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-sm text-muted-foreground">
                                SGST ({sgstRate?.toFixed(1)}%)
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                ₹{sgstAmount?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-sm text-muted-foreground">
                                CGST ({cgstRate?.toFixed(1)}%)
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                ₹{cgstAmount?.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">
                              IGST ({igstRate?.toFixed(1)}%)
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              ₹{igstAmount?.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-sm text-muted-foreground">
                            Total Tax
                          </span>
                          <span className="text-base font-medium text-foreground">
                            ₹{taxAmount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Advanced Options Toggle */}

                    {/* Advanced Options Section */}
                    {showAdvancedOptions && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <h4 className="text-sm font-medium text-foreground">
                          Tax Configuration
                        </h4>

                        {/* Tax Type Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex justify-items-start flex-col">
                            <span className="text-sm text-muted-foreground text-left">
                              Tax Type
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Choose between IGST (inter-state) or SGST + CGST
                              (intra-state)
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTaxTypeChange("sgst_cgst")}
                              className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-all text-xs ${
                                taxType === "sgst_cgst"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground border-border hover:bg-accent"
                              }`}
                            >
                              {taxType === "sgst_cgst" ? (
                                <ToggleRight className="w-3 h-3" />
                              ) : (
                                <ToggleLeft className="w-3 h-3" />
                              )}
                              SGST + CGST
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTaxTypeChange("igst")}
                              className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-all text-xs ${
                                taxType === "igst"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground border-border hover:bg-accent"
                              }`}
                            >
                              {taxType === "igst" ? (
                                <ToggleRight className="w-3 h-3" />
                              ) : (
                                <ToggleLeft className="w-3 h-3" />
                              )}
                              IGST
                            </button>
                          </div>
                        </div>

                        {/* Tax Rate Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {taxType === "sgst_cgst" ? (
                            <>
                              <Input
                                label="SGST Rate (%)"
                                name="sgst_rate"
                                type="number"
                                register={register}
                                errors={errors}
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="9"
                              />
                              <Input
                                label="CGST Rate (%)"
                                name="cgst_rate"
                                type="number"
                                register={register}
                                errors={errors}
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="9"
                              />
                            </>
                          ) : (
                            <Input
                              label="IGST Rate (%)"
                              name="igst_rate"
                              type="number"
                              register={register}
                              errors={errors}
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="18"
                            />
                          )}

                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-1">
                              Total Tax Rate (%)
                            </label>
                            <div className="mt-1 w-full rounded-md border border-border bg-muted text-muted-foreground p-2 text-sm">
                              {taxType === "igst"
                                ? igstRate?.toFixed(1)
                                : (sgstRate + cgstRate)?.toFixed(1)}
                              %
                            </div>
                          </div>

                          {/* Override Total Amount Input */}
                          <ControlledInput
                            label="Override Total Amount (₹)"
                            type="number"
                            value={manualTotalAmount || ""}
                            onChange={handleManualTotalChange}
                            error={errors.manual_total_amount?.message}
                            min="0"
                            step="0.01"
                            placeholder={`Auto: ₹${calculatedTotal?.toFixed(2)}`}
                          />
                        </div>

                        {/* Round-off Switch */}
                        <div className="flex items-center justify-between py-2 border-t border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Round Off
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={roundOffEnabled}
                                onChange={(e) =>
                                  handleRoundOffToggle(e.target.checked)
                                }
                              />
                              <div className="relative w-8 h-4 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>

                          <span className="text-sm font-medium text-foreground">
                            {roundOffEnabled
                              ? `₹${Math.abs(calculatedTotal - Math.round(calculatedTotal)).toFixed(2)}`
                              : "₹0.00"}
                          </span>
                        </div>

                        {/* Calculated vs Manual Total */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">
                              Calculated Total
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              ₹{calculatedTotal?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">
                          {manualTotalAmount
                            ? "Override Total"
                            : "Total Amount"}
                        </span>
                        <span className="text-2xl font-bold text-foreground">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {manualTotalAmount && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {roundOffEnabled
                            ? "Rounded off applied"
                            : "Manual override applied"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 bg-gradient-to-r from-muted/30 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/crm/invoice")}
                  icon={ArrowLeft}
                >
                  Back to Invoices
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    icon={Eye}
                    size="md"
                  >
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    loading={isPending}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
                  >
                    {isPending ? "Creating Copy..." : "Create Invoice Copy"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && originalInvoice && (
        <InvoicePreviewModal
          invoiceData={{
            ...originalInvoice.latestRevision.revision_details,
            ...getValues(),
            subtotal,
            taxAmount,
            totalAmount,
            taxType: showAdvancedOptions
              ? taxType
              : taxDetails?.tax_type || "sgst_cgst",
            sgstAmount: showAdvancedOptions
              ? sgstAmount
              : taxDetails?.sgst_amount || 0,
            cgstAmount: showAdvancedOptions
              ? cgstAmount
              : taxDetails?.cgst_amount || 0,
            igstAmount: showAdvancedOptions
              ? igstAmount
              : taxDetails?.igst_amount || 0,
            template_type:
              originalInvoice.latestRevision.invoice_details?.template_type ||
              "standard-v1",
            ...(roundOffEnabled && {
              roundOffAmount: Math.abs(
                calculatedTotal - Math.round(calculatedTotal),
              ),
              roundOffEnabled: true,
            }),
          }}
          clientData={
            originalInvoice.latestRevision.revision_details?.client_details
          }
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          subtotal={subtotal}
          taxAmount={taxAmount}
          totalAmount={totalAmount}
          taxType={
            showAdvancedOptions ? taxType : taxDetails?.tax_type || "sgst_cgst"
          }
          sgstAmount={
            showAdvancedOptions ? sgstAmount : taxDetails?.sgst_amount || 0
          }
          cgstAmount={
            showAdvancedOptions ? cgstAmount : taxDetails?.cgst_amount || 0
          }
          igstAmount={
            showAdvancedOptions ? igstAmount : taxDetails?.igst_amount || 0
          }
        />
      )}
    </div>
  );
}

export default CreateCopy;
