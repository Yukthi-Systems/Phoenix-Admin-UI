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

import { useGetDisclaimerDetails } from "@/hooks/useDisclaimers";

function GetDisclaimerName({ organization_id, id }) {
  const {
    data,
    isPending: isLoading,
    isError,
  } = useGetDisclaimerDetails(organization_id, id);

  if (!id) {
    return <p>Not assigned</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (isError) {
    return <>Error</>;
  }

  return <div>{data?.data?.disclaimer_name || "Unknown Disclaimer"}</div>;
}

export default GetDisclaimerName;
