import { NextRequest, NextResponse } from "next/server";

const COOKIE = "acampa_auth";
const TOKEN  = "ok_hermom2026";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — sem proteção
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/autorizacao/assinar/")
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE);
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
