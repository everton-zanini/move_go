"use server";

import { auth } from "@/server/auth/auth";
import { isUserActive } from "@/server/auth/active";
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
  if (!(await isUserActive(session.user.id))) {
    return { status: "error", message: "Sua conta está desativada." };
  }

  try {
    const result = await performCheckIn({ userId: session.user.id, token });
    return { status: "success", result };
  } catch (error) {
    if (error instanceof DomainError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
