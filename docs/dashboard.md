# 1. Dashboard

The Dashboard is the first screen you see after you sign in. It gives you a quick summary of your mail service, and its header bar at the very top stays visible on every screen in the panel — not just the Dashboard — so this chapter also covers everything in that header bar.

## 1.1 The Header Bar

This bar runs across the top of every screen. From left to right, it gives you the following:

![The header bar at the top of the screen.](images/header-bar.png)

_The header bar at the top of the screen._

| Field                     | What it means                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization switcher     | Shows the organization you are currently working in (for example "Neko Nik"). Click it to switch to a different organization, if your account has access to more than one.                               |
| Search navigation         | The search box in the middle. Type here to jump straight to a page or setting by name, instead of hunting through the left-hand menu. You can also press Ctrl and K on your keyboard to open it quickly. |
| Session timer             | Shows how much time is left (for example "1h 8m left") before you are automatically signed out for security. Simply keep using the panel and this timer will keep renewing.                              |
| Theme switcher            | Opens the Theme Customizer, where you can change how the panel looks. Covered in detail in section 1.2 below.                                                                                            |
| Notifications (bell icon) | Shows real-time alerts — for example, when a background job finishes or something needs your attention. New notifications appear here as soon as they happen.                                            |
| Help                      | Opens help guidance for the screen you're currently on, along with a built-in AI chat assistant you can ask questions about how to use the panel.                                                        |
| Profile menu              | Shows your account picture or initials. Click it to edit your profile, change your password, manage two-factor authentication, or sign out.                                                              |

## 1.2 The Theme Customizer

Click the theme icon in the header to open the Theme Customizer. It lets you change how the panel looks.

![The Theme Customizer.](images/theme-customizer.png)

_The Theme Customizer._

| Field         | What it means                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Theme Mode    | Switch between Light Mode and Dark Mode.                                                                         |
| Primary Color | Pick one of the ready-made colors. This becomes the main color used for buttons and highlights across the panel. |
| Custom Color  | Click Use Hex Code if you want to enter your own exact color instead of picking one of the ready-made ones.      |
| Color Palette | Choose a full palette (a matching set of colors) instead of just one color.                                      |
| Current       | Shows the color that is applied right now.                                                                       |

Your choice is saved automatically and stays the same the next time you sign in.

## 1.3 Top of the Dashboard

![The top of the Dashboard.](images/dashboard-01-top.png)

_The top of the Dashboard._

The 4 boxes at the top give you a quick count of everything in your organization:

| Field              | What it means                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| Organization Space | Total storage space you have, and how much of it is already used.          |
| Total Domains      | How many domains you have, and how many of them are active.                |
| Total Mailboxes    | How many mailboxes exist, and how many are active vs. inactive.            |
| Total Users        | How many admin panel users (people who can log in to this panel) you have. |

Below that, System Health shows whether everything is running fine. Each item (Database, Message Queue, Cache System, API Services, Notifications, Metrics Database, Logging Database, Telemetry Status) should show OK. If everything is fine, you'll see "All Systems Operational" in green at the top right of this box.

Further down, there are two boxes side by side:

| Field                    | What it means                                                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization Space Usage | A pie chart showing how much of your total storage is Used (blue) and how much is still Available (green).                                                                                |
| Mailbox Space Details    | A list of your domains, showing how much storage each one is using and how many mailboxes (Total / Active / Inactive) and emails it has. Scroll down inside this box to see more domains. |

## 1.4 Further Down the Dashboard

![More charts further down the Dashboard.](images/dashboard-02-bottom.png)

_More charts further down the Dashboard._

Scroll down to see 4 more charts:

| Field               | What it means                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Mailbox Space Usage | The total space used added up across every mailbox in your organization, combining all domains together — not a per-domain breakdown.      |
| Logins Per Domain   | A bar chart showing which domains had the most logins recently.                                                                            |
| Top User Logins     | A bar chart showing which mailboxes (email addresses) logged in the most. This is based on the last few days, shown at the top of the box. |
| Top IP Logins       | A bar chart showing which IP addresses (login locations) were used the most to log in. This helps you spot unusual login activity.         |

> **Note:** Some boxes show a small time period at the top right (like "Last 15 days" or "Last 30 days"). This tells you the chart only covers that recent period, not all-time data.
