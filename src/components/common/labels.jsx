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

import { useTranslation } from "react-i18next";

export function FormHeader({ text = "", color = "text-foreground" }) {
  const { t } = useTranslation();
  return <h2 className={`text-xl font-bold ${color}`}>{t(text) || ""}</h2>;
}

export function LegendHeader({ text = "" }) {
  const { t } = useTranslation();
  return (
    <legend className="text-lg font-semibold text-card-foreground">
      {t(text) || ""}
    </legend>
  );
}
