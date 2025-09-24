import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for a protected platform route
  if (request.nextUrl.pathname.startsWith('/platform')) {
    // Let the request continue to the client-side auth guard
    // The AuthGuard component will handle the authentication check
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/platform/:path*']
} 