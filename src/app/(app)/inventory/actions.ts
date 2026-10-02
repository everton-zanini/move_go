"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { equipItem, unequipItem } from "@/server/services/inventory.service";
import { withFlash } from "@/lib/flash";
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
  redirect(withFlash("/inventory", equipped ? "Item removido." : "Item equipado."));
}
