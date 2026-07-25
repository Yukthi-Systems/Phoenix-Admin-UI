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

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  FileText,
  DollarSign,
  Calculator,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import * as yup from "yup";

import { userInfoAtom } from "@/store/userInfo";
import { userProfileAtom } from "@/store/userProfile";
import { Input, TextArea, ControlledInput } from "@/components/common/Inputs";
import { BackButton, SubmitButton, Button } from "@/components/common/Buttons";
import { useToastify } from "@/hooks/useToastify";
import {
  useFetchInvoiceWithRevisions,
  useCreateInvoiceRevision,
  useUploadInvoice,
} from "@/hooks/useInvoice";
import InvoicePreviewModal from "../create/InvoicePreviewModal";
import InvoicePDFDocument from "../create/InvoicePDF";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { COMPANY_DATA, BANK_DETAILS } from "../create/invoiceData";
import { toDateTimeLocalStringDefault } from "@/utils/dateFormat";
import { useLocation, useNavigate } from "react-router-dom";
import DataFechError from "@/components/common/DataFechError";
import AccessDenied from "@/components/common/AccessDenied";
import DataLoading from "@/components/common/DataLoading";
import { useQueryClient } from "@tanstack/react-query";

const revisionSchema = yup.object({
  description: yup
    .string()
    .required("Description is required")
    .min(3, "Description must be at least 3 characters"),

  // Template type field
  template_type: yup
    .string()
    .oneOf(["standard-v1", "standard-v2"], "Invalid template type")
    .default("standard-v1"),

  domain: yup.string().when("template_type", {
    is: "standard-v2",
    then: (schema) =>
      schema
        .required("Domain is required for Template V2")
        .min(3, "Domain must be at least 3 characters")
        .max(100, "Domain must not exceed 100 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),

  period: yup.string().when("template_type", {
    is: "standard-v2",
    then: (schema) =>
      schema
        .required("Period is required for Template V2")
        .min(2, "Period must be at least 2 characters")
        .max(50, "Period must not exceed 50 characters"),
    otherwise: (schema) => schema.notRequired(),
  }),

  items: yup
    .array()
    .of(
      yup.object({
        description: yup
          .string()
          .required("Item description is required")
          .min(3, "Description must be at least 3 characters"),
        rate: yup.string().optional(),
        amount: yup.number().required("Amount is required"),
      }),
    )
    .min(1, "At least one item is required"),
  sgst_rate: yup
    .number()
    .min(0, "SGST rate cannot be negative")
    .max(100, "SGST rate cannot exceed 100%")
    .default(9),
  cgst_rate: yup
    .number()
    .min(0, "CGST rate cannot be negative")
    .max(100, "CGST rate cannot exceed 100%")
    .default(9),
  igst_rate: yup
    .number()
    .min(0, "IGST rate cannot be negative")
    .max(100, "IGST rate cannot exceed 100%")
    .default(18),
  manual_total_amount: yup.string().optional().nullable(),
});

function CreateRevision() {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  const [showPreview, setShowPreview] = useState(false);
  const [taxType, setTaxType] = useState("sgst_cgst");
  const [templateType, setTemplateType] = useState("standard-v1");
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const invoiceId = searchParams.get("invoice_id");
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const {
    data: invoiceData,
    isLoading,
    isError,
  } = useFetchInvoiceWithRevisions(userInfo.organization_id, invoiceId);
  const { mutate: createRevision, isPending } = useCreateInvoiceRevision();
  const { mutate: uploadInvoice } = useUploadInvoice();

  const getDefaultValues = () => ({
    description: "",
    template_type: "standard-v1",
    domain: "",
    period: "",
    items: [
      {
        description: "",
        rate: "",
        amount: 0,
      },
    ],
    sgst_rate: 9,
    cgst_rate: 9,
    igst_rate: 18,
    manual_total_amount: null,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm({
    defaultValues: getDefaultValues(),
    resolver: yupResolver(revisionSchema),
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
  const watchedTemplateType = watch("template_type");

  useEffect(() => {
    if (watchedTemplateType !== templateType) {
      setTemplateType(watchedTemplateType);
    }
  }, [watchedTemplateType]);

  // FIXED: Clear overrides when items change
  useEffect(() => {
    if (!isInitialLoadComplete) {
      return;
    }
    // Create a dependency array of all item values to detect any changes
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
  }, [watchedItems, setValue, taxType, sgstRate, cgstRate, igstRate]);

  useEffect(() => {
    if (invoiceData?.data && !isDataLoaded) {
      const invoice = invoiceData.data.invoice;
      const revisions = invoiceData.data.revisions || [];
      const latestRevision = revisions[0];

      if (invoice && latestRevision) {
        setOriginalInvoice(invoice);
        const clientDetails = latestRevision.revision_details?.client_details;
        const companyDetails = latestRevision.revision_details?.company_details;

        const dbRoundOffEnabled =
          latestRevision?.invoice_details?.roundOffEnabled || false;
        const dbManualTotal = latestRevision?.revision_details?.amount || null;

        setRoundOffEnabled(dbRoundOffEnabled);

        setClientData(clientDetails);
        setCompanyData(companyDetails || COMPANY_DATA);

        const taxDetails = latestRevision.invoice_details?.tax_details;
        const items = latestRevision.invoice_details?.items || [];
        const revisionTaxType = taxDetails?.tax_type || "sgst_cgst";
        setTaxType(revisionTaxType);
        const revisionTemplateType =
          latestRevision.invoice_details?.template_type || "standard-v1";
        setTemplateType(revisionTemplateType);
        const formData = {
          description:
            latestRevision.revision_details?.description ||
            latestRevision.invoice_details?.description ||
            "",
          template_type: revisionTemplateType,
          domain: latestRevision.invoice_details?.domain || "",
          period: latestRevision.invoice_details?.period || "",
          items:
            items.length > 0
              ? items.map((item) => ({
                  description: item.description || "",
                  rate: item.rate || "",
                  amount: item.amount || 0,
                }))
              : [
                  {
                    description: "",
                    rate: "",
                    amount: 0,
                  },
                ],
          sgst_rate: taxDetails?.sgst_rate || 9,
          cgst_rate: taxDetails?.cgst_rate || 9,
          igst_rate: taxDetails?.igst_rate || 18,
          manual_total_amount: dbManualTotal,
        };

        reset(formData);
        setIsDataLoaded(true);
        setTimeout(() => {
          setIsInitialLoadComplete(true);
        }, 100);
      }
    }
  }, [invoiceData, reset, isDataLoaded]);

  // Calculate totals based on tax type
  const calculateTotals = () => {
    const subtotal =
      watchedItems?.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0) || 0;

    let taxAmount = 0;
    let sgstAmount = 0;
    let cgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "igst") {
      igstAmount = (subtotal * (igstRate || 0)) / 100;
      taxAmount = igstAmount;
    } else {
      sgstAmount = (subtotal * (sgstRate || 0)) / 100;
      cgstAmount = (subtotal * (cgstRate || 0)) / 100;
      taxAmount = sgstAmount + cgstAmount;
    }

    const calculatedTotal = subtotal + taxAmount;
    const totalAmount = manualTotalAmount
      ? parseFloat(manualTotalAmount)
      : calculatedTotal;

    return {
      subtotal,
      sgstAmount,
      cgstAmount,
      igstAmount,
      taxAmount,
      totalAmount,
      calculatedTotal,
    };
  };

  const {
    subtotal,
    sgstAmount,
    cgstAmount,
    igstAmount,
    taxAmount,
    totalAmount,
    calculatedTotal,
  } = calculateTotals();

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

  // FIXED: Manual total change handler
  const handleManualTotalChange = (e) => {
    const value = e.target.value;

    // Update form value
    setValue("manual_total_amount", value);

    // Disable round-off if there's a manual value
    if (value && roundOffEnabled) {
      setRoundOffEnabled(false);
    }
  };

  const handleTemplateTypeChange = (newTemplateType) => {
    setTemplateType(newTemplateType);
    setValue("template_type", newTemplateType);
    if (newTemplateType === "standard-v1") {
      setValue("domain", "");
      setValue("period", "");
    }
  };

  const generateInvoiceDetails = (data) => {
    return {
      ...originalInvoice,
      bill_number: originalInvoice?.invoice_id,
      date: new Date().toLocaleDateString("en-IN"),
      po_date: new Date().toLocaleDateString("en-IN"),
      state_code: "29",
      gstin_code: companyData?.gst_number || COMPANY_DATA.gst_number,
      description: data.description,
      template_type: data.template_type,
      domain: data.domain,
      period: data.period,
      items:
        data.items?.map((item) => ({
          ...item,
          rate: parseFloat(item.rate) || "",
          price: parseFloat(item.amount) || 0,
        })) || [],
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      tax_type: taxType,
      sgst_amount: sgstAmount,
      cgst_amount: cgstAmount,
      sgst_rate: taxType === "sgst_cgst" ? sgstRate || 9 : 0,
      cgst_rate: taxType === "sgst_cgst" ? cgstRate || 9 : 0,
      igst_amount: igstAmount,
      igst_rate: taxType === "igst" ? igstRate || 18 : 0,
      ...(roundOffEnabled && {
        roundOffAmount: Math.abs(calculatedTotal - Math.round(calculatedTotal)),
        roundOffEnabled: true,
      }),
    };
  };

  const generatePDFBlob = async (data) => {
    try {
      const invoiceDetails = generateInvoiceDetails(data);

      const pdfDocument = (
        <InvoicePDFDocument
          companyData={companyData || COMPANY_DATA}
          clientData={clientData}
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

  const handleTaxTypeChange = (newTaxType) => {
    setTaxType(newTaxType);

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

  // FIXED: Add item with override reset
  const addItem = () => {
    append({
      description: "",
      rate: "",
      amount: 0,
    });

    // Reset overrides when adding new item
    setValue("manual_total_amount", "");
    if (roundOffEnabled) {
      setRoundOffEnabled(false);
    }
  };

  // FIXED: Remove item with override reset
  const removeItem = (index) => {
    if (fields.length > 1) {
      remove(index);

      // Reset overrides when removing item
      setValue("manual_total_amount", "");
      if (roundOffEnabled) {
        setRoundOffEnabled(false);
      }
    }
  };

  const onSubmit = async (data) => {
    if (!userInfo.organization_id || !originalInvoice) {
      toast("error", "Organization or invoice data not found");
      return;
    }

    try {
      const pdfBlob = await generatePDFBlob(data);
      const currentRevisions = invoiceData?.data?.revisions || [];
      const nextRevisionNumber = currentRevisions.length + 1;

      const payload = {
        basic_details: {
          amount: totalAmount,
          currency: "INR",
          description: data.description,
          is_refundable: clientData?.is_refundable || false,
          client_details: clientData,
          company_details: companyData || COMPANY_DATA,
        },
        invoice_details: {
          description: data.description,
          gst_number: clientData?.gst_number || "",
          invoice_date: originalInvoice.invoice_date,
          invoice_id: originalInvoice.invoice_id,
          items: data.items.map((item) => ({
            ...item,
            amount: parseFloat(item.amount) || 0,
            rate: item.rate || "",
          })),
          tax_details: {
            tax_type: taxType,
            tax_amount: taxAmount,
            tax_rate: taxType === "igst" ? igstRate : sgstRate + cgstRate,
            sgst_rate: taxType === "sgst_cgst" ? parseFloat(sgstRate) || 9 : 0,
            cgst_rate: taxType === "sgst_cgst" ? parseFloat(cgstRate) || 9 : 0,
            igst_rate: taxType === "igst" ? parseFloat(igstRate) || 18 : 0,
            sgst_amount: sgstAmount,
            cgst_amount: cgstAmount,
            igst_amount: igstAmount,
            total_amount: totalAmount,
          },
          roundOffEnabled: roundOffEnabled,
          template_type: data.template_type || "standard-v1",
          total_amount: subtotal,
          ...(data.template_type === "standard-v2" && {
            domain: data.domain,
            period: data.period,
          }),
        },
        invoice_id: originalInvoice.invoice_id,
        revision_date: toDateTimeLocalStringDefault(new Date()),
        revision_number: nextRevisionNumber,
      };

      const formData = new FormData();
      formData.append(
        "invoice",
        pdfBlob,
        `invoice-revision-${originalInvoice.invoice_id}-v${nextRevisionNumber}.pdf`,
      );

      createRevision(
        { organization_id: userInfo.organization_id, payload },
        {
          onSuccess: (response) => {
            uploadInvoice(
              {
                organization_id: userInfo.organization_id,
                revision_id: response?.revision_id,
                formData,
              },
              {
                onSuccess: () => {
                  toast("success", "Invoice revision created successfully!");
                  queryClient.invalidateQueries({
                    queryKey: [
                      "invoice_with_revisions",
                      userInfo.organization_id,
                      originalInvoice.invoice_id,
                    ],
                  });
                  navigate(
                    `/crm/invoice/view?invoice_id=${originalInvoice.invoice_id}`,
                  );
                },
                onError: (error) => {
                  toast("error", "Failed to upload revision PDF");
                },
              },
            );
          },
          onError: (error) => {
            toast(
              "error",
              error?.message || "Failed to create invoice revision",
            );
          },
        },
      );
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast("error", "Failed to generate revision PDF");
    }
  };

  const handlePreview = () => {
    if (!userInfo.organization_id) {
      toast("error", "Organization not found");
      return;
    }
    setShowPreview(true);
  };

  if (!permissions?.includes("crm:invoice:create")) {
    return <AccessDenied />;
  }

  if (isError) {
    return <DataFechError />;
  }

  if (isLoading || !isDataLoaded) {
    return <DataLoading content="Loading invoice data..." />;
  }

  const invoice = invoiceData?.data?.invoice;
  const revisions = invoiceData?.data?.revisions || [];
  const nextRevisionNumber = revisions.length + 1;

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
              {
                name: "View Invoice",
                link: `/crm/invoice/view?invoice_id=${invoice?.invoice_id}`,
              },
              { name: `Create Revision #${nextRevisionNumber}` },
            ]}
          />
        </div>

        {/* Main Form */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="divide-border divide-y"
          >
            {/* Header Section */}
            <div className="from-accent/30 bg-gradient-to-r to-transparent p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-foreground text-xl font-semibold">
                    Create Revision #{nextRevisionNumber}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Invoice ID: {invoice?.invoice_id} • Current Revisions:{" "}
                    {revisions.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Template Selection Section */}
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-foreground text-left text-xl font-semibold">
                    Invoice Template
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Choose the template version for your revision
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Template Type Selection */}
                <div className="bg-card rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground mb-1 text-left text-sm font-medium">
                        Template Version
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Select between standard templates
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleTemplateTypeChange("standard-v1")}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                          templateType === "standard-v1"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {templateType === "standard-v1" ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        Standard V1
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTemplateTypeChange("standard-v2")}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                          templateType === "standard-v2"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {templateType === "standard-v2" ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        Standard V2
                      </button>
                    </div>
                  </div>

                  {/* Template V2 Additional Fields */}
                  {templateType === "standard-v2" && (
                    <div className="mt-4 border-t pt-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input
                          label="Domain"
                          name="domain"
                          register={register}
                          errors={errors}
                          placeholder="Enter domain (e.g., example.com)"
                          isRequired={templateType === "standard-v2"}
                        />
                        <Input
                          label="Period"
                          name="period"
                          register={register}
                          errors={errors}
                          placeholder="Enter period"
                          isRequired={templateType === "standard-v2"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="p-6">
              <TextArea
                label="Description"
                name="description"
                register={register}
                errors={errors}
                placeholder="Brief description of the invoice"
                isRequired
              />
            </div>

            {/* Invoice Items Section */}
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <DollarSign className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-left text-xl font-semibold">
                      Invoice Items
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Update services or products for this revision
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  className="bg-primary/5 hover:bg-primary/10 border-primary/20 flex items-center gap-2"
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {/* Items Header */}
                <div className="bg-muted/50 text-muted-foreground hidden gap-3 rounded-lg px-4 py-2 text-sm font-medium sm:grid sm:grid-cols-12">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-3 text-center">Amount (₹)</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {/* Items List */}
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-accent/20 border-accent/30 rounded-lg border p-2"
                  >
                    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-12">
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
                          type="text"
                          register={register}
                          errors={errors}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex justify-end sm:col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Calculation Section */}
            <div className="bg-muted/20 border-t p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-card rounded-lg border p-2 shadow-sm">
                  <Calculator className="text-muted-foreground h-5 w-5" />
                </div>
                <h2 className="text-foreground text-xl font-semibold">
                  Tax Calculation
                </h2>
              </div>

              <div className="space-y-6">
                {/* Tax Type Toggle */}
                <div className="bg-card rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground mb-1 text-left text-sm font-medium">
                        Tax Type
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Choose between IGST (inter-state) or SGST + CGST
                        (intra-state)
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleTaxTypeChange("sgst_cgst")}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                          taxType === "sgst_cgst"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {taxType === "sgst_cgst" ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        SGST + CGST
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTaxTypeChange("igst")}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
                          taxType === "igst"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {taxType === "igst" ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        IGST
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tax Rate Inputs */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                    <label className="text-card-foreground mb-1 block text-sm font-medium">
                      Total Tax Rate (%)
                    </label>
                    <div className="border-border bg-muted text-muted-foreground mt-1 w-full rounded-md border p-2.5 text-sm">
                      {taxType === "igst"
                        ? igstRate?.toFixed(1)
                        : (sgstRate + cgstRate)?.toFixed(1)}
                      %
                    </div>
                  </div>

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

                {/* Calculation Summary */}
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-4">
                    <h3 className="text-muted-foreground mb-4 text-sm font-medium tracking-wide uppercase">
                      Amount Breakdown
                    </h3>

                    <div className="space-y-4">
                      {/* Subtotal Row */}
                      <div className="border-border flex items-center justify-between border-b py-2">
                        <span className="text-muted-foreground text-sm">
                          Subtotal
                        </span>
                        <span className="text-foreground text-base font-medium">
                          ₹{subtotal?.toFixed(2)}
                        </span>
                      </div>

                      {/* Tax Breakdown */}
                      <div className="space-y-2">
                        {taxType === "sgst_cgst" ? (
                          <>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground text-sm">
                                SGST ({sgstRate?.toFixed(1)}%)
                              </span>
                              <span className="text-foreground text-sm font-medium">
                                ₹{sgstAmount?.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground text-sm">
                                CGST ({cgstRate?.toFixed(1)}%)
                              </span>
                              <span className="text-foreground text-sm font-medium">
                                ₹{cgstAmount?.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground text-sm">
                              IGST ({igstRate?.toFixed(1)}%)
                            </span>
                            <span className="text-foreground text-sm font-medium">
                              ₹{igstAmount?.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="border-border flex items-center justify-between border-b py-2">
                          <span className="text-muted-foreground text-sm">
                            Total Tax
                          </span>
                          <span className="text-foreground text-base font-medium">
                            ₹{taxAmount?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Calculated vs Manual Total */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground text-sm">
                            Calculated Total
                          </span>
                          <span className="text-muted-foreground text-sm font-medium">
                            ₹{calculatedTotal?.toFixed(2)}
                          </span>
                        </div>

                        {/* Round-off Switch */}
                        <div className="border-border flex items-center justify-between border-t py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">
                              Round Off
                            </span>
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={roundOffEnabled}
                                onChange={(e) =>
                                  handleRoundOffToggle(e.target.checked)
                                }
                              />
                              <div className="bg-muted peer-focus:ring-primary/20 peer peer-checked:bg-primary relative h-4 w-8 rounded-full peer-focus:ring-2 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-4 peer-checked:after:border-white"></div>
                            </label>
                          </div>
                          <span className="text-foreground text-sm font-medium">
                            {roundOffEnabled
                              ? `₹${Math.abs(calculatedTotal - Math.round(calculatedTotal)).toFixed(2)}`
                              : "₹0.00"}
                          </span>
                        </div>

                        {/* Final Total */}
                        <div className="bg-muted/30 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground text-lg font-semibold">
                              {manualTotalAmount
                                ? "Override Total"
                                : "Total Amount"}
                            </span>
                            <span className="text-foreground text-2xl font-bold">
                              ₹{totalAmount?.toFixed(2)}
                            </span>
                          </div>
                          {manualTotalAmount && (
                            <div className="text-muted-foreground mt-1 text-xs">
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
              </div>
            </div>

            {/* Form Actions */}
            <div className="from-muted/30 bg-gradient-to-r to-transparent p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <BackButton className="order-2 sm:order-1" />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    icon={Eye}
                    size="lg"
                    disabled={!userInfo.organization_id}
                  >
                    Preview Revision
                  </Button>
                  <SubmitButton
                    loading={isPending}
                    disabled={!userInfo.organization_id}
                    className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 order-1 bg-gradient-to-r text-white shadow-lg sm:order-2"
                  >
                    {isPending
                      ? "Creating Revision..."
                      : `Create Revision #${nextRevisionNumber}`}
                  </SubmitButton>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <InvoicePreviewModal
            invoiceData={{
              ...originalInvoice,
              ...getValues(),
              subtotal,
              taxAmount,
              totalAmount,
              taxType,
              sgstAmount,
              cgstAmount,
              igstAmount,
              template_type: templateType,
              ...(roundOffEnabled && {
                roundOffAmount: Math.abs(
                  calculatedTotal - Math.round(calculatedTotal),
                ),
                roundOffEnabled: true,
              }),
            }}
            clientData={clientData}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            subtotal={subtotal}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            taxType={taxType}
            sgstAmount={sgstAmount}
            cgstAmount={cgstAmount}
            igstAmount={igstAmount}
          />
        )}
      </div>
    </div>
  );
}

export default CreateRevision;
