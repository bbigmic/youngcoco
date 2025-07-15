import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const adminAuth = request.headers.get("cookie")?.includes("admin_auth=1");
  
  if (adminAuth) {
    return NextResponse.json({ authenticated: true });
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
} 