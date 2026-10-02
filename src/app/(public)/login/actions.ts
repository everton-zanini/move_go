"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth/auth";
import { loginSchema } from "@/server/dto/auth.dto";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as { code?: string }).code;
      return { error: code === "inactive" ? "Sua conta está desativada. Fale com um administrador." : "Email ou senha inválidos." };
    }
    throw error;
  }

  return {};
}
