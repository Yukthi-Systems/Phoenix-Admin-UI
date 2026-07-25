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
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { YSLOGO_BASE64, YSSIGN_BASE64 } from "./invoiceData";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#000",
  },

  // Header
  header: {
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "0.5px solid #ccc",
  },
  companySection: {
    flex: 2,
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
  },
  companyText: {
    fontSize: 7,
    lineHeight: 1.1,
    marginBottom: 0.5,
  },
  logo: {
    width: 90,
    height: 40,
    objectFit: "contain",
  },
  brandFallback: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  // Title
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
    color: "#000",
  },

  // Info Section
  infoContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 15,
  },
  clientInfo: {
    flex: 2,
  },
  clientName: {
    fontSize: 7,
    fontWeight: "bold",
    lineHeight: 1.2,
    marginBottom: 1,
  },
  invoiceInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  infoText: {
    fontSize: 7,
    lineHeight: 1.2,
    marginBottom: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#000",
  },
  infoValue: {
    fontSize: 7,
    color: "#000",
  },

  // Clean Table Styles
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderTop: "1.5px solid #000",
    borderBottom: "1.5px solid #000",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 0,
    minHeight: 18,
  },
  lastTableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 0,
    minHeight: 6,
    borderBottom: "1px solid #000",
  },
  tableCell: {
    fontSize: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
    color: "#000",
  },
  headerCell: {
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    justifyContent: "center",
    color: "#000",
  },

  // Summary Container and Template Info
  summaryContainer: {
    flexDirection: "row",
    marginTop: 5,
    gap: 15,
  },
  templateInfoBox: {
    flex: 1,
    padding: 10,
  },
  templateInfoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    textAlign: "center",
  },
  templateInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  templateInfoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
    width: "35%",
  },
  templateInfoValue: {
    fontSize: 8,
    color: "#000",
  },

  // Summary Box Styles
  summaryBox: {
    marginTop: 5,
    marginLeft: "50%",
    border: "1px solid #000",
    padding: 10,
    minWidth: "45%",
  },
  summaryBoxWithTemplate: {
    flex: 1,
    border: "1px solid #000",
    padding: 10,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#000",
  },
  summaryValue: {
    fontSize: 8,
    color: "#000",
    fontWeight: "normal",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #000",
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },

  // Footer - with wrap protection
  footer: {
    marginTop: 15,
    borderTop: "0.5px solid #ccc",
    paddingTop: 10,
    minHeight: 120,
  },
  footerRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 8,
  },
  bankSection: {
    flex: 1,
  },
  signatureSection: {
    flex: 1,
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#000",
  },
  bankText: {
    fontSize: 6,
    marginBottom: 1,
    lineHeight: 1.1,
  },
  bankDivider: {
    borderTop: "0.5px solid #ccc",
    marginVertical: 3,
    width: "40%",
  },
  signatureImage: {
    width: 80, // Increased from 40
    height: 65, // Increased from 30
    marginVertical: 5,
  },
  signatureLine: {
    width: 100,
    borderTop: "0.5px solid #000",
    marginVertical: 8,
  },
  signatureText: {
    fontSize: 6,
    textAlign: "center",
  },

  // Terms
  terms: {
    marginTop: 6,
  },
  termText: {
    fontSize: 6,
    lineHeight: 1.2,
    marginBottom: 1,
  },
  disclaimer: {
    fontSize: 6,
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
    color: "#666",
  },

  // Utility
  bold: { fontWeight: "bold" },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
  left: { textAlign: "left" },

  // Page break helper
  pageBreak: {
    pageBreakBefore: "always",
  },
});

