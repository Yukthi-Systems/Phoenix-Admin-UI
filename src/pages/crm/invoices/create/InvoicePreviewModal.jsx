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

import { X, Download } from "lucide-react";
import { Button } from "@/components/common/Buttons";
import InvoicePDFDocument from "./InvoicePDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { COMPANY_DATA, CLIENT_DATA, BANK_DETAILS } from "./invoiceData";

function InvoicePreviewModal({
  invoiceData,
  clientData,
  isOpen,
  onClose,
  subtotal,
  taxAmount,
  totalAmount,
  taxType = "sgst_cgst",
  sgstAmount = 0,
  cgstAmount = 0,
  igstAmount = 0,
}) {
  if (!isOpen) return null;

  const invoiceDetails = {
    ...invoiceData,
    bill_number: invoiceData.invoice_id,
    date: invoiceData.invoice_date,
    po_date: invoiceData.invoice_date,
    state_code: "29",
    gstin_code: COMPANY_DATA.gst_number,
    items:
      invoiceData.items?.map((item) => ({
        ...item,
        rate: parseFloat(item.rate) || "",
        price: parseFloat(item.amount) || 0,
      })) || [],
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    tax_type: taxType,

    // SGST + CGST details
    sgst_amount: sgstAmount,
    cgst_amount: cgstAmount,
    sgst_rate:
      taxType === "sgst_cgst" ? invoiceData.tax_details?.sgst_rate || 9 : 0,
    cgst_rate:
      taxType === "sgst_cgst" ? invoiceData.tax_details?.cgst_rate || 9 : 0,

    // IGST details
    igst_amount: igstAmount,
    igst_rate:
      taxType === "igst" ? invoiceData.tax_details?.igst_rate || 18 : 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card flex h-[90vh] w-full max-w-5xl flex-col rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-foreground text-xl font-semibold">
              Invoice Preview
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Tax Type:{" "}
              {taxType === "igst"
                ? "IGST (Inter-state)"
                : "SGST + CGST (Intra-state)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PDFDownloadLink
              document={
                <InvoicePDFDocument
                  companyData={COMPANY_DATA}
                  clientData={clientData}
                  invoiceDetails={invoiceDetails}
                  bankDetails={BANK_DETAILS}
                />
              }
              fileName={`invoice-${invoiceData.invoice_id}.pdf`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4" />
                  {loading ? "Generating..." : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
            <Button variant="outline" onClick={onClose} icon={X}>
              Close
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4">
          <div className="h-full w-full overflow-hidden rounded-lg border">
            <PDFViewer width="100%" height="100%">
              <InvoicePDFDocument
                companyData={COMPANY_DATA}
                clientData={clientData}
                invoiceDetails={invoiceDetails}
                bankDetails={BANK_DETAILS}
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewModal;
