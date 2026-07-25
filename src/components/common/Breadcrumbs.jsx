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

import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function Breadcrumbs({ items }) {
  const { t } = useTranslation();
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-[11px] transition-colors duration-200"
          >
            <Home size={11} />
            {t("Main")}
          </Link>
        </li>
        {items &&
          items.map((item, index, row) => {
            if (index + 1 === row.length) {
              return (
                <li key={index}>
                  <div className="flex items-center">
                    <ChevronRight
                      size={13}
                      className="text-muted-foreground/60"
                    />
                    <p
                      title={t(item.name)}
                      className="text-foreground ms-1 cursor-not-allowed text-[11px] font-medium text-nowrap"
                    >
                      {t(item.name) || ""}
                    </p>
                  </div>
                </li>
              );
            } else {
              return (
                <li key={index}>
                  <div className="flex items-center">
                    <ChevronRight
                      size={11}
                      className="text-muted-foreground/60"
                    />
                    <Link
                      to={item?.link || "#"}
                      title={t(item.name)}
                      className="text-muted-foreground hover:text-primary ms-1 text-[11px] text-nowrap transition-colors duration-200"
                    >
                      {t(item.name) || ""}
                    </Link>
                  </div>
                </li>
              );
            }
          })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
