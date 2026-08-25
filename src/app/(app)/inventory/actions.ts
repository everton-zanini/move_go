"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { equipItem, unequipItem } from "@/server/services/inventory.service";
import { UnauthenticatedError } from "@/server/errors";

export async function toggleEquipAction(itemId: string, equipped: boolean) {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }

  if (equipped) {
    await unequipItem(session.user.id, itemId);
  } else {
    await equipItem(session.user.id, itemId);
  }

  revalidatePath("/inventory");
}
