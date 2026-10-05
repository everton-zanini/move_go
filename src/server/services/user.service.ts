import type { Role } from "@prisma/client";
import { ValidationError, NotFoundError } from "@/server/errors";
import {
  countActiveAdmins,
  findUserInChurch,
  setUserActive,
  setUserRole as setUserRoleRepo,
} from "@/server/repositories/user.repository";

export async function toggleUserActive(actorId: string, churchId: string, userId: string) {
  if (actorId === userId) {
    throw new ValidationError("Você não pode desativar a própria conta.");
  }
  const user = await findUserInChurch(userId, churchId);
  if (!user) {
    throw new NotFoundError("Usuário não encontrado.");
  }
  if (user.active && user.role === "ADMIN" && (await countActiveAdmins(churchId)) <= 1) {
    throw new ValidationError("A igreja precisa ter pelo menos um admin ativo.");
  }
  return setUserActive(userId, !user.active);
}

/**
 * Promove/rebaixa dentro de uma igreja. Quem chama (action) já garantiu que o ator é
 * admin desta igreja ou super-admin. SUPER_ADMIN nunca é atribuído por aqui.
 */
export async function setUserRole(actorId: string, churchId: string, userId: string, role: Extract<Role, "USER" | "ADMIN">) {
  if (actorId === userId) {
    throw new ValidationError("Você não pode alterar o próprio papel.");
  }
  const user = await findUserInChurch(userId, churchId);
  if (!user) {
    throw new NotFoundError("Usuário não encontrado.");
  }
  if (user.role === role) return user;
  if (user.role === "ADMIN" && user.active && (await countActiveAdmins(churchId)) <= 1) {
    throw new ValidationError("A igreja precisa ter pelo menos um admin ativo.");
  }
  return setUserRoleRepo(userId, role);
}
