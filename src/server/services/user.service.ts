import { ValidationError, NotFoundError } from "@/server/errors";
import { findUserById, setUserActive } from "@/server/repositories/user.repository";

export async function toggleUserActive(actorId: string, userId: string) {
  if (actorId === userId) {
    throw new ValidationError("Você não pode desativar a própria conta.");
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError("Usuário não encontrado.");
  }
  return setUserActive(userId, !user.active);
}
