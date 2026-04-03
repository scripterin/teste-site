import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Pagina unde e cardul de login
  },
});

export const config = { 
  // Protejăm doar dashboard-ul și rutele interne. 
  // NU protejăm "/" sau "/api/auth" aici pentru a evita buclele.
  matcher: ["/dashboard/:path*", "/test/:path*"] 
};