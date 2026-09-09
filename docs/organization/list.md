# 2. Organizations

An organization is a company using your mail service. It could be your own company, or, if you provide the service to others, one of your customers.

Where to find it: click Organizations in the left menu.

## 2.1 The Organizations List

This page shows every organization you manage.

![The Organizations list.](../images/org-list.png)

*The Organizations list.*

Here's what each column tells you:

| Field | What it means |
| --- | --- |
| Organization Name | The name of the company. Click it to open and see full details. |
| Status | Shows if the organization is Active (working normally) or turned off. |
| Services | Small icons show which services this organization can use — Mail, Chat and Files. A greyed-out icon means that service is off for them. |
| Storage | The bar shows how much storage space has been used out of the total given to them. Blue or green means plenty of room left, orange or red means it's getting full or almost full. |
| Identities | How many identities have been created, out of how many are allowed. An identity is the core account — a mailbox is simply added on top of an identity, not a separate entry of its own. The ∞ symbol means there's no limit. |
| Date | When the organization was created or last updated. |

- Use + Add Organization (top right) to create a new one.
- Use Import to add many organizations at once from a file, instead of one by one.
## 2.2 The Actions Menu

Click the ⋮ (three dots) at the end of any organization's row to see what else you can do with it:

![The Actions menu on an organization's row.](../images/org-actions-menu.png)

*The Actions menu on an organization's row.*

| Field | What it means |
| --- | --- |
| Edit Organization | Change the organization's details, storage limit, services, or type. |
| Manage Space | Increase or decrease the storage (GB) allocated to this organization. |
| Manage Identities | Change how many identities this organization is allowed to create. Remember, a mailbox is added on top of an identity — it doesn't count as an identity of its own. |
| Rename Organization | Change just the organization's name. Use this instead of Edit Organization if the name is all you need to update, since the name normally cannot be changed there. |
| Deactivate | Turns the organization off, along with all its services (Email, Chat, File) and any sub-organizations under it. Its data is kept, but nothing under it can be used until you activate it again. |
| Delete Organization | Permanently removes the organization, along with all its services and any sub-organizations under it. This cannot be undone, so use it carefully. |

> **Note:** Deactivate and Delete Organization affect not just this organization, but every service and every sub-organization underneath it — double-check you have the right one selected before using them.

## 2.3 Adding Organizations in Bulk (Import)

If you need to create many organizations at once, use Import instead of adding them one by one.

![The Bulk Import Organizations window.](../images/org-import.png)

*The Bulk Import Organizations window.*

| Field | What it means |
| --- | --- |
| 1. Download Sample File | Click Download Sample Excel File first. This gives you a ready-made spreadsheet with the correct column names, so you know exactly what to fill in. |
| 2. Upload Your File | Fill in the sample file with your organizations' details, then click the upload box (or drag and drop your file) to upload it. CSV, XLSX and XLS files are all accepted. |
| Required Columns | Columns marked with a red dot are compulsory for every organization — for example Organization Name, Organization Type, Allocated Quota (GB), Parent Organization ID, and Branch Name. Scroll down inside this list to see all of them. |

> **Note:** Each row in your file becomes one new organization, created under the Parent Organization ID you specify. Every organization needs at least one branch and one contact, so make sure your file includes that information too.
