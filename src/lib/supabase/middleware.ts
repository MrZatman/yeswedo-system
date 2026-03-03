import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/clients') ||
                           request.nextUrl.pathname.startsWith('/appointments') ||
                           request.nextUrl.pathname.startsWith('/memberships') ||
                           request.nextUrl.pathname.startsWith('/clock') ||
                           request.nextUrl.pathname.startsWith('/users') ||
                           request.nextUrl.pathname.startsWith('/services') ||
                           request.nextUrl.pathname.startsWith('/products') ||
                           request.nextUrl.pathname.startsWith('/reports') ||
                           request.nextUrl.pathname.startsWith('/settings') ||
                           request.nextUrl.pathname === '/'

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
