import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/server/auth/jwt";

async function middlewareAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return false;
  try {
    await verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.some((p) => pathname === p);

  if (isPublic) return NextResponse.next();

  const authOk = await middlewareAuth(request);

  if (!authOk && pathname !== "/login") {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
  }

  if (authOk && pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/staff", request.url));
  }

  if (authOk && pathname.startsWith("/admin") && !pathname.startsWith("/admin/staff")) {
    return NextResponse.redirect(new URL("/admin/staff", request.url));
  }

  if (!authOk && pathname === "/portal") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
