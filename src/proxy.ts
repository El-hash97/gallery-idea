import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/admin", "/spike"];

export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has("gallery_session");

  for (const path of PROTECTED) {
    if (request.nextUrl.pathname.startsWith(path)) {
      if (!hasCookie) {
        const url = new URL("/login", request.url);
        url.searchParams.set("next", request.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/spike/:path*"],
};
