/**
 * Next.js Middleware for Portfolio Forge
 * 
 * This middleware handles:
 * - Supabase session refresh
 * - Authentication checks for protected routes
 * - Redirects for unauthenticated users
 * - Public route access
 * 
 * Protected routes:
 * - /dashboard/*
 * - /api/v1/* (except /api/v1/public/*)
 * 
 * Public routes:
 * - /p/* (public portfolios)
 * - /api/v1/public/*
 * - /login, /auth/*
 * - Static files and Next.js internals
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // This will automatically handle token refresh if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define route patterns
  const isPublicPortfolio = pathname.startsWith('/p/')
  const isPublicApi = pathname.startsWith('/api/v1/public/')
  const isAuthRoute = pathname.startsWith('/auth/') || pathname === '/login'
  const isDashboard = pathname.startsWith('/dashboard')
  const isProtectedApi = pathname.startsWith('/api/v1/') && !isPublicApi

  // Allow access to auth routes, public portfolios, and public APIs
  if (isAuthRoute || isPublicPortfolio || isPublicApi) {
    return response
  }

  // Redirect authenticated users away from login page
  if (user && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Protect dashboard routes
  if (isDashboard && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Protect API routes (except public ones)
  if (isProtectedApi && !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return response
}

/**
 * Configure which routes the middleware should run on
 * This matcher configuration:
 * - Excludes static files (_next/static, images, favicon, etc.)
 * - Excludes Next.js internals
 * - Includes all pages and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - files with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
