import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      applications,
      tours,
      inquiries,
      maintenance,
      referrals,
      subscribers,
    ] = await Promise.all([
      supabase.from("applications").select("id, status, applicant_type, created_at").is("deleted_at", null),
      supabase.from("tour_bookings").select("id, status, tour_date, tour_time, created_at").is("deleted_at", null),
      supabase.from("contact_inquiries").select("id, status, inquiry_type, created_at").is("deleted_at", null),
      supabase.from("maintenance_requests").select("id, status, urgency, created_at").is("deleted_at", null),
      supabase.from("referrals").select("id, status, created_at").is("deleted_at", null),
      supabase.from("email_subscribers").select("id, created_at"),
    ]);

    // Count helpers
    const count = (data: unknown[] | null) => data?.length || 0;
    const countByStatus = (data: { status: string }[] | null, status: string) =>
      data?.filter((r) => r.status === status).length || 0;

    // Recent items (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = (data: { created_at: string }[] | null) =>
      data?.filter((r) => new Date(r.created_at) >= weekAgo).length || 0;

    const stats = {
      applications: {
        total: count(applications.data),
        pending: countByStatus(applications.data as { status: string }[], "pending"),
        reviewing: countByStatus(applications.data as { status: string }[], "reviewing"),
        approved: countByStatus(applications.data as { status: string }[], "approved"),
        recent: recentCount(applications.data as { created_at: string }[]),
      },
      tours: {
        total: count(tours.data),
        confirmed: countByStatus(tours.data as { status: string }[], "confirmed"),
        completed: countByStatus(tours.data as { status: string }[], "completed"),
        cancelled: countByStatus(tours.data as { status: string }[], "cancelled"),
        recent: recentCount(tours.data as { created_at: string }[]),
      },
      inquiries: {
        total: count(inquiries.data),
        new: countByStatus(inquiries.data as { status: string }[], "new"),
        replied: countByStatus(inquiries.data as { status: string }[], "replied"),
        recent: recentCount(inquiries.data as { created_at: string }[]),
      },
      maintenance: {
        total: count(maintenance.data),
        open: countByStatus(maintenance.data as { status: string }[], "open"),
        in_progress: countByStatus(maintenance.data as { status: string }[], "in_progress"),
        resolved: countByStatus(maintenance.data as { status: string }[], "resolved"),
        recent: recentCount(maintenance.data as { created_at: string }[]),
      },
      referrals: {
        total: count(referrals.data),
        submitted: countByStatus(referrals.data as { status: string }[], "submitted"),
        leased: countByStatus(referrals.data as { status: string }[], "leased"),
        recent: recentCount(referrals.data as { created_at: string }[]),
      },
      subscribers: {
        total: count(subscribers.data),
        recent: recentCount(subscribers.data as { created_at: string }[]),
      },
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
