import { prisma } from "@/lib/db/prisma";
import { ConflictError } from "@/server/errors";
import { createUser, findUserByEmail } from "@/server/repositories/user.repository";
import { incrementInviteLinkUses } from "@/server/repositories/invite-link.repository";
import { validateInviteToken } from "@/server/services/invite-link.service";
import { createInitialPet } from "@/server/services/pet-evolution.service";
import { hashPassword } from "./password";
import type { RegisterInput } from "@/server/dto/auth.dto";

export async function registerUser(input: RegisterInput) {
  const inviteLink = await validateInviteToken(input.token);

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError("Já existe uma conta com este email.");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await createUser({ name: input.name, email: input.email, passwordHash }, tx);
    await createInitialPet(user.id, tx);
    await incrementInviteLinkUses(inviteLink.id, tx);
    return user;
  });
}
