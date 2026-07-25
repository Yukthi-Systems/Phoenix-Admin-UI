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

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  warning: {
    fontSize: 10,
    color: "#e11d48",
    marginTop: 5,
    fontStyle: "italic",
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 5,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: "#111",
  },
  keyContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
  },
  keyValue: {
    fontSize: 14,
    fontFamily: "Courier",
    color: "#000",
    wordBreak: "break-all",
  },
  permissionsText: {
    fontSize: 10,
    fontFamily: "Courier",
    color: "#374151",
    lineHeight: 1.4,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metadataItem: {
    width: "48%",
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

const ApiKeyPDF = ({ data }) => {
  const createdDate = data?.created_at
    ? new Date(data.created_at).toLocaleString()
    : new Date().toLocaleString();

  const customMetadata = React.useMemo(() => {
    if (!data?.details) return {};
    const { created_by, description, ...custom } = data.details;
    return custom;
  }, [data?.details]);

  const hasCustomMetadata = Object.keys(customMetadata).length > 0;
  const permissionsList = data?.permissions?.join(", ") || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>API Key Credentials</Text>
          <Text style={styles.warning}>
            Confidential: Keep this document secure.
          </Text>
        </View>

        {/* Secret Key Section */}
        <View style={styles.keyContainer}>
          <Text style={styles.keyLabel}>API Key Secret</Text>
          <Text style={styles.keyValue}>{data?.api_key || "N/A"}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Key Name</Text>
          <Text style={styles.value}>{data?.key_name || "-"}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{data?.description || "-"}</Text>

          <Text style={styles.label}>Created By</Text>
          <Text style={styles.value}>{data?.created_by || "-"}</Text>

          <Text style={styles.label}>Generated On</Text>
          <Text style={styles.value}>{createdDate}</Text>
        </View>

        {/* Custom Metadata Section */}
        {hasCustomMetadata && (
          <View style={styles.section}>
            <Text style={styles.label}>Additional Metadata</Text>
            <View style={styles.metadataGrid}>
              {Object.entries(customMetadata).map(([key, value]) => (
                <View key={key} style={styles.metadataItem}>
                  <Text style={[styles.label, { marginBottom: 2 }]}>{key}</Text>
                  <Text
                    style={[styles.value, { fontSize: 11, marginBottom: 0 }]}
                  >
                    {value || "-"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Permissions Section */}
        {permissionsList && (
          <View style={styles.section}>
            <Text style={styles.label}>Assigned Permissions</Text>
            <Text style={styles.permissionsText}>{permissionsList}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ApiKeyPDF;
