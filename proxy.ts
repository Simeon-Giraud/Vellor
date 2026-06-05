import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const DEV_AUTH_COOKIE = 'vellor_dev_auth'
const DEV_PASSWORD = process.env.DEV_PASSWORD || 'vellor2024'

// Paths that bypass the password gate
const DEV_PUBLIC_PATHS = ['/dev-login', '/api/dev-auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Dev password gate ---
  const isPublic = DEV_PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (!isPublic) {
    const authCookie = request.cookies.get(DEV_AUTH_COOKIE)
    if (authCookie?.value !== DEV_PASSWORD) {
      const loginUrl = new URL('/dev-login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // --- Normal Supabase session handling ---
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

