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

import { useGetDepartment } from "@/hooks/useDepartment";
import React, { useEffect } from "react";

function GetDepartmentName({ organization_id, id }) {
  const { data, isLoading, isError } = useGetDepartment(organization_id, id);
  const department = data?.data || {};

  useEffect(() => {}, [id]);

  if (!id && organization_id) {
    return <p>Not assigned</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (isError) {
    return <>Error</>;
  }

  return <div>{department?.department_name || "Unknown Department"}</div>;
}

export default GetDepartmentName;
