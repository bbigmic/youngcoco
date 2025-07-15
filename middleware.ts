import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/admin", "/api/orders", "/api/stats"];
const excludedPaths = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sprawdź czy ścieżka wymaga autoryzacji
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // Sprawdź czy ścieżka nie jest wykluczona
    if (excludedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    
    const adminAuth = request.cookies.get("admin_auth")?.value;
    if (adminAuth !== "1") {
      // Jeśli API, zwróć 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Jeśli panel, przekieruj na stronę logowania
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

// Określ ścieżki, na których działa middleware
export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/orders/:path*", "/api/stats"],
}; 