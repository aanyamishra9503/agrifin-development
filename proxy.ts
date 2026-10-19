
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/',
    '/crops/:path*',
    '/expenses/:path*',
    '/sales/:path*',
    '/payments/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
}
