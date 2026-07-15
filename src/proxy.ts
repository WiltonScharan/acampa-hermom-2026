import { NextRequest, NextResponse } from "next/server";

const TOKEN = "acampa2026_v2";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/autorizacao/assinar/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("acampa_auth");
  if (!cookie || cookie.value !== TOKEN) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|hermom\\.png).*)"],
};
