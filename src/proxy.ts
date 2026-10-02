import NextAuth from "next-auth";
import authConfig from "@/server/auth/auth.config";

// Instância leve (sem PrismaAdapter) para rodar no runtime Edge do proxy.
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register", "/invite"];
// Sempre acessível, independente de sessão — a página servida pelo service
// worker quando o dispositivo está offline (ver src/app/sw.ts).
const ALWAYS_PUBLIC_ROUTES = ["/~offline"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (ALWAYS_PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route))) {
    return;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  if (nextUrl.pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return Response.redirect(new URL("/", nextUrl));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|icon.png|manifest.json|icons|sw.js|robots.txt).*)",
  ],
};
