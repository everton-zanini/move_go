"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth/auth";
import { registerSchema } from "@/server/dto/auth.dto";
import { registerUser } from "@/server/auth/register";
import { DomainError } from "@/server/errors";

export type RegisterState = { error?: string };

export async function registerAction(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada! Faça login para continuar." };
    }
    throw error;
  }

  return {};
}
