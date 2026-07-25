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

import React from "react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeComponent = ({ uri }) => {
  return (
    <div className="">
      <QRCodeSVG
        value={uri}
        size={250}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"M"}
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeComponent;
