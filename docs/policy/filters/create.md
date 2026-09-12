### Adding a New Filters Policy

Click Add Single Policy. Unlike General Policies, this is a single page, not a multi-step wizard — fill it in and click Create Filters Policy at the bottom.

![The Filters Policy configuration page.](../images/policy-filters-config.png)

_The Filters Policy configuration page._

| Field                        | What it means                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Domain                       | The domain this policy belongs to — this is set to the domain you currently have selected and can't be changed here.   |
| Policy Name                  | A name for this policy, so you can recognize it in the list.                                                           |
| Active                       | Turned on by default — the policy applies as soon as you create it. Turn it off to set it up now and turn it on later. |
| Allowed List (White Entries) | Email addresses or domains that are always let through. Type one and click Add.                                        |
| Blocked List (Black Entries) | Email addresses or domains that are always denied. Type one and click Add.                                             |

> **Note:** At least one entry is required, in either the Allowed or the Blocked list. An entry also can't conflict with itself — for example you can't allow a whole domain while blocking one specific email address on that same domain, or the other way around.
