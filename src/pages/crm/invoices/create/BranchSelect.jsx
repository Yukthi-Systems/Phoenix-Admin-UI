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

import Dropdown from "@/components/common/Dropdown";
import { useState, useEffect } from "react";

const BranchSelector = ({
  control,
  errors,
  organizationDetails,
  onBranchSelect,
  name = "selected_branch",
  label = "Select Branch",
  customStyle = "",
  isRequired = true,
}) => {
  const [branchOptions, setBranchOptions] = useState([]);

  // Convert branches object to select options
  useEffect(() => {
    if (organizationDetails?.details?.branches) {
      const branches = organizationDetails.details.branches;

      // Handle both object and array formats
      let branchArray = [];
      if (Array.isArray(branches)) {
        branchArray = branches;
      } else if (typeof branches === "object") {
        // Convert branches object to array with keys
        branchArray = Object.entries(branches).map(([key, branch]) => ({
          ...branch,
          branch_id: key,
        }));
      }

      const options = branchArray.map((branch, index) => {
        const branchId = branch.branch_id || `branch_${index}`;
        const branchName = branch.name || `Branch ${index + 1}`;

        // Create full address
        const addressParts = [
          branch.address_one,
          branch.address_two,
          branch.city,
          branch.state,
          branch.country,
          branch.pincode,
        ].filter(Boolean);

        const fullAddress = addressParts.join(", ");

        return {
          value: branchId,
          label: `${branchName}${fullAddress ? ` - ${fullAddress}` : ""}`,
          branch: {
            ...branch,
            branch_id: branchId,
            full_address: fullAddress,
          },
        };
      });

      setBranchOptions(options);
    } else {
      setBranchOptions([]);
    }
  }, [organizationDetails]);

  // Handle branch selection
  const handleBranchChange = (selectedOption) => {
    if (selectedOption && onBranchSelect) {
      const selectedBranch = selectedOption.branch;

      // Create CLIENT_DATA format from selected branch
      const clientData = {
        name: organizationDetails?.organization_name || "",
        address: selectedBranch.full_address || "",
        gst_number: organizationDetails?.details?.gst_number || "",
        state_code: getStateCode(selectedBranch.state), // You might want to create a mapping function
        branch_id: selectedBranch.branch_id,
        city: selectedBranch.city || "",
        state: selectedBranch.state || "",
        country: selectedBranch.country || "",
        pincode: selectedBranch.pincode || "",
        address_one: selectedBranch.address_one || "",
        address_two: selectedBranch.address_two || "",
      };

      onBranchSelect(clientData, selectedBranch);
    } else if (!selectedOption && onBranchSelect) {
      // Clear selection
      onBranchSelect(null, null);
    }
  };

  // Helper function to get state code (you can expand this mapping)
  const getStateCode = (stateName) => {
    if (!stateName) return "";

    const stateCodeMapping = {
      bihar: "10",
      karnataka: "29",
      delhi: "07",
      maharashtra: "27",
      gujarat: "24",
      rajasthan: "08",
      "uttar pradesh": "09",
      "west bengal": "19",
      "tamil nadu": "33",
      "andhra pradesh": "37",
      telangana: "36",
      kerala: "32",
      odisha: "21",
      punjab: "03",
      haryana: "06",
      jharkhand: "20",
      assam: "18",
      "himachal pradesh": "02",
      uttarakhand: "05",
      goa: "30",
      tripura: "16",
      meghalaya: "17",
      manipur: "14",
      nagaland: "13",
      "arunachal pradesh": "12",
      mizoram: "15",
      sikkim: "11",
      "jammu and kashmir": "01",
      ladakh: "38",
      chandigarh: "04",
      puducherry: "34",
      "andaman and nicobar islands": "35",
      "dadra and nagar haveli and daman and diu": "26",
      lakshadweep: "31",
    };

    return stateCodeMapping[stateName.toLowerCase()] || "29"; // Default to Karnataka
  };

  return (
    <Dropdown
      label={label}
      name={name}
      control={control}
      options={branchOptions}
      errors={errors}
      customStyle={customStyle}
      placeholder="Choose a branch..."
      isRequired={isRequired}
      isClearable={true}
      onChange={handleBranchChange}
      noOptionsMessage={() => "No branches available"}
    />
  );
};

export default BranchSelector;
