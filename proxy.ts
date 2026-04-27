import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'maimap-super-secret-key-2024-change-in-production'
);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('maimap_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      const role = (payload as any).role;
      if (role !== 'moderator' && role !== 'admin') {
        return NextResponse.redirect(new URL('/?error=forbidden', req.url));
      }
    } catch {
      // Token invalid or expired — clear cookie and redirect to login
      const res = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url));
      res.cookies.delete('maimap_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
