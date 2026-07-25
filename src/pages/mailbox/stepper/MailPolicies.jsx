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

import { DistributionPolicyInfiniteSelectionField } from '@/components/common/infiniteSelectors/DistributionPolicyInfiniteSelectionField'
import { ForwardingPolicyInfiniteSelectionField } from '@/components/common/infiniteSelectors/ForwardingPolicyInfiniteSelectionField'
import { GeneralPolicyInfiniteSelectionField } from '@/components/common/infiniteSelectors/GeneralPolicyInfiniteSelectionField'
import InfoBox from '@/components/common/InfoBox'
import React, { useEffect, useRef } from 'react'

function MailPolicies({
  register,
  errors,
  watch,
  control,
  setValue,
  organization_id = "",
  domain_name = ""
}) {
  const general_policy_id = watch("general_policy_id");
  const forwarding_policy_id = watch("forwarding_policy_id");
  const distribution_policy_id = watch("distribution_policy_id");

  const prevDistributionRef = useRef(distribution_policy_id);
  const prevForwardingRef = useRef(forwarding_policy_id);

  // Distribution excludes Forwarding and General; Forwarding excludes Distribution only.
  useEffect(() => {
    const distributionChanged = distribution_policy_id !== prevDistributionRef.current;
    const forwardingChanged = forwarding_policy_id !== prevForwardingRef.current;

    if (distributionChanged && distribution_policy_id) {
      if (forwarding_policy_id) setValue("forwarding_policy_id", null, { shouldValidate: true, shouldDirty: true });
      if (general_policy_id) setValue("general_policy_id", null, { shouldValidate: true, shouldDirty: true });
    } else if (forwardingChanged && forwarding_policy_id && distribution_policy_id) {
      setValue("distribution_policy_id", null, { shouldValidate: true, shouldDirty: true });
    }

    prevDistributionRef.current = distribution_policy_id;
    prevForwardingRef.current = forwarding_policy_id;
  }, [distribution_policy_id, forwarding_policy_id, general_policy_id, setValue]);

  const isForwardingDisabled = !!distribution_policy_id;
  const isGeneralDisabled = !!distribution_policy_id;
  const isDistributionDisabled = !!forwarding_policy_id;

  let policyHint = "A Distribution Policy cannot be combined with a Forwarding or General Policy. Selecting a Forwarding Policy also disables the Distribution Policy option.";
  if (distribution_policy_id) {
    policyHint = "Distribution Policy is selected, so Forwarding Policy and General Policy are disabled. Clear the Distribution Policy to choose one of them instead.";
  } else if (forwarding_policy_id) {
    policyHint = "Forwarding Policy is selected, so Distribution Policy is disabled. Clear the Forwarding Policy to choose Distribution instead.";
  }

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">
          Mail Policies
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter the basic mail policies for the user
        </p>
      </div>

      <InfoBox title="Policy Selection Rule" description={policyHint} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <GeneralPolicyInfiniteSelectionField
          name="general_policy_id"
          label="General Policy"
          control={control}
          errors={errors}
          url={`/policy/general/list/${organization_id}?domain_name=${domain_name}`}
          organizationId={organization_id}
          placeholder="Select policy..."
          isDisabled={isGeneralDisabled}
        />

        <ForwardingPolicyInfiniteSelectionField
          name="forwarding_policy_id"
          label="Forwarding Policy"
          control={control}
          errors={errors}
          url={`/policy/forwarding/list/${organization_id}?domain_name=${domain_name}`}
          organizationId={organization_id}
          placeholder="Select policy..."
          isDisabled={isForwardingDisabled}
        />

        <DistributionPolicyInfiniteSelectionField
          name="distribution_policy_id"
          label="Distribution Policy"
          control={control}
          errors={errors}
          url={`/policy/distribution/list/${organization_id}?domain_name=${domain_name}`}
          organizationId={organization_id}
          placeholder="Select policy..."
          isDisabled={isDistributionDisabled}
        />
      </div>
    </div>
  )
}

export default MailPolicies