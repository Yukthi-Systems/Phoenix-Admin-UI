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

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import { Eye, User, Clock, Activity, Calendar, Download } from "lucide-react";
import moment from "moment-timezone";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Input } from "@/components/common/Inputs";
import { userProfileAtom } from "@/store/userProfile";
import { validationSchema } from "./validateSchema";
import DateTimeRangePicker from "@/components/common/DateRangePicker";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { useToastify } from "@/hooks/useToastify";
import { useGetAuditLogs, useGetAuditLogsReq } from "@/hooks/useLogs";
import { getAuditLogs } from "@/api/logs"; // Use the direct API
import NoDataFound from "@/components/common/NoDataFound";
import Table from "@/components/shared/Table";
import { userInfoAtom } from "@/store/userInfo";
import AuditLogDetailsModal from "./AuditLogsModal";
import { ActionTypeSelectField } from "./ActionTypeSelect";
import { UserInfiniteSelectField } from "@/components/common/infiniteSelectors/UserInfiniteSelect";
import { useUserTimezone } from "@/hooks/useTimezone";
import useExport from "@/hooks/useExport";
import ExportModal from "@/components/common/ExportModal";
import { FIELD_MAPPINGS } from "@/constants/export";
import RequestLogsModal from "./RequestlogModal";
import { useTablePagination } from "@/hooks/useTablePagination";

