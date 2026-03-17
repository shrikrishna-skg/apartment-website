import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "staff_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/** Hash a password with the same salt used to generate STAFF_PASSWORD_HASH */
export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update("college-place-staff-" + password)
    .digest("hex");
}

/** Verify username and password against env vars */
export function verifyCredentials(username: string, password: string): boolean {
  const validUsername = process.env.STAFF_USERNAME;
  const validHash = process.env.STAFF_PASSWORD_HASH;

  if (!validUsername || !validHash) return false;

  const inputHash = hashPassword(password);

  // Constant-time comparison to prevent timing attacks
  const hashMatch =
    inputHash.length === validHash.length &&
    crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(validHash));

  const usernameMatch =
    username.length === validUsername.length &&
    crypto.timingSafeEqual(
      Buffer.from(username.toLowerCase()),
      Buffer.from(validUsername.toLowerCase())
    );

  return hashMatch && usernameMatch;
}

/** Create a signed JWT session token */
export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "staff" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

/** Verify a JWT session token */
export async function verifySessionToken(
  token: string
): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

/** Get current session from cookies (for use in API routes & server components) */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Set session cookie */
export function createSessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION,
  };
}

/** Clear session cookie */
export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
