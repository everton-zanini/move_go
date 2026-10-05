"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireChurchAdmin } from "@/server/auth/context";
import { setUserRole, toggleUserActive } from "@/server/services/user.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireChurchAdmin();

  let updated;
  try {
    updated = await toggleUserActive(admin.userId, admin.churchId, userId);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(withFlash("/admin/users", error.message, "error"));
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirect(withFlash("/admin/users", updated.active ? "Usuário ativado." : "Usuário desativado."));
}

export async function setUserRoleAction(userId: string, role: "USER" | "ADMIN") {
  const admin = await requireChurchAdmin();

  try {
    await setUserRole(admin.userId, admin.churchId, userId, role);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(withFlash("/admin/users", error.message, "error"));
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirect(withFlash("/admin/users", role === "ADMIN" ? "Usuário promovido a admin." : "Admin removido."));
}
