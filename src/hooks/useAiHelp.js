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

import { useMutation } from "@tanstack/react-query";
import { generateAiStyle, getAISupport } from "../api/aihelp";

export function useAIHelp() {
  return useMutation({
    mutationKey: ["ai_support"],
    mutationFn: async (query) => getAISupport(query),
  });
}

export function useAIStyleGenerate() {
  return useMutation({
    mutationKey: ["ai_generate_style"],
    mutationFn: async (query) => generateAiStyle(query),
  });
}
