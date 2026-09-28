"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { inviteLinkFormSchema } from "@/server/dto/invite-link.dto";
import {
  createInviteLink,
  removeInviteLink,
  toggleInviteLinkActive,
  updateInviteLink,
} from "@/server/services/invite-link.service";
import { DomainError } from "@/server/errors";

export type InviteLinkFormState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new DomainError("Acesso não autorizado.", "FORBIDDEN");
  }
}

export async function createInviteLinkAction(
  _prevState: InviteLinkFormState,
  formData: FormData
): Promise<InviteLinkFormState> {
  await requireAdmin();

  const parsed = inviteLinkFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let link;
  try {
    link = await createInviteLink(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/invite-links");
  redirect(`/admin/invite-links/${link.id}/qrcode`);
}

export async function updateInviteLinkAction(
  id: string,
  _prevState: InviteLinkFormState,
  formData: FormData
): Promise<InviteLinkFormState> {
  await requireAdmin();

  const parsed = inviteLinkFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateInviteLink(id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/invite-links");
  revalidatePath(`/admin/invite-links/${id}`);
  redirect("/admin/invite-links");
}

export async function toggleInviteLinkActiveAction(id: string) {
  await requireAdmin();
  await toggleInviteLinkActive(id);
  revalidatePath("/admin/invite-links");
}

export async function deleteInviteLinkAction(id: string) {
  await requireAdmin();
  await removeInviteLink(id);
  revalidatePath("/admin/invite-links");
  redirect("/admin/invite-links");
}
