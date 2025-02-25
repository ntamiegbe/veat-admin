import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/restaurants',
    '/admin/menu-items',
    '/admin/orders',
    '/admin/users',
    '/admin/riders',
    '/admin/locations'
]

// Routes that are accessible only when NOT authenticated
const authRoutes = ['/login', '/register']

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    const pathname = req.nextUrl.pathname

    // Check if the route is protected and user is not authenticated
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname === route)

    if (isProtectedRoute && !session) {
        // Redirect to login if trying to access protected route while not authenticated
        const redirectUrl = new URL('/login', req.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && session) {
        // Redirect to dashboard if trying to access auth routes while already authenticated
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        // Match all protected routes
        '/admin/:path*',
        // Match auth routes
        '/login',
        '/register'
    ]
}