function InvoicePDFDocument({
  companyData,
  clientData,
  invoiceDetails,
  bankDetails,
}) {
  const formatCurrency = (amount) => {
    if (!amount) return "";
    const num = Number(amount || 0);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const RUPEE_SYMBOL = "Rs.";

  // Calculate if we need to split content across pages
  const itemCount = invoiceDetails.items?.length || 0;
  const needsPageBreak = itemCount > 8;

  // Determine tax type - check if it's IGST or SGST+CGST
  const taxType =
    invoiceDetails.tax_type ||
    (invoiceDetails.igst_amount > 0 ? "igst" : "sgst_cgst");

  // Check if domain or period are present
  const hasTemplateFields = invoiceDetails.domain || invoiceDetails.period;

  // Check if template is v2
  const isTemplateV2 = invoiceDetails.template_type === "standard-v2";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>{companyData.name}</Text>
            <Text style={styles.companyText}>
              144, 6th Main, Avalahalli BDA Layout, Girinagar
            </Text>
            <Text style={styles.companyText}>Bangalore - 560 085</Text>
            <Text style={styles.companyText}>
              {companyData.phone} | {companyData.mobile}
            </Text>
            <Text style={styles.companyText}>
              {companyData.website} | {companyData.email}
            </Text>
            <Text style={styles.companyText}>
              GST: {companyData.gst_number} | PAN: {companyData.pan_number} |
              SAC: {companyData.sac_code}
            </Text>
          </View>

          <View style={styles.logoSection}>
            {companyData.logo ? (
              <Image src={YSLOGO_BASE64} style={styles.logo} />
            ) : (
              <Text style={styles.brandFallback}>YUKTHI MAIL</Text>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>TAX INVOICE</Text>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.clientName}>{clientData.name}</Text>
            {clientData.contact_details && (
              <Text style={styles.infoText}>
                {clientData.contact_details.name} |{" "}
                {clientData.contact_details.phone} |{" "}
                {clientData.contact_details.email}
              </Text>
            )}
            <Text style={styles.infoText}>{clientData.address}</Text>
            <Text style={styles.infoText}>
              GSTIN: {clientData.gst_number} | State Code:{" "}
              {clientData.state_code}
            </Text>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.sectionTitle}>Invoice Details:</Text>
            <View style={styles.detailRow}>
              <Text style={styles.infoLabel}>Invoice No:</Text>
              <Text style={styles.infoValue}>{invoiceDetails.bill_number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(invoiceDetails.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.infoLabel}>State Code:</Text>
              <Text style={styles.infoValue}>{invoiceDetails.state_code}</Text>
            </View>
          </View>
        </View>

        {/* Clean Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[styles.headerCell, { width: "8%", textAlign: "center" }]}
            >
              S.No
            </Text>
            <Text
              style={[styles.headerCell, { width: "52%", textAlign: "left" }]}
            >
              Solutions / Details
            </Text>
            <Text
              style={[styles.headerCell, { width: "15%", textAlign: "center" }]}
            >
              Rate ({RUPEE_SYMBOL})
            </Text>
            <Text
              style={[styles.headerCell, { width: "25%", textAlign: "right" }]}
            >
              Amount ({RUPEE_SYMBOL})
            </Text>
          </View>

          {/* Items */}
          {invoiceDetails.items?.map((item, index) => {
            const isLastItem =
              index === (invoiceDetails.items?.length || 0) - 1;
            const totalRows =
              (invoiceDetails.items?.length || 0) +
              Math.max(
                0,
                2 - Math.max(0, (invoiceDetails.items?.length || 0) - 4),
              );

            return (
              <View key={index} style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "8%", textAlign: "center" },
                  ]}
                >
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "52%", textAlign: "left" },
                  ]}
                >
                  {item.description}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "15%", textAlign: "center" },
                  ]}
                >
                  {" "}
                  {formatCurrency(item.rate)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: "25%", textAlign: "right" },
                  ]}
                >
                  {formatCurrency(item.price || item.amount)}
                </Text>
              </View>
            );
          })}

          {/* Add minimal empty rows for spacing if needed */}
          {Array.from({
            length: Math.max(
              0,
              2 - Math.max(0, (invoiceDetails.items?.length || 0) - 4),
            ),
          }).map((_, index) => {
            const emptyRowIndex = (invoiceDetails.items?.length || 0) + index;
            const totalEmptyRows = Math.max(
              0,
              2 - Math.max(0, (invoiceDetails.items?.length || 0) - 4),
            );
            const isLastEmptyRow = index === totalEmptyRows - 1;

            return (
              <View
                key={`empty-${index}`}
                style={isLastEmptyRow ? styles.lastTableRow : styles.tableRow}
              >
                <Text style={[styles.tableCell, { width: "8%" }]}></Text>
                <Text style={[styles.tableCell, { width: "52%" }]}></Text>
                <Text style={[styles.tableCell, { width: "15%" }]}></Text>
                <Text style={[styles.tableCell, { width: "25%" }]}></Text>
              </View>
            );
          })}

          {/* If no empty rows, add border to last actual item */}
          {(invoiceDetails.items?.length || 0) > 4 && (
            <View style={{ borderBottom: "1px solid #000", marginTop: -1 }} />
          )}
        </View>

        {/* Summary Section - Conditional Layout */}
        {hasTemplateFields ? (
          // Show side by side layout when template fields are present
          <View style={styles.summaryContainer}>
            {/* Template Info Box */}
            <View style={styles.templateInfoBox}>
              {invoiceDetails.domain && (
                <View style={styles.templateInfoRow}>
                  <Text style={styles.templateInfoLabel}>Domain:</Text>
                  <Text style={styles.templateInfoValue}>
                    {invoiceDetails.domain}
                  </Text>
                </View>
              )}

              {invoiceDetails.period && (
                <View style={styles.templateInfoRow}>
                  <Text style={styles.templateInfoLabel}>Period:</Text>
                  <Text style={styles.templateInfoValue}>
                    {invoiceDetails.period}
                  </Text>
                </View>
              )}
            </View>

            {/* Summary Box */}
            <View style={styles.summaryBoxWithTemplate}>
              <Text style={styles.summaryTitle}>Invoice Summary</Text>

              {/* Subtotal */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.subtotal)}
                </Text>
              </View>

              {/* Tax Rows - Conditional based on tax type */}
              {taxType === "igst" ? (
                // IGST Row
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    IGST @ {invoiceDetails.igst_rate || 18}%:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.igst_amount)}
                  </Text>
                </View>
              ) : (
                // SGST + CGST Rows
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      SGST @ {invoiceDetails.sgst_rate || 9}%:
                    </Text>
                    <Text style={styles.summaryValue}>
                      {RUPEE_SYMBOL}{" "}
                      {formatCurrency(invoiceDetails.sgst_amount)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      CGST @ {invoiceDetails.cgst_rate || 9}%:
                    </Text>
                    <Text style={styles.summaryValue}>
                      {RUPEE_SYMBOL}{" "}
                      {formatCurrency(invoiceDetails.cgst_amount)}
                    </Text>
                  </View>
                </>
              )}

              {invoiceDetails.roundOffEnabled && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Round Off:</Text>
                  <Text style={styles.summaryValue}>
                    {RUPEE_SYMBOL}{" "}
                    {formatCurrency(invoiceDetails.roundOffAmount)}
                  </Text>
                </View>
              )}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
                <Text style={styles.totalValue}>
                  {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.total_amount)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Show original single summary box layout when no template fields
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Invoice Summary</Text>

            {/* Subtotal */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.subtotal)}
              </Text>
            </View>

            {/* Tax Rows - Conditional based on tax type */}
            {taxType === "igst" ? (
              // IGST Row
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  IGST @ {invoiceDetails.igst_rate || 18}%:
                </Text>
                <Text style={styles.summaryValue}>
                  {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.igst_amount)}
                </Text>
              </View>
            ) : (
              // SGST + CGST Rows
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    SGST @ {invoiceDetails.sgst_rate || 9}%:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.sgst_amount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    CGST @ {invoiceDetails.cgst_rate || 9}%:
                  </Text>
                  <Text style={styles.summaryValue}>
                    {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.cgst_amount)}
                  </Text>
                </View>
              </>
            )}

            {invoiceDetails.roundOffEnabled && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Round Off:</Text>
                <Text style={styles.summaryValue}>
                  {RUPEE_SYMBOL}{" "}
                  {formatCurrency(Math.abs(invoiceDetails.roundOffAmount) || 0)}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
              <Text style={styles.totalValue}>
                {RUPEE_SYMBOL} {formatCurrency(invoiceDetails.total_amount)}
              </Text>
            </View>
          </View>
        )}

        {/* Footer - with break protection */}
        <View style={styles.footer} break={needsPageBreak}>
          <View style={styles.footerRow}>
            {/* Bank Details */}
            <View style={styles.bankSection}>
              <Text style={styles.footerTitle}>Bank Details</Text>

              {isTemplateV2 ? (
                // Template V2: Show ICICI + UPI (skip Kotak)
                <>
                  <Text style={styles.bankText}>{bankDetails.icici.name}</Text>
                  <Text style={styles.bankText}>
                    {bankDetails.icici.account}
                  </Text>
                  <Text style={styles.bankText}>{bankDetails.icici.ifsc}</Text>

                  {/* Divider */}
                  <View style={styles.bankDivider} />

                  <Text style={styles.bankText}>
                    UPI ID: {bankDetails.upi.upi}
                  </Text>
                  <Text style={styles.bankText}>{bankDetails.upi.label}</Text>
                </>
              ) : (
                // Template V1: Show Kotak + ICICI (original)
                <>
                  <Text style={styles.bankText}>{bankDetails.kotak.name}</Text>
                  <Text style={styles.bankText}>
                    {bankDetails.kotak.account}
                  </Text>
                  <Text style={styles.bankText}>{bankDetails.kotak.ifsc}</Text>

                  {/* Divider */}
                  <View style={styles.bankDivider} />

                  <Text style={styles.bankText}>{bankDetails.icici.name}</Text>
                  <Text style={styles.bankText}>
                    {bankDetails.icici.account}
                  </Text>
                  <Text style={styles.bankText}>{bankDetails.icici.ifsc}</Text>
                </>
              )}
            </View>

            {/* Signature */}
            <View style={styles.signatureSection}>
              <Text style={styles.footerTitle}>For {companyData.name}</Text>
              {companyData.sign_img ? (
                <Image src={YSSIGN_BASE64} style={styles.signatureImage} />
              ) : (
                <View style={styles.signatureLine} />
              )}
              <Text style={styles.signatureText}>Authorized Signatory</Text>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.terms}>
            <Text style={styles.footerTitle}>Terms & Conditions:</Text>
            <Text style={styles.termText}>
              1. All payments to be made in favour of "Yukthi Systems Pvt. Ltd."
              within 10 days of receipt of bill.
            </Text>
            <Text style={styles.termText}>
              2. Payment can be made by cheque/DD (send by courier); OR deposit
              at Kotak/ICICI Bank ATMs OR NEFT/RTGS. Email intimation to
              accounts@yukthi.com is a must.
            </Text>
            <Text style={styles.termText}>
              3. Please provide a payment advice along with the payment.
            </Text>
            <Text style={styles.termText}>
              4. In case of cheque bounce the net amount including bank charges
              should be paid by DD.
            </Text>
            <Text style={styles.termText}>
              5. E & O E subject to Bangalore Jurisdiction
            </Text>

            <Text style={styles.disclaimer}>
              This is a computer generated invoice, no signature required.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default InvoicePDFDocument;
