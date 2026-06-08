import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
  const isDashboardPage = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/drifts') || 
    request.nextUrl.pathname.startsWith('/services') || 
    request.nextUrl.pathname.startsWith('/sdk') || 
    request.nextUrl.pathname.startsWith('/settings')

  // If user is NOT logged in and trying to access dashboard
  if (!session && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user IS logged in and trying to access auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }



  return response
}

export const config = {
  matcher: ['/', '/login', '/signup', '/drifts', '/services', '/settings'],
}
