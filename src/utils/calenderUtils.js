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

import { format, parseISO } from "date-fns";

/**
 * Generate ICS (iCalendar) format string for a single event
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */
export const generateICSEvent = (alert) => {
  try {
    const startTime = parseISO(alert.start_time);
    const endTime = parseISO(alert.end_time);

    // Format dates in UTC format: YYYYMMDDTHHMMSSZ
    const formatICSDate = (date) => {
      return format(date, "yyyyMMdd'T'HHmmss'Z'");
    };

    const uid = `alert-${alert.id || Date.now()}@maintenance-status`;
    const dtstamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//System Maintenance//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:System Maintenance
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${escapeSummary(alert.title)}
DESCRIPTION:${escapeDescription(alert.description)}
LOCATION:System
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  } catch (error) {
    console.error("Error generating ICS event:", error);
    return null;
  }
};

/**
 * Generate ICS file with multiple events
 */
export const generateICSCalendar = (alerts) => {
  try {
    const dtstamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
    const calendarId = `system-maintenance-${Date.now()}@maintenance-status`;

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//System Maintenance//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:System Maintenance Alerts
X-WR-TIMEZONE:UTC
`;

    alerts.forEach((alert) => {
      try {
        const startTime = parseISO(alert.start_time);
        const endTime = parseISO(alert.end_time);

        const formatICSDate = (date) => {
          return format(date, "yyyyMMdd'T'HHmmss'Z'");
        };

        const uid = `alert-${alert.id || alert.title}-${Date.now()}@maintenance-status`;

        icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${formatICSDate(startTime)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${escapeSummary(alert.title)}
DESCRIPTION:${escapeDescription(alert.description)}
CATEGORIES:${alert.severity}
LOCATION:System - ${alert.type}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
      } catch (error) {
        console.error("Error processing alert:", error);
      }
    });

    icsContent += `END:VCALENDAR`;
    return icsContent;
  } catch (error) {
    console.error("Error generating ICS calendar:", error);
    return null;
  }
};

/**
 * Escape special characters for ICS format
 */
const escapeSummary = (text) => {
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
};

const escapeDescription = (text) => {
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
};

/**
 * Download ICS file to user's device
 */
export const downloadICS = (
  icsContent,
  filename = "maintenance-alerts.ics",
) => {
  const element = document.createElement("a");
  const file = new Blob([icsContent], { type: "text/calendar" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
};

/**
 * Get Google Calendar URL for single event
 * Google Calendar expects dates in format: 20190604T080000/20190604T170000 (local time, no Z)
 */
export const getGoogleCalendarUrl = (alert) => {
  try {
    const startTime = parseISO(alert.start_time);
    const endTime = parseISO(alert.end_time);

    const formatGoogleDate = (date) => {
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: alert.title,
      details: alert.description,
      location: "System",
      dates: `${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}`,
    });

    return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
  } catch (error) {
    console.error("Error generating Google Calendar URL:", error);
    return null;
  }
};

/**
 * Get Outlook Calendar URL for single event
 */
export const getOutlookCalendarUrl = (alert) => {
  try {
    const startTime = parseISO(alert.start_time);
    const endTime = parseISO(alert.end_time);

    const formatOutlookDate = (date) => {
      return format(date, "yyyyMMdd") + "T" + format(date, "HHmmss");
    };

    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      startdt: formatOutlookDate(startTime),
      enddt: formatOutlookDate(endTime),
      subject: alert.title,
      body: alert.description,
      location: "System",
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  } catch (error) {
    console.error("Error generating Outlook Calendar URL:", error);
    return null;
  }
};
