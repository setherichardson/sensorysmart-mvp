import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/onboarding/assessment', '/onboarding/results']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Public routes that should redirect to dashboard if already authenticated
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Allow access to onboarding page without auth (for initial signup)
  const isOnboardingSignup = pathname === '/onboarding'

  if (isProtectedRoute && !user) {
    // Redirect to login if trying to access protected route without auth
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (isPublicRoute && user) {
    // Redirect to dashboard if already authenticated and trying to access public auth pages
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/today'
    return NextResponse.redirect(url)
  }

  // Special handling for root path
  if (pathname === '/' && user) {
    // Check if user has completed onboarding
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profile) {
        // User has profile, redirect to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/today'
        return NextResponse.redirect(url)
      } else {
        // User authenticated but no profile, redirect to onboarding
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Error checking profile, let them through to landing page
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 