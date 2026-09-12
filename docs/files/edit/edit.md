### Edit File User (Manage Quota)

There's no separate Edit File User page — the only thing you can change for an existing file user is their storage quota. Click ⋮ → Manage Quota on their row in the [File Users list](../list/list.md) to open the File User Quota Allocation window.

| Field                                    | What it means                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Organization → Available                 | How much storage your organization has free to give out, on top of what's already allocated to this user. |
| Current User → Allocated / In Use / Free | This identity's current quota, how much of it is actually used, and what's left over.                     |
| New Allocation                           | The new quota to set, in GB — type a number or drag the slider.                                           |

> **Note:** You can't set the new allocation below what's already in use, or above your organization's available space plus this user's current allocation. The window shows both limits (Min/Max) and blocks Update Allocation until the value is within range.

Click Update Allocation to save, or Cancel to close without changing anything.
