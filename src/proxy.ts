import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "brightloop-default-super-secret-jwt-key-32";
  return new TextEncoder().encode(secret);
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

async function getAuthPayload(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = await getAuthPayload(request);

  if (pathname === "/login" || pathname === "/signup") {
    if (payload) {
      if (payload.role === "ADMIN" || payload.role === "STAFF") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!payload) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
    }
    if (payload.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/portal")) {
    if (!payload) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/login",
    "/signup",
  ],
};

