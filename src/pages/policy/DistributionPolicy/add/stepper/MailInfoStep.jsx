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

import { SelectField } from '@/components/common/Inputs';
import { ListEditorEmail } from '@/pages/mailbox/add/ListEditors';
import { MailboxMultiSelectField } from '@/components/common/MailboxMultiSelectField';
import React from 'react'
import { ruleList } from './PolicyInfoStep';


function MailInfoStep({
    watch,
    domain_name,
    specificEmails,
    setSpecificEmails,
    internalList,
    setInternalList,
    externalList,
    setExternalList,
    register,
    errors,
}) {
    const ruleTypeValue = watch("rule_type");
    return (
        <div>
            {/* Specific Emails Section */}
            {ruleTypeValue === "SPECIFIC_EMAILS" && (
                <div className="space-y-8">
                    <div className="text-left">
                        <h3 className="text-foreground text-lg font-semibold">
                            Specific Email Addresses
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Define specific email addresses for this rule
                        </p>
                    </div>

                    <ListEditorEmail
                        placeholder="Enter email address (e.g., user@example.com)"
                        label="Email Addresses"
                        list={specificEmails}
                        setList={setSpecificEmails}
                        type="email"
                    />
                </div>
            )}

            <div className="space-y-8">
                <div className="text-left">
                    <h3 className="text-foreground text-lg font-semibold">
                        Group Members
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Add internal and external members to this distribution group
                    </p>
                </div>

                <SelectField
                    label="Rule Type"
                    name="rule_type"
                    register={register}
                    errors={errors}
                    options={ruleList}
                    isRequired
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <MailboxMultiSelectField
                        label="Internal Members"
                        domainName={domain_name}
                        value={internalList}
                        onChange={setInternalList}
                        placeholder="Select a mailbox or type an email..."
                    />
                    <ListEditorEmail
                        placeholder="user@externaldomain.com"
                        label="External Members"
                        list={externalList}
                        setList={setExternalList}
                        type="email"
                    />
                </div>
            </div>
        </div>
    )
}

export default MailInfoStep;