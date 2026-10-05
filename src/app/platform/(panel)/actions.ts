"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/server/auth/context";
import { churchAdminSchema, churchFormSchema, createChurchSchema } from "@/server/dto/church.dto";
import {
  addChurchAdmin,
  createChurchWithAdmin,
  toggleChurchActive,
  updateChurch,
} from "@/server/services/church.service";
import { setUserRole, toggleUserActive } from "@/server/services/user.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export type PlatformFormState = { error?: string };

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function createChurchAction(
  _prevState: PlatformFormState,
  formData: FormData
): Promise<PlatformFormState> {
  await requireSuperAdmin();

  const parsed = createChurchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  let church;
  try {
    church = await createChurchWithAdmin(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/platform");
  redirect(withFlash(`/platform/churches/${church.id}`, "Igreja criada com sucesso."));
}

export async function updateChurchAction(
  id: string,
  _prevState: PlatformFormState,
  formData: FormData
): Promise<PlatformFormState> {
  await requireSuperAdmin();

  const parsed = churchFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    await updateChurch(id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/platform");
  redirect(withFlash(`/platform/churches/${id}`, "Igreja atualizada."));
}

export async function toggleChurchActiveAction(id: string) {
  await requireSuperAdmin();
  const church = await toggleChurchActive(id);
  revalidatePath("/platform");
  redirect(withFlash(`/platform/churches/${id}`, church.active ? "Igreja ativada." : "Igreja desativada."));
}

export async function addChurchAdminAction(
  churchId: string,
  _prevState: PlatformFormState,
  formData: FormData
): Promise<PlatformFormState> {
  await requireSuperAdmin();

  const parsed = churchAdminSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  try {
    await addChurchAdmin(churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/platform/churches/${churchId}`);
  redirect(withFlash(`/platform/churches/${churchId}`, "Admin adicionado."));
}

export async function platformToggleUserActiveAction(churchId: string, userId: string) {
  const { userId: actorId } = await requireSuperAdmin();
  const path = `/platform/churches/${churchId}`;

  let updated;
  try {
    updated = await toggleUserActive(actorId, churchId, userId);
  } catch (error) {
    if (error instanceof DomainError) redirect(withFlash(path, error.message, "error"));
    throw error;
  }

  revalidatePath(path);
  redirect(withFlash(path, updated.active ? "Usuário ativado." : "Usuário desativado."));
}

export async function platformSetUserRoleAction(churchId: string, userId: string, role: "USER" | "ADMIN") {
  const { userId: actorId } = await requireSuperAdmin();
  const path = `/platform/churches/${churchId}`;

  try {
    await setUserRole(actorId, churchId, userId, role);
  } catch (error) {
    if (error instanceof DomainError) redirect(withFlash(path, error.message, "error"));
    throw error;
  }

  revalidatePath(path);
  redirect(withFlash(path, role === "ADMIN" ? "Usuário promovido a admin." : "Admin removido."));
}
