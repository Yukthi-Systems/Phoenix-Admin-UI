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

import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useToastify } from "@/hooks/useToastify";
import { userProfileAtom } from "@/store/userProfile";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment-timezone";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { emailLogDefaultValue } from "./emailLogDefaultValue";
import { validationSchema } from "./validateSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import Table from "@/components/shared/Table";
import NoDataFound from "@/components/common/NoDataFound";
import { Input } from "@/components/common/Inputs";
import { useGetEmailLogs, useGetEmailLogsReq } from "@/hooks/useLogs";
import { userInfoAtom } from "@/store/userInfo";
import { DomainInfiniteSelectField } from "@/components/common/infiniteSelectors/DomainInfiniteSelectionField";
import {
  Mail,
  Clock,
  Activity,
  User,
  Layers,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Calendar,
} from "lucide-react";
import EmailFlowLogDetailsModal from "./EmailFlowModal";
import { useUserTimezone } from "@/hooks/useTimezone";
import DateTimeRangePicker from "@/components/common/DateRangePicker";
import { useTablePagination } from "@/hooks/useTablePagination";

function EmailFlowLog() {
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();
  const [selected, setSelected] = useState(null);
  const { formatUserDateNice, convertToUTC, userTimezone } = useUserTimezone();
  const [show, setShow] = useState(false);
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");

  // Get default date range (7 days back)
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
    control,
    setValue,
    watch,
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      ...emailLogDefaultValue,
      date_range: getDefaultDateRange(),
    },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const [logList, setLogList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { mutate, isPending } = useGetEmailLogs();
  const { mutate: requestEmailLogs, isPending: isRequesting } =
    useGetEmailLogsReq();

  const dateRange = watch("date_range");
  const domainName = watch("domain_name");

  // Wait for domain to be selected before initial load
  useEffect(() => {
    if (domainName && !hasInitialLoad) {
      fetchLogs(getValues());
      setHasInitialLoad(true);
    }
  }, [domainName, hasInitialLoad]);

  // Handle pagination changes (only after initial load)
  useEffect(() => {
    if (hasInitialLoad && domainName) {
      fetchLogs(getValues());
    }
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

  function removeEmptyValues(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );
  }

  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    const startMoment = moment(dateRange.startDate).tz(userTimezone, true);
    const endMoment = moment(dateRange.endDate).tz(userTimezone, true);

    return {
      from_date: startMoment.utc().toISOString(),
      to_date: endMoment.utc().toISOString(),
    };
  };

  const fetchLogs = async (filters) => {
    // Don't fetch if no domain is selected
    if (!filters.domain_name) {
      return;
    }

    const apiFilters = { ...filters };
    if (filters.date_range) {
      const convertedDates = convertDateRangeForAPI(filters.date_range);
      delete apiFilters.date_range?.startDate;
      delete apiFilters.date_range?.endDate;
      Object.assign(apiFilters.date_range, convertedDates);
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
          toast("error", err.message || "Failed to fetch email logs");
        },
      },
    );
  };

  const requestLogs = () => {
    const currentValues = getValues();

    if (!currentValues.domain_name) {
      toast("error", "Please select a domain first");
      return;
    }

    const apiFilters = { ...currentValues };
    if (currentValues.date_range) {
      const convertedDates = convertDateRangeForAPI(currentValues.date_range);
      delete apiFilters.date_range;
      Object.assign(apiFilters.date_range, convertedDates);
    }

    requestEmailLogs(
      { filters: { ...removeEmptyValues(apiFilters), organization_id } },
      {
        onSuccess: (response) => {
          setLogList(response?.data || []);
          setTotalPages(response?.total_pages || 1);
          setTotalCount(response?.total_count || 0);
          toast("success", "Email logs requested successfully");
        },
        onError: (err) => {
          toast("error", err.message || "Failed to request email logs");
        },
      },
    );
  };

  const onSubmit = (formData) => {
    if (dateValidationError) {
      toast("error", dateValidationError);
      return;
    }

    if (!formData.domain_name) {
      toast("error", "Please select a domain first");
      return;
    }

    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    fetchLogs(formData);
  };

  const handleClearFilters = () => {
    reset({
      ...emailLogDefaultValue,
      date_range: getDefaultDateRange(),
    });
    setDateValidationError("");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleShow = (row) => {
    setSelected(row.original);
    setShow(true);
  };

  const handleCancel = () => {
    setSelected(null);
    setShow(false);
  };

  // Handle date range validation
  const handleDateValidation = (error) => {
    setDateValidationError(error);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (["passed", "validated", "sent"].includes(statusLower)) {
      return "text-success";
    }
    if (["failed", "rejected", "blocked"].includes(statusLower)) {
      return "text-destructive";
    }
    if (["continue", "pending", "processing"].includes(statusLower)) {
      return "text-warning";
    }
    return "text-muted-foreground";
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (["passed", "validated", "sent"].includes(statusLower)) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    }
    if (["failed", "rejected", "blocked"].includes(statusLower)) {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    if (["continue", "pending", "processing"].includes(statusLower)) {
      return <AlertCircle className="w-4 h-4 text-warning" />;
    }
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const getTypeColor = (type) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === "relay") return "text-blue-600";
    if (typeLower === "cloud") return "text-purple-600";
    return "text-muted-foreground";
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ getValue, row }) => {
          const subject = getValue();
          const truncatedSubject =
            subject && subject.length > 50
              ? `${subject.substring(0, 50)}...`
              : subject;

          return (
            <div onClick={() => handleShow(row)} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors">
                  {truncatedSubject || "No Subject"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "from_email_id",
        header: "From",
        cell: ({ getValue }) => {
          const fromEmail = getValue();
          const truncatedEmail =
            fromEmail && fromEmail.length > 30
              ? `${fromEmail.substring(0, 30)}...`
              : fromEmail;

          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="truncate max-w-[200px]" title={fromEmail}>
                <span className="text-sm font-medium text-foreground">
                  {truncatedEmail || "Unknown"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "to_email_ids",
        header: "To",
        cell: ({ getValue }) => {
          const toEmails = getValue();
          const emailArray = Array.isArray(toEmails) ? toEmails : [toEmails];
          const displayEmail = emailArray[0];
          const hasMore = emailArray.length > 1;
          const truncatedEmail =
            displayEmail && displayEmail.length > 30
              ? `${displayEmail.substring(0, 30)}...`
              : displayEmail;

          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div
                className="truncate max-w-[200px]"
                title={emailArray.join(", ")}
              >
                <span className="text-sm font-medium text-foreground">
                  {truncatedEmail || "Unknown"}
                </span>
                {hasMore && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{emailArray.length - 1}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className={`font-medium ${getStatusColor(status)}`}>
                {status || "Unknown"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue();
          return (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className={`font-medium ${getTypeColor(type)}`}>
                {type || "Unknown"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "email_timestamp",
        header: "Timestamp",
        cell: ({ getValue }) => {
          const timestamp = getValue();
          if (!timestamp)
            return <span className="text-muted-foreground">N/A</span>;
          const date = new Date(timestamp);
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {formatUserDateNice(date)}
                </div>
              </div>
            </div>
          );
        },
      },
    ],
    [permissions],
  );

  const table = useReactTable({
    data: logList,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
  });

  if (!permissions.includes("logs:mail_flow:view")) {
    return <AccessDenied content="Don't have access to view email flow logs" />;
  }

  return (
    <>
      <div className="px-2 w-full h-full">
        <div className="w-full flex justify-between items-center mb-4">
          <Breadcrumbs
            items={[{ name: "Logs" }, { name: "Email Flow Logs" }]}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>{totalCount} total records</span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="w-full bg-card rounded-lg shadow-sm border border-border mb-4">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Filter Email Flow Logs
              </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-4 pt-3 gap-6">
                {/* Domain Selection - Required */}
                <DomainInfiniteSelectField
                  name="domain_name"
                  label="Domain"
                  control={control}
                  errors={errors}
                  url={`/domain/list/${organization_id}`}
                  required={true}
                  placeholder="Select domain..."
                />

                <Input
                  label="Subject"
                  name="subject"
                  register={register}
                  errors={errors}
                  placeholder="Enter the subject"
                />

                <Input
                  label="From Email Id"
                  name="from_email_id"
                  register={register}
                  errors={errors}
                  placeholder="Enter sender's email"
                />

                <Input
                  label="Log Status"
                  name="log_status"
                  register={register}
                  errors={errors}
                  placeholder="Enter log status"
                />

                <Input
                  label="Log Type"
                  name="log_type"
                  register={register}
                  errors={errors}
                  placeholder="Enter log type"
                />

                <Input
                  label="EUID"
                  name="euid"
                  register={register}
                  errors={errors}
                  placeholder="Enter EUID"
                />

                <Input
                  label="To Email IDs (comma separated)"
                  name="to_email_ids"
                  register={register}
                  errors={errors}
                  placeholder="Enter recipient emails separated by commas"
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
                        isClearable={false}
                      />
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 md:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    disabled={isPending || !domainName || !!dateValidationError}
                    className="border h-10 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-fit"
                  >
                    {isPending ? "Loading..." : "Search Logs"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      isRequesting || !domainName || !!dateValidationError
                    }
                    onClick={requestLogs}
                    className="border h-10 px-4 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-fit"
                  >
                    {isRequesting ? "Loading..." : "Request Logs"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="border h-10 px-4 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-all duration-200 shadow-sm hover:shadow-md w-fit"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full bg-card rounded-lg shadow-sm border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Email Flow Log Results
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
                <div className="text-sm text-muted-foreground">
                  Showing {logList.length} of {totalCount} records
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            {!domainName ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">Please Select a Domain</p>
                  <p className="text-sm">
                    Choose a domain from the dropdown above to view email flow
                    logs
                  </p>
                </div>
              </div>
            ) : logList.length !== 0 || isPending ? (
              <Table
                totalCount={totalCount}
                table={table}
                isLoading={isPending}
              />
            ) : (
              <div className="p-8">
                <NoDataFound content="No email flow logs found matching your criteria" />
              </div>
            )}
          </div>
        </div>
      </div>

      <EmailFlowLogDetailsModal
        isOpen={show}
        emailLog={selected}
        onClose={handleCancel}
      />
    </>
  );
}

export default EmailFlowLog;
