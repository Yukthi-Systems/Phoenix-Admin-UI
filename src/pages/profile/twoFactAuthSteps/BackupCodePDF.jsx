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

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  text: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: "left",
  },
  empty: {
    fontSize: 12,
    fontStyle: "italic",
    color: "gray",
    textAlign: "center",
    marginTop: 10,
  },
});

const BackupCodePDF = ({ data = [] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Mail Service 25 - Backup Code</Text>

        {Array.isArray(data) && data.length > 0 ? (
          data.map((code, index) => (
            <Text style={styles.text} key={index}>
              {code || "-"}
            </Text>
          ))
        ) : (
          <Text style={styles.empty}>No backup codes available.</Text>
        )}
      </View>
    </Page>
  </Document>
);

export default BackupCodePDF;
