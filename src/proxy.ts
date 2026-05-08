import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from '@/lib/auth-utils';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5000/api/v1';
const isProduction = process.env.NODE_ENV === 'production';

function decodeTokenPayload(token: string): { role?: UserRole; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) return false;
    return Math.floor(Date.now() / 1000) + 5 >= payload.exp;
}

async function tryRefreshToken(refreshToken: string): Promise<string | null> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `refreshToken=${refreshToken}`,
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data?.accessToken ?? null;
    } catch {
        return null;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let accessToken = request.cookies.get('accessToken')?.value ?? null;
    const refreshToken = request.cookies.get('refreshToken')?.value ?? null;

    let userRole: UserRole | null = null;
    let freshAccessToken: string | null = null;

    if (accessToken && !isTokenExpired(accessToken)) {
        const payload = decodeTokenPayload(accessToken);
        userRole = payload?.role ?? null;
    }

    if (!userRole && refreshToken) {
        const newToken = await tryRefreshToken(refreshToken);
        if (newToken) {
            const payload = decodeTokenPayload(newToken);
            if (payload?.role) {
                userRole = payload.role as UserRole;
                freshAccessToken = newToken;
                accessToken = newToken;
            }
        }
    }

    const routeOwner = getRouteOwner(pathname);
    const isAuth = isAuthRoute(pathname);

    let response: NextResponse;

    if (isAuth && userRole) {
        response = NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url),
        );
    } else if (routeOwner === null) {
        response = NextResponse.next();
    } else if (!userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        response = NextResponse.redirect(loginUrl);
    } else if (routeOwner === 'COMMON') {
        response = NextResponse.next();
    } else if (routeOwner !== userRole) {
        response = NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url),
        );
    } else {
        response = NextResponse.next();
    }

    if (freshAccessToken) {
        response.cookies.set('accessToken', freshAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 60 * 60,
            path: '/',
        });
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};
