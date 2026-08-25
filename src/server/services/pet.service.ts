import { findPetByUserId, updatePet } from "@/server/repositories/pet.repository";
import { NotFoundError } from "@/server/errors";
import type { PetNicknameInput } from "@/server/dto/pet.dto";

export async function renamePet(userId: string, input: PetNicknameInput) {
  const pet = await findPetByUserId(userId);
  if (!pet) {
    throw new NotFoundError("Pet não encontrado para este usuário.");
  }

  return updatePet(userId, { nickname: input.nickname });
}
