"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { requireChurchAdmin, requireMember } from "@/server/auth/context";
import { petNicknameSchema } from "@/server/dto/pet.dto";
import {
  debugAddXpToNextEvolution,
  debugRedoLineChoice,
  debugResetPet,
  renamePet,
} from "@/server/services/pet.service";
import { debugGrantItemByName } from "@/server/services/inventory.service";
import { resolveShortCode } from "@/server/services/event.service";
import { DomainError, UnauthenticatedError } from "@/server/errors";

export type PetNameState = { error?: string; saved?: boolean };

export async function renamePetAction(_prevState: PetNameState, formData: FormData): Promise<PetNameState> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }

  const parsed = petNicknameSchema.safeParse({
    nickname: formData.get("nickname"),
    speciesId: formData.get("speciesId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  try {
    await renamePet(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  return { saved: true };
}

export type CheckInCodeState = { error?: string };

/** Fallback pra quando não dá pra escanear o QR: resolve o código curto e navega pro check-in. */
export async function resolveCheckInCodeAction(
  _prevState: CheckInCodeState,
  formData: FormData
): Promise<CheckInCodeState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) {
    return { error: "Digite o código do evento." };
  }

  const { churchId } = await requireMember();

  let event;
  try {
    event = await resolveShortCode(code, churchId);
  } catch (error) {
    if (error instanceof DomainError) {
      return { error: "Código inválido." };
    }
    throw error;
  }

  redirect(`/checkin/${event.qrCodeToken}`);
}

export type DebugActionState = { message?: string };

export async function debugAddXpAction(
  _prevState: DebugActionState,
  _formData: FormData
): Promise<DebugActionState> {
  const { userId } = await requireChurchAdmin();
  const result = await debugAddXpToNextEvolution(userId);
  revalidatePath("/");
  return { message: `Nível ${result.pet.level} · ${result.newEvolution.name}${result.evolved ? " 🎉 evoluiu!" : ""}` };
}

export async function debugResetPetAction(
  _prevState: DebugActionState,
  _formData: FormData
): Promise<DebugActionState> {
  const { userId } = await requireChurchAdmin();
  await debugResetPet(userId);
  revalidatePath("/");
  return { message: "Pet resetado para o estágio inicial." };
}

export async function debugRedoLineChoiceAction(
  _prevState: DebugActionState,
  _formData: FormData
): Promise<DebugActionState> {
  const { userId } = await requireChurchAdmin();
  await debugRedoLineChoice(userId);
  revalidatePath("/");
  return { message: "Nome e linha limpos — escolha de novo na tela inicial." };
}

export async function debugUnlockFoneAction(
  _prevState: DebugActionState,
  _formData: FormData
): Promise<DebugActionState> {
  const { userId } = await requireChurchAdmin();
  await debugGrantItemByName(userId, "Fone");
  revalidatePath("/inventory");
  return { message: "Fone liberado! Veja em Itens 🎒" };
}

export async function debugUnlockOculosAction(
  _prevState: DebugActionState,
  _formData: FormData
): Promise<DebugActionState> {
  const { userId } = await requireChurchAdmin();
  await debugGrantItemByName(userId, "Óculos");
  revalidatePath("/inventory");
  return { message: "Óculos liberado! Veja em Itens 🎒" };
}
