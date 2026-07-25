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

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Calculator,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  FileText,
  Calendar,
} from "lucide-react";
import { Input, ControlledInput } from "@/components/common/Inputs";
import { Button } from "@/components/common/Buttons";
import InvoicePreviewModal from "../InvoicePreviewModal";
import { step2DefaultValues } from "../invoiceDefaultValues";
import { step2Schema } from "../validationSchema";

function InvoiceStep2({
  step1Data,
  onComplete,
  onPrevious,
  isPending,
  initialData,
}) {
  const [taxType, setTaxType] = useState("sgst_cgst");
  const [showPreview, setShowPreview] = useState(false);
  const [templateType, setTemplateType] = useState("standard-v1");
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);

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
    defaultValues: {
      ...(initialData || step2DefaultValues),
      template_type: initialData?.template_type || "standard-v1",
      domain: initialData?.domain || "",
      period: initialData?.period || "",
    },
    resolver: yupResolver(step2Schema),
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

  // Update local template type when form value changes
  useEffect(() => {
    if (watchedTemplateType !== templateType) {
      setTemplateType(watchedTemplateType);
    }
  }, [watchedTemplateType]);

  // Clear overrides when items change
  useEffect(() => {
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
    watchedItems,
    setValue,
    taxType,
    sgstRate,
    cgstRate,
    igstRate,
  ]);

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
      // Set manual total amount to rounded value
      const roundedAmount = Math.round(calculatedTotal);
      setValue("manual_total_amount", roundedAmount);
    } else {
      // Clear manual total amount to use calculated total
      setValue("manual_total_amount", "");
    }
  };

  // Handle template type change
  const handleTemplateTypeChange = (newTemplateType) => {
    setTemplateType(newTemplateType);
    setValue("template_type", newTemplateType);

    // Clear domain and period fields when switching to v1
    if (newTemplateType === "standard-v1") {
      setValue("domain", "");
      setValue("period", "");
    }
  };

  // Fixed manual total change handler
  const handleManualTotalChange = (e) => {
    const value = e.target.value;

    // Update form value
    setValue("manual_total_amount", value);

    // Disable round-off if there's a manual value
    if (value && roundOffEnabled) {
      setRoundOffEnabled(false);
    }
  };

  const removeOverride = () => {
    // Clear the manual total amount field
    setValue("manual_total_amount", "");

    // Disable round-off if it's enabled
    if (roundOffEnabled) {
      setRoundOffEnabled(false);
    }
  };

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

  const handlePreview = () => {
    setShowPreview(true);
  };

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      taxType,
      subtotal,
      sgstAmount,
      cgstAmount,
      igstAmount,
      taxAmount,
      totalAmount,
      calculatedTotal,
      sgstRate,
      cgstRate,
      igstRate,
      template_type: templateType,
      // Only send round-off data if it's actually enabled
      ...(roundOffEnabled && {
        roundOffAmount: Math.abs(calculatedTotal - Math.round(calculatedTotal)),
        roundOffEnabled: true,
      }),
    };

    onComplete(formattedData);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="divide-y divide-border"
      >
        {/* Template Selection Section */}
        <div className="p-6 bg-gradient-to-r from-accent/30 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground text-left">
                Invoice Template
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose the template version for your invoice
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Template Type Selection */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center justify-between ">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1 text-left">
                    Template Version
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select between standard templates
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleTemplateTypeChange("standard-v1")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      templateType === "standard-v1"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {templateType === "standard-v1" ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    Standard V1
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTemplateTypeChange("standard-v2")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      templateType === "standard-v2"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {templateType === "standard-v2" ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    Standard V2
                  </button>
                </div>
              </div>

              {/* Template V2 Additional Fields */}
              {templateType === "standard-v2" && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Invoice Items Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground text-left">
                  Invoice Items
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add services or products to this invoice
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="sm"
              icon={Plus}
              className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
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
                      type="text"
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

        {/* Tax Calculation Section */}
        <div className="p-6 bg-muted/20 border-t">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-card rounded-lg shadow-sm border">
              <Calculator className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Tax Calculation
            </h2>
          </div>

          <div className="space-y-6">
            {/* Tax Type Toggle */}
            <div className="bg-card rounded-lg p-2">
              <div className="flex items-center justify-between ">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1 text-left">
                    Tax Type
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Choose between IGST (inter-state) or SGST + CGST
                    (intra-state)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange("sgst_cgst")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      taxType === "sgst_cgst"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {taxType === "sgst_cgst" ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    SGST + CGST
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange("igst")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      taxType === "igst"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {taxType === "igst" ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    IGST
                  </button>
                </div>
              </div>
            </div>

            {/* Tax Rate Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* FIXED: Override Total Amount Input using ControlledInput */}
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
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                  Amount Breakdown
                </h3>

                <div className="space-y-4">
                  {/* Subtotal Row */}
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="text-base font-medium text-foreground">
                      ₹{subtotal?.toFixed(2)}
                    </span>
                  </div>

                  {/* Tax Breakdown */}
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

                  {/* Calculated vs Manual Total */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">
                        Calculated Total
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        ₹{calculatedTotal?.toFixed(2)}
                      </span>
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
                          <div className="relative w-8 h-4 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary "></div>
                        </label>
                      </div>

                      <span className="text-sm font-medium text-foreground">
                        {roundOffEnabled
                          ? `₹${Math.abs(calculatedTotal - Math.round(calculatedTotal)).toFixed(2)}`
                          : "₹0.00"}
                      </span>
                    </div>

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
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              icon={ArrowLeft}
            >
              Back to Basic Details
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                icon={Eye}
                size="md"
              >
                Preview Invoice
              </Button>
              <Button
                type="submit"
                loading={isPending}
                className=" bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
              >
                {isPending ? "Creating Invoice..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <InvoicePreviewModal
          invoiceData={{
            ...step1Data,
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
          clientData={step1Data?.client_details}
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
    </>
  );
}

export default InvoiceStep2;
