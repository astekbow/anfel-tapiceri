import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session-config";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const loggedIn = Boolean(session.adminId);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!loggedIn) {
      return NextResponse.json({ error: "I paautorizuar" }, { status: 401 });
    }
    return res;
  }

  if (pathname === "/admin/login") {
    if (loggedIn) return NextResponse.redirect(new URL("/admin", req.url));
    return res;
  }

  if (!loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
