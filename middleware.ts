import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If trying to access login page while logged in
    if (session && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // If trying to access protected routes while logged out
    if (!session && request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return res
}

// Specify which routes middleware will run on
export const config = {
    matcher: ['/', '/login', '/admin/:path*', '/dashboard/:path*']
}