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

import { useAtom, useAtomValue } from "jotai";
import { themeAtom } from "../store/theme";
import { useEffect, useRef } from "react";
import { uiInfoAtom } from "@/store/uiInfo";

export function useApplyTheme() {
  const uiInfo = useAtomValue(uiInfoAtom);
  const prevThemeRef = useRef();

  const theme = uiInfo?.theme?.mode || "light";

  useEffect(() => {
    const root = document.documentElement;
    if (prevThemeRef.current) {
      root.classList.remove(prevThemeRef.current);
    }

    root.classList.add(theme);

    prevThemeRef.current = theme;

    return () => {
      root.classList.remove(theme);
    };
  }, [theme]);
}
