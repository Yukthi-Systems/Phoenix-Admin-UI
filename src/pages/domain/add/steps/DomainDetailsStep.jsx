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

import { Info } from "lucide-react";
import { Input } from "@/components/common/Inputs";
import DomainNameInput from "../DomainNameInput";

const DomainDetailsStep = ({ register, errors, watch }) => {
  return (
    <div className="space-y-8">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Domain Configuration
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure domain settings and location details
        </p>
      </div>

      <div className="form-grid">
        <DomainNameInput
          name="domain_name"
          register={register}
          errors={errors}
          watch={watch}
          isRequired
        />



        <Input
          label="Anti-Phishing Secret Code"
          name="anti_phishing_secret_code"
          placeholder="e.g. neko-nik-2024"
          register={register}
          errors={errors}
          isRequired
          maxLength={20}
          info="4-20 characters (spaces count). Letters, numbers, spaces, underscores (_) and hyphens (-) only."
        />


        <Input
          label="Description"
          name="details.description"
          placeholder="Enter domain description"
          register={register}
          errors={errors}
        />

        <Input
          label="Address"
          name="details.address"
          placeholder="Enter physical address"
          register={register}
          errors={errors}
        />

        <div className="col-span-full flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="text-xs text-left">
            The domain will be created inactive. You'll be shown a TXT record
            to add to its DNS after creation — the domain only becomes active
            once that record is verified.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DomainDetailsStep;
