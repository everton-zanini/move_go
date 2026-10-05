import { cache } from "react";
import { auth } from "./auth";
import { findUserById } from "@/server/repositories/user.repository";
import { ForbiddenError, UnauthenticatedError } from "@/server/errors";

/**
 * Usuário logado lido do banco (não do JWT): role, igreja e status ativo podem mudar
 * depois do login (promoção, desativação), e a checagem precisa valer na hora.
 * `cache` deduplica a consulta dentro de um mesmo request.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await findUserById(session.user.id);
  if (!user?.active) return null;
  if (user.church && !user.church.active) return null;
  return user;
});

/** Jogador ou admin de uma igreja. */
export async function requireMember() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  if (!user.churchId) throw new ForbiddenError();
  return { userId: user.id, churchId: user.churchId, role: user.role };
}

export async function requireChurchAdmin() {
  const member = await requireMember();
  if (member.role !== "ADMIN") throw new ForbiddenError();
  return member;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  if (user.role !== "SUPER_ADMIN") throw new ForbiddenError();
  return { userId: user.id };
}
