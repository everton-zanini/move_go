import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Config edge-safe (sem PrismaAdapter, sem Credentials.authorize).
 * Usada tanto pela instância completa (auth.ts) quanto pela instância
 * leve do proxy.ts (route protection), que roda em runtime Edge.
 */
export default {
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
