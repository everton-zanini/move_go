"use server";

import { auth } from "@/server/auth/auth";
import { getCurrentUser } from "@/server/auth/context";
import { performCheckIn, type CheckInResult } from "@/server/services/checkin.service";
import { DomainError, UnauthenticatedError } from "@/server/errors";

export type CheckInActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; result: CheckInResult };

export async function performCheckInAction(
  _prevState: CheckInActionState,
  formData: FormData
): Promise<CheckInActionState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { status: "error", message: "QR Code inválido." };
  }

  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sua conta está desativada." };
  }
  if (!user.churchId) {
    return { status: "error", message: "Esta conta não participa de nenhuma igreja." };
  }

  try {
    const result = await performCheckIn({ userId: user.id, churchId: user.churchId, token });
    return { status: "success", result };
  } catch (error) {
    if (error instanceof DomainError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
