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

import { addLogs } from "@/api/logs";

export const  ImportActionLog = async  ({
    values = {},
}) => {
    const { action_type ="",message="", payload = {}} = values;

    // Implement the import action log logic here
    await addLogs({
        values,
        type: "success",
        method: "POST",
        action_type,
        payload: payload,
        message,
    });

}