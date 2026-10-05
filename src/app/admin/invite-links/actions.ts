"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireChurchAdmin } from "@/server/auth/context";
import { inviteLinkFormSchema } from "@/server/dto/invite-link.dto";
import {
  createInviteLink,
  removeInviteLink,
  toggleInviteLinkActive,
  updateInviteLink,
} from "@/server/services/invite-link.service";
import { withFlash } from "@/lib/flash";
import { DomainError } from "@/server/errors";

export type InviteLinkFormState = { error?: string };

export async function createInviteLinkAction(
  _prevState: InviteLinkFormState,
  formData: FormData
): Promise<InviteLinkFormState> {
  const { churchId } = await requireChurchAdmin();

  const parsed = inviteLinkFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let link;
  try {
    link = await createInviteLink(churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/invite-links");
  redirect(withFlash(`/admin/invite-links/${link.id}/qrcode`, "Link de cadastro criado com sucesso."));
}

export async function updateInviteLinkAction(
  id: string,
  _prevState: InviteLinkFormState,
  formData: FormData
): Promise<InviteLinkFormState> {
  const { churchId } = await requireChurchAdmin();

  const parsed = inviteLinkFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateInviteLink(id, churchId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/invite-links");
  revalidatePath(`/admin/invite-links/${id}`);
  redirect(withFlash("/admin/invite-links", "Link de cadastro atualizado com sucesso."));
}

export async function toggleInviteLinkActiveAction(id: string) {
  const { churchId } = await requireChurchAdmin();
  await toggleInviteLinkActive(id, churchId);
  revalidatePath("/admin/invite-links");
  redirect(withFlash("/admin/invite-links", "Status do link alterado."));
}

export async function deleteInviteLinkAction(id: string) {
  const { churchId } = await requireChurchAdmin();
  await removeInviteLink(id, churchId);
  revalidatePath("/admin/invite-links");
  redirect(withFlash("/admin/invite-links", "Link de cadastro excluído com sucesso."));
}
