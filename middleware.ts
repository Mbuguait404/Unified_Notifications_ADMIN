import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check for the admin_session cookie
    const session = request.cookies.get('admin_session')
    const { pathname } = request.nextUrl

    // Define public paths that don't require authentication
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')

    // If the user has a session and is trying to access the login page, redirect to dashboard
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If the user doesn't have a session and is trying to access a protected route
    if (!session && !isPublicPath) {
        // Redirect to login page
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
