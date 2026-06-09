import { NextResponse } from "next/server";

// Add paths that should NOT be protected
const publicPaths = ["/auth/sign-in", "/auth/register", "/api/auth"];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
        const authCookie = request.cookies.get("spreadbook_auth");

        if (!authCookie) {
            const signInUrl = new URL("/auth/sign-in", request.url);
            signInUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(signInUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
