import NextAuth from "next-auth";
import authConfig from "@/server/auth/auth.config";

// Instância leve (sem PrismaAdapter) para rodar no runtime Edge do proxy.
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register", "/invite", "/platform/login"];
// Sempre acessível, independente de sessão — a página servida pelo service
// worker quando o dispositivo está offline (ver src/app/sw.ts).
const ALWAYS_PUBLIC_ROUTES = ["/~offline"];

// O proxy só checa se há sessão. Decisões por role ficam nos layouts/actions, lidas do banco:
// o role do JWT pode estar desatualizado (promoção, rebaixamento) e redirecionar por ele aqui
// enquanto o layout redireciona pelo banco gera loop infinito de redirect.
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const isPlatformRoute = pathname === "/platform" || pathname.startsWith("/platform/");

  if (ALWAYS_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    if (isLoggedIn) {
      // "/" manda o super-admin para /platform via (app)/layout.tsx.
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    const loginPath = isPlatformRoute ? "/platform/login" : "/login";
    return Response.redirect(new URL(`${loginPath}?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|icon.png|manifest.json|icons|sw.js|robots.txt).*)",
  ],
};
