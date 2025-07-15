import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Brak hasła w konfiguracji" }, { status: 500 });
  }

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 godzin
    });
    return response;
  } else {
    return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
  }
} 