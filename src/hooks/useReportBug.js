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

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  reportBug,
  getBugReports,
  updateBugReportStatus,
  deleteBugReport,
  uploadBugFile,
  getBugFile,
} from "@/api/report";

// POST /report/bug
export const useReportBug = () =>
  useMutation({
    mutationFn: (payload) => reportBug(payload),
  });

// GET /report/bug/{status}
export const useGetBugReports = (status, page, size) =>
  useQuery({
    queryKey: ["bug_reports", status, page, size],
    queryFn: () => getBugReports(status, page, size),
    enabled: !!status,
  });

// PUT /report/bug/{id}
export const useUpdateBugStatus = () =>
  useMutation({
    mutationFn: ({ report_id, bug_status }) =>
      updateBugReportStatus(report_id, bug_status),
  });

// DELETE /report/bug/{id}
export const useDeleteBug = () =>
  useMutation({
    mutationFn: ({ report_id }) => deleteBugReport(report_id),
  });

// ----- Upload Hook -----
export const useUploadBugFile = () =>
  useMutation({
    mutationFn: (formData) =>
      uploadBugFile(formData, {
        timeout: 10 * 60 * 1000, 
        maxBodyLength: Infinity, 
        maxContentLength: Infinity,
        signal: null,
      }),
    retry: 2, 
    networkMode: "always", 
  });


// ----- Fetch File Hook -----
export const useGetBugFile = (file_id, enabled = true) =>
  useQuery({
    queryKey: ["bug-file", file_id],
    queryFn: () => getBugFile(file_id),
    enabled: enabled && !!file_id,
  });
