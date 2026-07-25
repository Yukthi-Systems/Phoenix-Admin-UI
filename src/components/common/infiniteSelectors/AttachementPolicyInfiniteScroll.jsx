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
import { Info, FileCheck, FileX } from "lucide-react";
import { csrfTokenAtom } from "@/store/csrftoken";
import { adminStore } from "@/store/store";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { API_URL } from "@/constants/constants";
import { getAttachmentPolicyById } from "@/api/attachmentPolicy";
import PolicyDetailsModal from "@/components/common/PolicyDetailsModal";
import PolicyDetailsTrigger from "./PolicyDetailsTrigger";
import { InfoCard, InfoItem } from "@/components/common/InfoCard";
import StatusBadge from "@/components/common/StatusBadge";
import { useUserTimezone } from "@/hooks/useTimezone";

function AttachmentPolicyDetailsModal({ organizationId, domainName, policyId, onClose }) {
  const { formatUserDateNice } = useUserTimezone();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attachment_policy_entry", organizationId, domainName, policyId],
    queryFn: () => getAttachmentPolicyById(organizationId, domainName, policyId),
    enabled: !!organizationId && !!domainName && !!policyId,
    staleTime: 1000 * 60,
  });

  return (
    <PolicyDetailsModal isLoading={isLoading} isError={isError} onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-card-foreground">
            {data?.policy_name || "Unknown Policy"}
          </h4>
          {data?.policy_description && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.policy_description}
            </p>
          )}
        </div>
        <StatusBadge status={data?.is_active} />
      </div>

      <InfoCard icon={Info} title="Overview">
        <InfoItem
          label="Domain"
          value={data?.domain_name || "Not specified"}
        />
        <InfoItem
          label="Max Attachment Size"
          value={
            data?.max_attachment_size_mb > 0
              ? `${data.max_attachment_size_mb} MB`
              : "No limit"
          }
        />
        <InfoItem
          label="Allowed File Types"
          value={`${data?.allowed_file_types?.length || 0} types`}
        />
        <InfoItem
          label="Blocked File Types"
          value={`${data?.blocked_file_types?.length || 0} types`}
        />
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

      {data?.allowed_file_types?.length > 0 && (
        <InfoCard icon={FileCheck} title="Allowed File Types">
          <div className="flex flex-wrap gap-1">
            {data.allowed_file_types.map((type, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded bg-success/10 text-success px-2 py-1 text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </InfoCard>
      )}

      {data?.blocked_file_types?.length > 0 && (
        <InfoCard icon={FileX} title="Blocked File Types">
          <div className="flex flex-wrap gap-1">
            {data.blocked_file_types.map((type, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded bg-destructive/10 text-destructive px-2 py-1 text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </InfoCard>
      )}
    </PolicyDetailsModal>
  );
}

export function AttachmentPolicyInfiniteSelectField({
  control,
  name,
  label,
  errors = {},
  organizationId = "",
  domainName = "",
  placeholder = "Select attachment policy...",
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
    if (!organizationId || !domainName) return;

    setLoading(true);
    try {
      const queryParam = query ? encodeURIComponent(query) : "";
      const apiUrl = `${API_URL}/policy/attachments/list/${organizationId}?domain_name=${domainName}&page=${pageNum}&limit=100&query=${queryParam}`;

      const response = await axios.get(apiUrl, {
        timeout: 5000,
        withCredentials: true,
        headers: {
          "X-Csrf-Token": adminStore.get(csrfTokenAtom),
          "Content-Type": "application/json",
        },
      });

      const { attachment_policies = [], total_pages = 1 } = response.data || {};

      const newOptions = attachment_policies
        .map((item) => ({
          label: item.policy_name,
          value: item.policy_id,
          isDisabled: !item.is_active,
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
      console.error("Failed to load attachment policies", err);
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
  }, [organizationId, domainName]);

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
              selectedOption = { label: `Policy ID: ${field.value}`, value: field.value };
            }
          }

          // Add the selected option to display options if it's not already there
          const displayOptions = selectedOption && !options.find(opt => opt.value === selectedOption.value)
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
                <AttachmentPolicyDetailsModal
                  organizationId={organizationId}
                  domainName={domainName}
                  policyId={field.value}
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
