# 7. Files

The Files menu controls which identities can store and share files, and the file storage rules for your whole organization. It has two screens: File Users and File Service Preference.

Where to find it: click Files in the left menu, then File Users or File Service Preference.

## 7.1 File Users

This page lists every identity that currently has file storage enabled, for the domain selected at the top right.

![The File Users list.](../images/file-users-list.png)

*The File Users list.*

| Field | What it means |
| --- | --- |
| Email | The identity's email address. |
| Status | Active or turned off. |
| Storage | How much space this identity has used out of its file storage quota, shown as a bar, a percentage, and the exact amounts (e.g. "0.00 GB / 1.00 GB"). |
| Last Active At | When this identity last used file storage. |

### The Row Actions Menu

Click the ⋮ (three dots) at the end of any file user's row:

![The row actions menu on a file user.](../images/file-users-row-menu.png)

*The row actions menu on a file user.*

| Field | What it means |
| --- | --- |
| Manage Quota | Increase or decrease the file storage space (GB) allocated to this identity. |
| Deactivate | Turns file storage off for this identity. It's kept, but they can't access their files until you activate it again. |
| Delete File User | Removes this identity from File Users entirely. This cannot be undone, so use it carefully. |

### Adding a File User

Click + Add File User (top right):

![The Add File User window.](../images/file-add-user-modal.png)

*The Add File User window.*

| Field | What it means |
| --- | --- |
| Select Identity for File Access | Pick an existing identity from the dropdown. Only identities that don't already have file storage enabled are shown. |
| Quota Allocated (GB) | How much storage space this identity gets, out of your organization's remaining available storage (shown just below the box). |
| Enable user immediately | Ticked by default — the identity can use file storage as soon as you click Add File User. Untick it to set the identity up now but turn it on later. |
