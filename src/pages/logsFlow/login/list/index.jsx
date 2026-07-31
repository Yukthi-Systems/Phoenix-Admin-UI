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

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtomValue } from "jotai";
import moment from "moment-timezone";
import AccessDenied from "@/components/common/AccessDenied";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Table from "@/components/shared/Table";
import NoDataFound from "@/components/common/NoDataFound";
import { Input } from "@/components/common/Inputs";
import { DomainInfiniteSelectField } from "@/components/common/infiniteSelectors/DomainInfiniteSelectionField";
import DateTimeRangePicker from "@/components/common/DateRangePicker";
import { useToastify } from "@/hooks/useToastify";
import { useGetLoginLogs, useGetLoginLogsReq } from "@/hooks/useLogs";
import { userProfileAtom } from "@/store/userProfile";
import { userInfoAtom } from "@/store/userInfo";
import { validationSchema } from "./validateSchema";
import { loginLogDefaultValue } from "./loginLogDefaultValue";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useUserTimezone } from "@/hooks/useTimezone";
import { useTablePagination } from "@/hooks/useTablePagination";

function LoginAttemptsLogs() {
  const { organization_id } = useAtomValue(userInfoAtom);
  const { permissions = [] } = useAtomValue(userProfileAtom) || {};
  const toast = useToastify();

  const [selected, setSelected] = useState([]);
  const [show, setShow] = useState(false);
   const { pagination, onPaginationChange: setPagination } =
      useTablePagination();
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");
  const { formatUserDateNice, convertToUTC, userTimezone } = useUserTimezone();

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
    getValues,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      email_id: "",
      origin_ip_address: "",
      domain_name: "",
      date_range: getDefaultDateRange(), // Use startDate/endDate format
    },
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const [logList, setLogList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);

  const { mutate, isPending } = useGetLoginLogs();
  const { mutate: reqLogs, isPending: isLoad } = useGetLoginLogsReq();

  const dateRange = watch("date_range");
  const domainName = watch("domain_name");

  useEffect(() => {
    if (domainName && !hasInitialLoad) {
      fetchLogs(getValues());
      setHasInitialLoad(true);
    }
  }, [domainName, hasInitialLoad]);

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

  // Convert DateTimeRangePicker format to API format
  const convertDateRangeForAPI = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    const startMoment = moment(dateRange.startDate).tz(userTimezone, true);
    const endMoment = moment(dateRange.endDate).tz(userTimezone, true);

    return {
      from_date: startMoment.utc().toISOString(),
      to_date: endMoment.utc().toISOString(),
    };
  };

  const fetchLogs = (filters) => {
    // Don't fetch if no domain is selected
    if (!filters.domain_name) {
      return;
    }

    // Convert date range to the format expected by API
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
          setTotalCount(response?.total_count || 1);
        },
        onError: (err) => {
          toast("error", err.message || "Failed to fetch login logs");
        },
      },
    );
  };

  const requestLogs = () => {
    const formValues = getValues();

    if (!formValues.domain_name) {
      toast("error", "Please select a domain first");
      return;
    }

    // Convert date range to the format expected by API
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

    reqLogs(
      { filters: payload },
      {
        onSuccess: (response) => {
          setLogList(response?.data || []);
          setTotalPages(response?.total_pages || 1);
          toast("success", "Login logs requested successfully");
        },
        onError: (err) => {
          toast("error", err.message || "Failed to request login logs");
        },
      },
    );
  };

  const onSubmit = (formData) => {
    if (!formData.domain_name) {
      toast("error", "Please select a domain first");
      return;
    }

    // Check for date validation errors before submitting
    if (dateValidationError) {
      toast("error", dateValidationError);
      return;
    }

    fetchLogs(formData);
  };

  const handleShow = (value) => {
    setSelected(value);
    setShow(true);
  };

  const handleCancel = () => {
    setSelected([]);
    setShow(false);
  };

  const handleClearFilters = () => {
    reset({
      email_id: "",
      origin_ip_address: "",
      domain_name: "",
      date_range: getDefaultDateRange(),
    });
    setDateValidationError("");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleDateValidation = (error) => {
    setDateValidationError(error);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "email_id",
        header: "Email",
        meta: {
          align: "left",
        },
      },

      {
        accessorKey: "origin_ip",
        header: "IP Address",
        meta: {
          align: "left",
        },
      },
      // {
      //   accessorKey: "domain_name",
      //   header: "Domain",
      //   cell: ({ row }) => (
      //     <span onClick={() => handleShow(row)}>{row?.original?.domain_name}</span>
      //   ),
      // },
      {
        accessorKey: "timestamp",
        header: "Created",
        cell: ({ getValue }) => formatUserDateNice(getValue()),
        meta: {
          align: "left",
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

  if (!permissions.includes("logs:login_attempts:view")) {
    return (
      <AccessDenied content="Don't have access to view login attempt logs" />
    );
  }

  return (
    <div className="px-2 w-full h-full">
      <div className="w-full flex justify-between items-center mb-2.5 mt-1.5">
        <Breadcrumbs
          items={[{ name: "Logs" }, { name: "Login Attempts Logs" }]}
        />
      </div>

      <div className="w-full  bg-card rounded-lg shadow-lg  border border-border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-4 pt-3 gap-6">
            <Input
              placeholder="Enter EmailId"
              label="Email Id"
              name="email_id"
              register={register}
              errors={errors}
            />

            <Input
              placeholder="Enter IP Address"
              label="IP Address"
              name="origin_ip_address"
              register={register}
              errors={errors}
            />

            <DomainInfiniteSelectField
              name="domain_name"
              label="Domain"
              control={control}
              errors={errors}
              url={`/domain/list/${organization_id}`}
              required={true}
            />

            {/* DateTime Range Picker */}
            <div className="md:col-span-2 lg:col-span-1">
              <Controller
                name="date_range"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DateTimeRangePicker
                    value={value}
                    onChange={onChange}
                    label="Date Range"
                    isRequired
                    placeholder="Select date range..."
                    includeTime={true}
                    showPresets={true}
                    maxDays={30}
                    onValidation={handleDateValidation}
                    error={dateValidationError}
                    disabledFutureDates
                    // info="Maximum 30 days range allowed"
                    isClearable
                  />
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={isPending || !domainName || !!dateValidationError}
                className="border h-10 px-4 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-fit"
              >
                {isPending ? "Loading..." : "Submit"}
              </button>

              {/* Request Logs - commented out for now */}
              {/* <button
                type="button"
                disabled={isLoad || !domainName || !!dateValidationError}
                className="border h-10 px-4 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-fit"
                onClick={requestLogs}
              >
                {isLoad ? "Loading..." : "Request"}
              </button> */}

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

        <div className="w-full h-[calc(100vh-197px)] mt-4">
          {!domainName ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Loading domains...</p>
                <p className="text-sm">
                  Please wait while we load available domains
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
            <NoDataFound content="No login attempt logs found" />
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginAttemptsLogs;
