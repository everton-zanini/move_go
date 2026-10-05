import NextAuth from "next-auth";
import authConfig from "@/server/auth/auth.config";

// Instância leve (sem PrismaAdapter) para rodar no runtime Edge do proxy.
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register", "/invite", "/platform/login"];
// Sempre acessível, independente de sessão — a página servida pelo service
// worker quando o dispositivo está offline (ver src/app/sw.ts).
const ALWAYS_PUBLIC_ROUTES = ["/~offline"];

// Role aqui vem do JWT. Checagens de ADMIN de igreja ficam nos layouts/actions (lidas do banco),
// porque promoção/rebaixamento precisa valer sem relogar. SUPER_ADMIN não muda, então dá pra separar aqui.
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const isSuperAdmin = req.auth?.user?.role === "SUPER_ADMIN";
  const isPlatformRoute = pathname === "/platform" || pathname.startsWith("/platform/");

  if (ALWAYS_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(isSuperAdmin ? "/platform" : "/", nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    const loginPath = isPlatformRoute ? "/platform/login" : "/login";
    return Response.redirect(new URL(`${loginPath}?callbackUrl=${callbackUrl}`, nextUrl));
  }

  if (isPlatformRoute && !isSuperAdmin) {
    return Response.redirect(new URL("/", nextUrl));
  }

  // Super-admin não pertence a nenhuma igreja: fica restrito ao painel da plataforma.
  if (!isPlatformRoute && isSuperAdmin && !pathname.startsWith("/api/")) {
    return Response.redirect(new URL("/platform", nextUrl));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|icon.png|manifest.json|icons|sw.js|robots.txt).*)",
  ],
};
