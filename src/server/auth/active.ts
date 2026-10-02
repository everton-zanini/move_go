import { findUserById } from "@/server/repositories/user.repository";

/** O JWT dura dias; esta checagem faz a desativação valer imediatamente. */
export async function isUserActive(userId: string): Promise<boolean> {
  const user = await findUserById(userId);
  return !!user?.active;
}
