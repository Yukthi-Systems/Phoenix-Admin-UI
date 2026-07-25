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

import { Controller } from "react-hook-form";
import Select from "react-select";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Info, FileText } from "lucide-react";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";
import { getCautionDetails } from "@/api/cautions";
import PolicyDetailsModal from "@/components/common/PolicyDetailsModal";
import PolicyDetailsTrigger from "./PolicyDetailsTrigger";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import HTMLPreview from "@/components/common/HtmlPreview";
import { useUserTimezone } from "@/hooks/useTimezone";

function CautionDetailsModal({ organizationId, cautionId, onClose }) {
  const { formatUserDateNice } = useUserTimezone();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["caution_details", organizationId, cautionId],
    queryFn: () => getCautionDetails(organizationId, cautionId),
    enabled: !!organizationId && !!cautionId,
    staleTime: 1000 * 60,
  });

  return (
    <PolicyDetailsModal isLoading={isLoading} isError={isError} onClose={onClose}>
      <h4 className="text-lg font-semibold text-card-foreground">
        {data?.caution_name || "Unknown Caution"}
      </h4>

      <InfoCard icon={Info} title="Overview">
        {data?.info?.description && (
          <InfoItem label="Description" value={data.info.description} />
        )}
        {data?.info?.severity && (
          <InfoItem label="Severity" value={data.info.severity} />
        )}
        {data?.created_at && (
          <InfoItem
            label="Created"
            value={formatUserDateNice(data.created_at)}
          />
        )}
        {data?.updated_at && (
          <InfoItem
            label="Last Updated"
            value={formatUserDateNice(data.updated_at)}
          />
        )}
      </InfoCard>

      {data?.info?.notes && (
        <InfoCard icon={FileText} title="Additional Notes">
          <p className="text-sm text-card-foreground whitespace-pre-wrap break-words text-left">
            {data.info.notes}
          </p>
        </InfoCard>
      )}

      {data?.text_content && (
        <InfoCard icon={FileText} title="Text Content">
          <pre className="text-xs font-mono whitespace-pre-wrap break-words text-left max-h-40 overflow-y-auto">
            {data.text_content}
          </pre>
        </InfoCard>
      )}

      {data?.html_content && (
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1 text-left">
            HTML Content
          </label>
          <HTMLPreview
            height="220px"
            showPreviewText={false}
            resizable={false}
            htmlContent={data.html_content}
          />
        </div>
      )}
    </PolicyDetailsModal>
  );
}

export function CautionInfiniteSelectField({
  control,
  name,
  label,
  errors = {},
  url = "",
  organizationId = "",
  placeholder = "Select option...",
  customStyle = "",
}) {
  const error = errors?.[name];
  const [showDetails, setShowDetails] = useState(false);

  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const fetchOptions = async (pageNum = 1, query = "") => {
    if (loading || (totalPages && pageNum > totalPages)) return;

    setLoading(true);
    try {
      const queryParam = query ? `${encodeURIComponent(query)}` : "";
      const apiUrl = `${API_URL}${url}/${pageNum}/100?query=${queryParam}`;

      const response = await axios.get(apiUrl, {
        timeout: 5000,
        withCredentials: true,
        headers: {
          "X-Csrf-Token": adminStore.get(csrfTokenAtom),
          "Content-Type": "application/json",
        },
      });

      const { cautions = [], total_pages = 1 } = response.data?.data || {};

      const newOptions = cautions.map((item) => ({
        label: item.caution_name,
        value: item.caution_id,
      }));

      if (pageNum === 1 || query !== searchQuery) {
        setOptions(newOptions);
      } else {
        setOptions((prev) => [...prev, ...newOptions]);
      }

      setTotalPages(total_pages);
      setPage(pageNum);
      setSearchQuery(query);
    } catch (err) {
      console.error("Failed to load options", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue, actionMeta) => {
    // Don't trigger search when clearing or when menu is closed
    if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setTotalPages(null);
      fetchOptions(1, inputValue);
    }, 300);
  };

  const handleMenuScrollToBottom = () => {
    if (!loading && totalPages && page < totalPages) {
      fetchOptions(page + 1, searchQuery);
    }
  };

  useEffect(() => {
    setOptions([]);
    setPage(1);
    setTotalPages(null);
    setSearchQuery("");
    fetchOptions(1, "");
  }, [url]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`${customStyle} w-full text-left`}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let selectedOption = null;

          // Only try to find/create selected option if field has a value
          if (field.value) {
            selectedOption = options.find((opt) => opt.value === field.value);

            // If value exists but not in options, create a temporary option
            if (!selectedOption) {
              selectedOption = {
                label: `Caution ID: ${field.value}`,
                value: field.value,
              };
            }
          }

          // Add the selected option to display options if it's not already there
          const displayOptions =
            selectedOption &&
            !options.find((opt) => opt.value === selectedOption.value)
              ? [selectedOption, ...options]
              : options;

          return (
            <>
              <PolicyDetailsTrigger
                label={label}
                hasValue={!!field.value}
                onClick={() => setShowDetails(true)}
              />
              <Select
                {...field}
                value={selectedOption}
                options={displayOptions}
                placeholder={placeholder}
                onChange={(selected) => field.onChange(selected ? selected.value : null)}
                onMenuScrollToBottom={handleMenuScrollToBottom}
                onInputChange={handleInputChange}
                isClearable
                isLoading={loading}
                menuPlacement="auto"
                styles={getReactSelectStyles()}
                menuPortalTarget={document.body}
                classNamePrefix="react-select"
              />
              {showDetails && field.value && (
                <CautionDetailsModal
                  organizationId={organizationId}
                  cautionId={field.value}
                  onClose={() => setShowDetails(false)}
                />
              )}
            </>
          );
        }}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}
