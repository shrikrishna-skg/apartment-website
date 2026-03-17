import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "staff_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set pathname header so the root layout can detect staff portal routes
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Only protect /website-app/dashboard/* routes
  // The login page at /website-app itself is public
  if (!pathname.startsWith("/website-app/dashboard")) {
    return response;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = getSecret();

  if (!token || !secret) {
    const loginUrl = new URL("/website-app", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, secret);
    return response;
  } catch {
    const loginUrl = new URL("/website-app", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("expired", "1");
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return redirect;
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and API
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
