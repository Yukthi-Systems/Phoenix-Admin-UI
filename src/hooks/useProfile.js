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

import { useQuery } from "@tanstack/react-query";
import { profile } from "../api/auth";

export function useProfile(user_id, organization_id) {
  return useQuery({
    queryKey: ["profile", user_id, organization_id],
    queryFn: () => profile(user_id, organization_id),
    staleTime: 1000 * 60, // 60 Seconds
    cacheTime: 1000 * 60, // 60 Seconds
    retry: 3,
  });
}
