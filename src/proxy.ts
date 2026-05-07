import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from '@/lib/auth-utils';

function decodeTokenPayload(token: string): { role?: UserRole; exp?: number } | null {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read cookies directly from the request — never call server actions or fetch in proxy
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const hasToken = !!(accessToken || refreshToken);

    let userRole: UserRole | null = null;
    if (accessToken) {
        const payload = decodeTokenPayload(accessToken);
        if (payload?.role) {
            userRole = payload.role;
        }
    }

    // Authenticated users should not see auth pages
    if (isAuthRoute(pathname) && hasToken && userRole) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url)
        );
    }

    const routeOwner = getRouteOwner(pathname);

    // Public route — allow
    if (routeOwner === null) {
        return NextResponse.next();
    }

    // Protected route — not logged in → redirect to login
    if (!hasToken || !userRole) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Common protected route (any authenticated user)
    if (routeOwner === "COMMON") {
        return NextResponse.next();
    }

    // Role-specific route — wrong role → redirect to own dashboard
    if (routeOwner !== userRole) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
}
