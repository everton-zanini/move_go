import { ConflictError } from "@/server/errors";
import { createUser, findUserByEmail } from "@/server/repositories/user.repository";
import { createInitialPet } from "@/server/services/pet-evolution.service";
import { hashPassword } from "./password";
import type { RegisterInput } from "@/server/dto/auth.dto";

export async function registerUser(input: RegisterInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError("Já existe uma conta com este email.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({ name: input.name, email: input.email, passwordHash });
  await createInitialPet(user.id);
  return user;
}
