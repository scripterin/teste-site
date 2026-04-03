import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Dacă utilizatorul e deja logat și încearcă să acceseze pagina de login (/),
    // îl trimitem direct la dashboard.
    if (pathname === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Pagina de login și rutele de auth sunt mereu accesibile
        if (pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }

        // Restul paginilor (dashboard, teste) cer token obligatoriu
        return !!token;
      },
    },
  }
);

export const config = {
  // Protejăm tot, mai puțin fișierele statice de sistem
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};