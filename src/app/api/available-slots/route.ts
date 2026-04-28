import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  getBusyPeriods,
  generateAllSlots,
  isSlotBusy,
  timeToMinutes,
} from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Missing required query parameter: date (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Fetch busy periods from Google Calendar AND Supabase bookings in parallel
    const [calendarBusy, supabaseResult] = await Promise.all([
      getBusyPeriods(date),
      supabase
        .from("tour_bookings")
        .select("tour_time")
        .eq("tour_date", date)
        .neq("status", "cancelled"),
    ]);

    if (supabaseResult.error) {
      return NextResponse.json(
        { error: supabaseResult.error.message },
        { status: 400 }
      );
    }

    // Build a set of booked time strings from Supabase
    const supabaseBookedTimes = new Set(
      (supabaseResult.data || []).map((b) => b.tour_time)
    );

    // Generate all 10-minute slots and filter out busy ones
    const allSlots = generateAllSlots();
    const availableSlots = allSlots.filter((slot) => {
      // Check if booked in Supabase
      if (supabaseBookedTimes.has(slot)) return false;
      // Check if overlaps with any Google Calendar event
      const slotMin = timeToMinutes(slot);
      if (isSlotBusy(slotMin, calendarBusy)) return false;
      return true;
    });

    // Also filter out past slots if the date is today (in Central Time, since tour slots run in CT).
    // Comparing against UTC today would incorrectly treat the next-day-CT as "today" after ~6 PM CT.
    const now = new Date();
    const centralTodayParts = now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    // en-CA returns yyyy-mm-dd directly, matching the `date` query param format.
    let finalSlots = availableSlots;

    if (date === centralTodayParts) {
      const centralNow = new Date(
        now.toLocaleString("en-US", { timeZone: "America/Chicago" })
      );
      const currentMinutes = centralNow.getHours() * 60 + centralNow.getMinutes();
      // Only show slots that start at least 10 minutes from now
      finalSlots = availableSlots.filter(
        (slot) => timeToMinutes(slot) > currentMinutes + 10
      );
    }

    return NextResponse.json({
      date,
      availableSlots: finalSlots,
      totalSlots: allSlots.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
