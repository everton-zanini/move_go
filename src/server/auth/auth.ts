import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { findUserByEmail } from "@/server/repositories/user.repository";
import { loginSchema } from "@/server/dto/auth.dto";
import authConfig from "./auth.config";
import { verifyPassword } from "./password";

class InactiveUserError extends CredentialsSignin {
  code = "inactive";
}

class ChurchInactiveError extends CredentialsSignin {
  code = "church_inactive";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await findUserByEmail(parsed.data.email);
        if (!user) return null;

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) return null;
        if (!user.active) throw new InactiveUserError();
        if (user.church && !user.church.active) throw new ChurchInactiveError();

        return { id: user.id, name: user.name, email: user.email, role: user.role, churchId: user.churchId };
      },
    }),
  ],
});
