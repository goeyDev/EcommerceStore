import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session-id");

  // if user is not logged in, redirect them to /sign-in page
  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next(); // allow access
}

// when to use this middleware
export const config = {
  matcher: ["/admin/:path*", "/:path*"],
};
