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

import { getHelpForRoute } from "@/components/shared/header/helpdesk/pages";
import { atom, useAtom } from "jotai";
import { useLocation } from "react-router-dom";


const helpDeskOpenAtom = atom(false);

export const useHelpDesk = () => {
  const [isOpen, setIsOpen] = useAtom(helpDeskOpenAtom);
  const location = useLocation();

  const openHelpDesk = () => setIsOpen(true);
  const closeHelpDesk = () => setIsOpen(false);
  const toggleHelpDesk = () => setIsOpen((prev) => !prev);

  const getCurrentPageData = () => {
    return getHelpForRoute(location.pathname);
  };

  const hasHelpForCurrentPage = () => {
    return getCurrentPageData() !== null;
  };

  return {
    isOpen,
    openHelpDesk,
    closeHelpDesk,
    toggleHelpDesk,
    getCurrentPageData,
    hasHelpForCurrentPage,
  };
};