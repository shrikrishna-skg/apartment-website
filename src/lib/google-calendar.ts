/**
 * Google Calendar integration for tour scheduling.
 *
 * Uses dynamic import of googleapis to avoid slowing down dev server compilation.
 * Gracefully falls back to Supabase-only if credentials are not configured.
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

  const [timePart, meridiem] = params.time.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const startDate = new Date(`${params.date}T00:00:00`);
  startDate.setHours(hour, parseInt(minuteStr), 0, 0);
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

export async function getBookedSlots(date: string): Promise<string[]> {
  if (!isConfigured()) return [];

  const timeMin = new Date(`${date}T00:00:00-06:00`);
  const timeMax = new Date(`${date}T23:59:59-06:00`);

  try {
    const calendar = await getGoogleCalendar();
    const res = await calendar.events.list({
      calendarId: getCalendarId(),
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const bookedSlots: string[] = [];
    for (const event of res.data.items || []) {
      if (event.start?.dateTime) {
        const eventDate = new Date(event.start.dateTime);
        const hours = eventDate.getHours();
        const minutes = eventDate.getMinutes();
        const m = hours >= 12 ? "PM" : "AM";
        const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        bookedSlots.push(`${displayHour}:${minutes.toString().padStart(2, "0")} ${m}`);
      }
    }
    return bookedSlots;
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    return [];
  }
}
