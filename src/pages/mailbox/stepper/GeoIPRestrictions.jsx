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
import { ListEditor, ListSelect } from "../add/ListEditors";

function GeoIPRestrictions({ geoList, setGeoList, ipList, setIpList }) {
  return (
    <div className="space-y-8">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Access Restrictions
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure geographical and IP-based access controls
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ListSelect
          label="Geo Location"
          placeholder="Select location..."
          list={geoList}
          setList={setGeoList}
        />
        <ListEditor
          placeholder="Enter IP address (e.g., 192.168.1.1)"
          label="IP Address"
          list={ipList}
          setList={setIpList}
          type="ip"
        />
      </div>
    </div>
  );
}

export default GeoIPRestrictions;
