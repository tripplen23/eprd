import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';

const authPageRoutes = ['/auth'];
const apiAuthPrefix = '/api/auth';

export async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || 'REPLACE_THIS_WITH_A_SECURE_SECRET_IN_PRODUCTION',
    });
    const isLoggedIn = !!token;

    const path = nextUrl.pathname;
    const isApiAuthRoute = path.startsWith(apiAuthPrefix);

    const isProtectedRoute = path.startsWith('/dashboard');
    const isAuthPageRoute = authPageRoutes.includes(path);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isProtectedRoute && !isLoggedIn) {
        const authUrl = new URL('/auth', nextUrl.origin);
        authUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return NextResponse.redirect(authUrl);
    }

    if (isLoggedIn && isAuthPageRoute) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }

    return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|providers).*)'],
};