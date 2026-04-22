import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TourJoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 10) return notFound();

  const { data, error } = await supabase
    .from("tour_bookings")
    .select("meet_link, is_virtual, join_token_expires_at, join_token_used_at, status, first_name, email")
    .eq("join_token", token)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return <TourJoinError reason="invalid" />;
  }

  if (!data.is_virtual || !data.meet_link) {
    return <TourJoinError reason="not_virtual" />;
  }

  if (data.status === "cancelled") {
    return <TourJoinError reason="cancelled" />;
  }

  if (data.join_token_expires_at && new Date(data.join_token_expires_at) < new Date()) {
    return <TourJoinError reason="expired" />;
  }

  // Mark token as used (first-use timestamp, not single-use — guest may refresh)
  if (!data.join_token_used_at) {
    await supabase
      .from("tour_bookings")
      .update({ join_token_used_at: new Date().toISOString() })
      .eq("join_token", token);
  }

  redirect(data.meet_link);
}

function TourJoinError({ reason }: { reason: "invalid" | "expired" | "cancelled" | "not_virtual" }) {
  const messages: Record<string, { title: string; body: string }> = {
    invalid: {
      title: "Invalid link",
      body: "This tour link isn't valid. Please check your confirmation email for the correct link, or call (615) 200-0620.",
    },
    expired: {
      title: "Link expired",
      body: "This tour link has expired. Please contact us at (615) 200-0620 to reschedule.",
    },
    cancelled: {
      title: "Tour cancelled",
      body: "This tour has been cancelled. Contact us at (615) 200-0620 if you'd like to book another.",
    },
    not_virtual: {
      title: "In-person tour",
      body: "This booking is an in-person tour. Please visit us at 1023 Old Lascassas Rd, Murfreesboro, TN 37130.",
    },
  };
  const m = messages[reason];
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-ambient" />
      <div className="glass p-10 text-center max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{m.title}</h1>
        <p className="text-gray-600 text-sm mb-6">{m.body}</p>
        <a href="tel:+16152000620" className="btn-outline text-sm inline-block">Call (615) 200-0620</a>
      </div>
    </div>
  );
}
