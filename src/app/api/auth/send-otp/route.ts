import { NextRequest, NextResponse } from "next/server";
import { sendOTPEmail, isEmailConfigured } from "@/lib/email";
import crypto from "crypto";

// In-memory OTP store (works for single-instance Vercel deployments)
// Key: username, Value: { code, expiresAt, attempts }
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Rate limit: track last OTP send time per username
const rateLimitStore = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Rate limit: 1 OTP per 30 seconds
    const lastSent = rateLimitStore.get(username) || 0;
    const now = Date.now();
    if (now - lastSent < 30_000) {
      const waitSec = Math.ceil((30_000 - (now - lastSent)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec} seconds before requesting another code` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Store OTP (expires in 5 minutes, max 3 attempts)
    otpStore.set(username, {
      code,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0,
    });
    rateLimitStore.set(username, now);

    // Send email — distinguish "not configured" from "send failed" so the
    // cause is obvious in the logs instead of one generic message.
    if (!isEmailConfigured()) {
      console.error(
        "[send-otp] SMTP is NOT configured — set SMTP_USER and SMTP_PASS (Gmail App Password) in the environment."
      );
      return NextResponse.json(
        { error: "Email service isn't configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    const sent = await sendOTPEmail(code);
    if (!sent) {
      console.error(
        "[send-otp] SMTP is configured but the send FAILED — the Gmail App Password in SMTP_PASS is likely revoked or invalid (a Google account password change revokes App Passwords). Generate a new App Password and update SMTP_PASS, then redeploy."
      );
      return NextResponse.json(
        { error: "Couldn't send the verification code right now. Please try again or contact the administrator." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Verification code sent to office email" });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// Export for use by verify-otp
export { otpStore };
