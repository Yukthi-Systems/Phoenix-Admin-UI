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

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const ACCENT = "#1a80e6";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  header: {
    borderBottom: `2pt solid ${ACCENT}`,
    paddingBottom: 12,
    marginBottom: 20,
  },
  orgName: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  meta: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    borderLeft: "3pt solid #d97706",
    padding: 10,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 10,
    color: "#92400e",
    lineHeight: 1.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  codeBox: {
    width: "48%",
    border: "1pt solid #e5e7eb",
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeIndex: {
    fontSize: 8,
    color: "#9ca3af",
  },
  codeText: {
    fontFamily: "Courier-Bold",
    fontSize: 13,
    color: "#111827",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "0.5pt solid #e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  empty: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 20,
  },
});

const formattedDate = () =>
  new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const BackupCodePDF = ({ data = [], orgName = "" }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {orgName ? <Text style={styles.orgName}>{orgName}</Text> : null}
        <Text style={styles.heading}>Two-Factor Backup Codes</Text>
        <Text style={styles.meta}>Generated on {formattedDate()}</Text>
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          Keep these codes somewhere safe. Each code can only be used once to
          sign in if you lose access to your authenticator device.
        </Text>
      </View>

      {Array.isArray(data) && data.length > 0 ? (
        <View style={styles.grid}>
          {data.map((code, index) => (
            <View style={styles.codeBox} key={index}>
              <Text style={styles.codeIndex}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.codeText}>{code || "-"}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No backup codes available.</Text>
      )}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Confidential - do not share these codes
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

export default BackupCodePDF;