function AuditLog() {
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const { organization_id } = useAtomValue(userInfoAtom);
  const toast = useToastify();
  const { formatUserDateNice, userTimezone } = useUserTimezone();
  const [selected, setSelected] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const getDefaultDateRange = () => {
    const nowInUserTz = moment.tz(userTimezone);
    const sevenDaysAgoInUserTz = nowInUserTz.clone().subtract(7, "days");

    const nowStr = nowInUserTz.format("YYYY-MM-DDTHH:mm:ss");
    const sevenDaysAgoStr = sevenDaysAgoInUserTz.format("YYYY-MM-DDTHH:mm:ss");

    return {
      startDate: new Date(sevenDaysAgoStr),
      endDate: new Date(nowStr),
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    reset,
    control,
  } = useForm({
    defaultValues: {
      action_type: "",
      user_id: "",
      search_text: "",
      date_range: getDefaultDateRange(),
    },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const [logList, setLogList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateValidationError, setDateValidationError] = useState("");

  const { mutate, isPending } = useGetAuditLogs();
  const { mutate: reqLogs, isPending: isLoad } = useGetAuditLogsReq();

  const sortedLogList = useMemo(() => {
    return [...logList].sort((a, b) => {
      return new Date(b.action_timestamp) - new Date(a.action_timestamp);
    });
  }, [logList]);

  const dateRange = watch("date_range");

  // Helper to remove empty values from filters
  const removeEmptyValues = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );
  };

  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    const startMoment = moment(dateRange.startDate).tz(userTimezone, true);
    const endMoment = moment(dateRange.endDate).tz(userTimezone, true);

    return {
      from_date: startMoment.utc().toISOString(),
      to_date: endMoment.utc().toISOString(),
    };
  };

  const handleRequestLogsClick = () => {
    setShowRequestModal(true);
  };

  const fetchAuditLogsForExport = useCallback(
    async ({ page, pageSize }) => {
      const formValues = getValues();
      const apiFilters = { ...formValues };

      if (formValues.date_range) {
        const convertedDates = convertDateRangeForAPI(formValues.date_range);
        delete apiFilters.date_range;
        apiFilters.date_range = convertedDates;
      }

      const payload = {
        ...removeEmptyValues(apiFilters),
        organization_id,
      };

      return await getAuditLogs(payload, page, pageSize);
    },
    [getValues, organization_id, convertDateRangeForAPI],
  );

  const {
    isExportModalOpen,
    exportConfig,
    handleExport,
    handleExportModalClose,
    isExportAvailable,
  } = useExport(
    "audit_logs",
    fetchAuditLogsForExport,
    {},
    FIELD_MAPPINGS.audit_logs,
  );

  useEffect(() => {
    const filters = removeEmptyValues(getValues());
    fetchLogs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  // Date validation
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      const from = new Date(dateRange.startDate);
      const to = new Date(dateRange.endDate);

      if (from > to) {
        toast(
          "warning",
          "From date is after To date. Please check your date range.",
        );
      }

      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        toast(
          "info",
          "Date range exceeds 30 days. Query may take longer to process.",
        );
      }
    }
  }, [dateRange, toast]);

  const fetchLogs = (filters) => {
    const apiFilters = { ...filters };
    if (filters.date_range) {
      const convertedDates = convertDateRangeForAPI(filters.date_range);
      delete apiFilters.date_range;
      apiFilters.date_range = convertedDates;
    }

    const payload = {
      ...removeEmptyValues(apiFilters),
      organization_id,
    };

    mutate(
      {
        filters: payload,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      },
      {
        onSuccess: (response) => {
          setLogList(response?.data || []);
          setTotalPages(response?.total_pages || 1);
          setTotalCount(response?.total_count || 0);
        },
        onError: (err) => {
          toast("error", err.message || "Failed to fetch audit logs");
        },
      },
    );
  };

  const requestLogs = () => {
    const formValues = getValues();
    const apiFilters = { ...formValues };
    if (formValues.date_range) {
      const convertedDates = convertDateRangeForAPI(formValues.date_range);
      delete apiFilters.date_range;
      apiFilters.date_range = convertedDates;
    }

    const payload = {
      ...removeEmptyValues(apiFilters),
      organization_id,
      email,
    };

    reqLogs(
      { filters: payload },
      {
        onSuccess: (response) => {
          setLogList(response?.data || []);
          setTotalPages(response?.total_pages || 1);
          setTotalCount(response?.total_count || 0);
          toast("success", "Audit logs requested successfully");
        },
        onError: (err) => {
          toast("error", err.message || "Failed to request audit logs");
        },
      },
    );
  };

  const onSubmit = (formData) => {
    if (dateValidationError) {
      toast("error", dateValidationError);
      return;
    }

    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    fetchLogs(formData);
  };

  const handleClearFilters = () => {
    reset({
      action_type: "",
      user_id: "",
      search_text: "",
      date_range: getDefaultDateRange(),
    });
    setDateValidationError("");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleViewDetails = (row) => {
    setSelected(row.original);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setSelected(null);
    setShowDetailsModal(false);
  };

  // Handle date range validation
  const handleDateValidation = (error) => {
    setDateValidationError(error);
  };

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "message",
        header: ({ column }) => <div className="text-left">Title</div>,
        cell: ({ getValue, row }) => {
          const message = getValue();
          const truncatedMessage =
            message && message.length > 100
              ? `${message.substring(0, 100)}...`
              : message;

          return (
            <div onClick={() => handleViewDetails(row)} className="text-left">
              <span
                className="main-col text-foreground cursor-pointer text-sm"
                title={message}
              >
                {truncatedMessage || "No description available"}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: "user_id",
        header: "Created By",
        cell: ({ getValue, row }) => {
          // eslint-disable-next-line no-unused-vars
          const userId = getValue();
          const userEmail = row?.original?.user_email;
          const createdBy = row?.original?.details?.created_by;

          return (
            <div className="flex items-center justify-start gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <div>
                <div className="text-foreground text-sm font-medium">
                  {createdBy || "System"}
                </div>
                {userEmail && (
                  <div
                    className="text-muted-foreground max-w-[150px] truncate text-xs"
                    title={userEmail}
                  >
                    {userEmail}
                  </div>
                )}
              </div>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "action_type",
        header: " Type",
        cell: ({ getValue, row }) => {
          const actionType = getValue();
          return (
            <div className="text-left">
              <span>
                {actionType
                  .split("_")
                  .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
                  .join(" ") || "Unknown"}
              </span>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
      {
        accessorKey: "action_timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => {
          const timestamp = getValue();
          if (!timestamp)
            return <span className="text-muted-foreground">N/A</span>;
          const date = new Date(timestamp);
          return (
            <div className="flex items-center justify-start gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <div>
                <div className="text-foreground text-sm font-medium">
                  {formatUserDateNice(date)}
                </div>
              </div>
            </div>
          );
        },
        meta: {
          align: "left",
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const table = useReactTable({
    data: sortedLogList,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
  });

  if (!permissions.includes("logs:audit:view")) {
    return <AccessDenied content="Don't have access to view audit logs" />;
  }

  return (
    <>
      <div className="h-full w-full px-2">
        <div className="mb-4 flex w-full items-center justify-between">
          <Breadcrumbs items={[{ name: "Logs" }, { name: "Audit Logs" }]} />
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            <span>{totalCount} total records</span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card border-border mb-4 w-full rounded-lg border shadow-sm">
          <div className="border-border border-b p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full grid-cols-1 gap-6 px-4  md:grid-cols-2 lg:grid-cols-4">
                <div className=" lg:col-span-2">
                  <Input
                    label="Search Message"
                    name="search_text"
                    register={register}
                    errors={errors}
                    placeholder="Search by message..."
                  />
                </div>

                {/* Action Type Dropdown */}
                <ActionTypeSelectField
                  control={control}
                  name="action_type"
                  label="Action Type"
                  placeholder="Select action type..."
                  errors={errors}
                />

                {/* User Infinite Select */}
                <UserInfiniteSelectField
                  control={control}
                  name="user_id"
                  label="User"
                  organization_id={organization_id}
                  placeholder="Select user..."
                  errors={errors}
                />

                {/* DateTime Range Picker */}
                <div className="md:col-span-2 lg:col-span-1">
                  <Controller
                    name="date_range"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DateTimeRangePicker
                        disabledFutureDates
                        value={value}
                        onChange={onChange}
                        label="Date Range *"
                        placeholder="Select date range..."
                        includeTime={true}
                        maxDays={30}
                        onValidation={handleDateValidation}
                        error={dateValidationError}
                        // info="Maximum 30 days range allowed"
                        isClearable={false}
                      />
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2 w-full md:col-span-2 lg:col-span-2">
                  <button
                    type="submit"
                    disabled={isPending || !!dateValidationError}
                    className="bg-primary text-nowrap text-primary-foreground hover:bg-primary/90 h-10 w-fit rounded border px-4 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Loading..." : "Search Logs"}
                  </button>

                  <button
                    type="button"
                    disabled={isLoad || !!dateValidationError}
                    onClick={handleRequestLogsClick}
                    className="bg-secondary text-nowrap text-secondary-foreground hover:bg-secondary/80 h-10 w-fit rounded border px-4 shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoad ? "Loading..." : "Request Logs"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="bg-accent    text-nowrap text-accent-foreground hover:bg-accent/80 h-10 w-fit rounded border px-4 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    Clear Filters
                  </button>

                  {/* Export Button */}
                  {isExportAvailable && (
                    <button
                      type="button"
                      onClick={handleExport}
                      className="bg-background self-end text-foreground hover:bg-muted border-border flex h-10 w-fit items-center gap-2 rounded border px-4 shadow-sm transition-all duration-200 hover:shadow-md"
                      title="Export Audit Logs"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-card border-border w-full rounded-lg border shadow-sm">
          <div className="border-border border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                Audit Log Results
              </h3>
              <div className="flex items-center gap-4">
                {dateRange?.startDate && dateRange?.endDate && (
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(dateRange.startDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, " ")}{" "}
                      -{" "}
                      {new Date(dateRange.endDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(/ /g, " ")}
                    </span>
                  </div>
                )}
                <div className="text-muted-foreground text-sm">
                  Showing {logList.length} of {totalCount} records
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            {logList.length !== 0 || isPending ? (
              <Table
                totalCount={totalCount}
                table={table}
                isLoading={isPending}
              />
            ) : (
              <div className="p-8">
                <NoDataFound content="No audit logs found matching your criteria" />
              </div>
            )}
          </div>
        </div>
      </div>

      <AuditLogDetailsModal
        isOpen={showDetailsModal}
        auditLog={selected}
        onClose={handleCloseModal}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        exportConfig={exportConfig}
        title="Export Audit Logs"
        description="Export audit logs based on current filters. This may take a few minutes for large datasets."
      />

      <RequestLogsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={requestLogs}
        isPending={isLoad}
      />
    </>
  );
}

export default AuditLog;
