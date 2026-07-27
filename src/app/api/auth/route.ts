import { NextRequest, NextResponse } from "next/server";

const PIN_ADMIN  = "wDj@180115";
const PIN_VIEWER = "acampa#2026";
const TOKEN      = "acampa_v5_final";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    let role: "admin" | "viewer" | null = null;
    if (pin === PIN_ADMIN)  role = "admin";
    if (pin === PIN_VIEWER) role = "viewer";

    if (!role) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, role });
    res.cookies.set("acampa_auth", TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // sem maxAge = cookie de sessao (some ao fechar o browser)
    });
    res.cookies.set("acampa_role", role, {
      httpOnly: false, // precisa ser lido pelo cliente
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
