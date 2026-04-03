import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Redirect authenticated users from / to /dashboard
    if (req.nextUrl.pathname === '/' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to login page and API auth routes
        const { pathname } = req.nextUrl;
        if (pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }
        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
