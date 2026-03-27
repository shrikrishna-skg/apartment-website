/**
 * Google Calendar integration for tour scheduling.
 *
 * Uses dynamic import of googleapis to avoid slowing down dev server compilation.
 * Gracefully falls back to Supabase-only if credentials are not configured.
 * Calendar: collegeplacecpl@gmail.com (College Place Apartments)
 */

function isConfigured() {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || "office@collegeplace.us";
}

async function getGoogleCalendar() {
  const { google } = await import("googleapis");
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

/** Create a 10-minute Google Calendar event for a tour booking */
export async function createTourEvent(params: {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertySlug?: string;
  floorPlan?: string;
}): Promise<string | null> {
  if (!isConfigured()) return null;

  const { hour, minute } = parseTime(params.time);
  const startDate = new Date(`${params.date}T00:00:00`);
  startDate.setHours(hour, minute, 0, 0);
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 10);

  const propertyName = params.propertySlug
    ? params.propertySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Property Tour";

  try {
    const calendar = await getGoogleCalendar();
    const res = await calendar.events.insert({
      calendarId: getCalendarId(),
      requestBody: {
        summary: `Tour: ${params.firstName} ${params.lastName} - ${propertyName}`,
        description: [
          `Name: ${params.firstName} ${params.lastName}`,
          `Email: ${params.email}`,
          `Phone: ${params.phone}`,
          params.propertySlug ? `Property: ${propertyName}` : "",
          params.floorPlan ? `Floor Plan: ${params.floorPlan}` : "",
        ].filter(Boolean).join("\n"),
        start: { dateTime: startDate.toISOString(), timeZone: "America/Chicago" },
        end: { dateTime: endDate.toISOString(), timeZone: "America/Chicago" },
        attendees: [{ email: params.email }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email" as const, minutes: 60 },
            { method: "popup" as const, minutes: 10 },
          ],
        },
      },
      sendUpdates: "all",
    });
    return res.data.id || null;
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return null;
  }
}

/** A busy period on the calendar (start/end as minutes since midnight) */
export interface BusyPeriod {
  startMin: number; // minutes since midnight
  endMin: number;   // minutes since midnight
}

/**
 * Fetch all busy periods from Google Calendar for a given date.
 * Returns array of { startMin, endMin } representing occupied time ranges.
 * Falls back to empty array if Google Calendar is not configured.
 */
export async function getBusyPeriods(date: string): Promise<BusyPeriod[]> {
  if (!isConfigured()) return [];

  // Use Central Time offset (CST = -6, CDT = -5)
  // We'll use a broad window and let Google handle timezone
  const timeMin = `${date}T00:00:00-06:00`;
  const timeMax = `${date}T23:59:59-06:00`;

  try {
    const calendar = await getGoogleCalendar();
    const res = await calendar.events.list({
      calendarId: getCalendarId(),
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const periods: BusyPeriod[] = [];
    for (const event of res.data.items || []) {
      // Skip all-day events (they have date, not dateTime)
      if (!event.start?.dateTime || !event.end?.dateTime) continue;
      // Skip cancelled events
      if (event.status === "cancelled") continue;

      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);

      const startMin = start.getHours() * 60 + start.getMinutes();
      const endMin = end.getHours() * 60 + end.getMinutes();

      periods.push({ startMin, endMin });
    }

    return periods;
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    return [];
  }
}

/** Parse "9:00 AM" / "1:30 PM" into 24-hour { hour, minute } */
function parseTime(timeStr: string): { hour: number; minute: number } {
  const [timePart, meridiem] = timeStr.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return { hour, minute: parseInt(minuteStr) };
}

/** Format minutes since midnight to "9:00 AM" style */
export function formatSlotTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const meridiem = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${meridiem}`;
}

/**
 * Generate all possible 10-minute tour slots for the day.
 * Office hours: 9:00 AM – 4:50 PM (last slot starts at 4:50, ends at 5:00)
 * Lunch break: 12:00 PM – 1:00 PM (no slots)
 */
export function generateAllSlots(): string[] {
  const slots: string[] = [];
  // Morning: 9:00 AM (540 min) to 11:50 AM (710 min)
  for (let m = 540; m <= 710; m += 10) {
    slots.push(formatSlotTime(m));
  }
  // Afternoon: 1:00 PM (780 min) to 4:50 PM (1010 min)
  for (let m = 780; m <= 1010; m += 10) {
    slots.push(formatSlotTime(m));
  }
  return slots;
}

/** Check if a slot (given as minutes since midnight) overlaps with any busy period */
export function isSlotBusy(slotStartMin: number, busyPeriods: BusyPeriod[]): boolean {
  const slotEndMin = slotStartMin + 10;
  for (const period of busyPeriods) {
    // Overlap: slot starts before period ends AND slot ends after period starts
    if (slotStartMin < period.endMin && slotEndMin > period.startMin) {
      return true;
    }
  }
  return false;
}

/** Parse a time string back to minutes since midnight */
export function timeToMinutes(timeStr: string): number {
  const { hour, minute } = parseTime(timeStr);
  return hour * 60 + minute;
}
