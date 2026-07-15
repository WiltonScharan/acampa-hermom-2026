import { NextRequest, NextResponse } from "next/server";

const PIN   = "wDj@180115";
const TOKEN = "acampa_v5_final";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    if (pin !== PIN) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("acampa_auth", TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
