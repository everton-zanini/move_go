"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { toggleUserActive } from "@/server/services/user.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export async function toggleUserActiveAction(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new DomainError("Acesso não autorizado.", "FORBIDDEN");
  }

  let updated;
  try {
    updated = await toggleUserActive(session.user.id, userId);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(withFlash("/admin/users", error.message, "error"));
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirect(withFlash("/admin/users", updated.active ? "Usuário ativado." : "Usuário desativado."));
}
