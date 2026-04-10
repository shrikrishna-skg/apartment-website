import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, createSessionCookie } from "@/lib/auth";
import { sendLoginNotification } from "@/lib/email";
import { otpStore } from "../send-otp/route";

export async function POST(request: NextRequest) {
  try {
    const { username, otp } = await request.json();

    if (!username || !otp) {
      return NextResponse.json({ error: "Username and OTP are required" }, { status: 400 });
    }

    const stored = otpStore.get(username);

    if (!stored) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(username);
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Check attempts
    if (stored.attempts >= 3) {
      otpStore.delete(username);
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
    }

    // Verify code
    if (stored.code !== otp.trim()) {
      stored.attempts += 1;
      const remaining = 3 - stored.attempts;
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 401 }
      );
    }

    // OTP valid — clean up and create session
    otpStore.delete(username);

    const token = await createSessionToken(username);
    const cookie = createSessionCookie(token);

    // Capture IP and device info
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Send login notification email (best-effort, don't block login)
    sendLoginNotification({ username, ip, userAgent }).catch(() => {});

    const response = NextResponse.json(
      { success: true, username },
      { status: 200 }
    );
    response.cookies.set(cookie);
    return response;
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
