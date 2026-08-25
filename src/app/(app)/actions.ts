"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { petNicknameSchema } from "@/server/dto/pet.dto";
import { renamePet } from "@/server/services/pet.service";
import { DomainError, UnauthenticatedError } from "@/server/errors";

export type PetNameState = { error?: string };

export async function renamePetAction(_prevState: PetNameState, formData: FormData): Promise<PetNameState> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }

  const parsed = petNicknameSchema.safeParse({ nickname: formData.get("nickname") });
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
  return {};
}
