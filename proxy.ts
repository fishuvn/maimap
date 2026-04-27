import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('maimap_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
    const session = await verifyToken(token);
    if (!session || (session.role !== 'moderator' && session.role !== 'admin')) {
      return NextResponse.redirect(new URL('/?error=forbidden', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
