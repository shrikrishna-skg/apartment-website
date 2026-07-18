"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "done" | "error" | "notoken";

export default function UnsubscribePage() {
  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Read the token on the client so link prefetchers (which don't run JS or
      // POST) can't trigger an accidental unsubscribe.
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setStatus("notoken");
        return;
      }
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setEmail(data.email ?? null);
          setStatus("done");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Preferences</h1>

        {status === "loading" && (
          <p className="text-gray-600">Updating your preferences…</p>
        )}

        {status === "done" && (
          <>
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-700 leading-relaxed">
              You&apos;ve been unsubscribed{email ? <> — <strong>{email}</strong></> : ""}. You
              won&apos;t receive any more newsletter emails from College Place Apartments.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Changed your mind? You can resubscribe anytime from{" "}
              <a href="https://collegeplace.us" className="text-[#1a73e8] underline">
                collegeplace.us
              </a>
              .
            </p>
          </>
        )}

        {status === "error" && (
          <p className="text-gray-700">
            We couldn&apos;t process that unsubscribe link — it may be invalid or already used. If
            you keep receiving emails, contact us at{" "}
            <a href="mailto:office@collegeplace.us" className="text-[#1a73e8] underline">
              office@collegeplace.us
            </a>
            .
          </p>
        )}

        {status === "notoken" && (
          <p className="text-gray-700">
            This unsubscribe link is missing its token. Please use the link from your email, or
            email us at{" "}
            <a href="mailto:office@collegeplace.us" className="text-[#1a73e8] underline">
              office@collegeplace.us
            </a>{" "}
            to be removed.
          </p>
        )}
      </div>
    </div>
  );
}
