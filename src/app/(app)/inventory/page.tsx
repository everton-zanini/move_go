import { auth } from "@/server/auth/auth";
import { listInventory } from "@/server/services/inventory.service";
import { ItemSprite } from "@/components/item/ItemSprite";
import { EquipButton } from "@/components/inventory/EquipButton";
import { toggleEquipAction } from "./actions";

const SLOT_LABELS: Record<string, string> = {
  HAT: "Boné",
  BACKGROUND: "Fundo",
  ACCESSORY: "Acessório",
  FRAME: "Moldura",
  OTHER: "Outro",
};

export default async function InventoryPage() {
  const session = await auth();
  const inventory = session?.user ? await listInventory(session.user.id) : [];

  if (inventory.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-4xl">🎒</p>
        <h1 className="text-lg font-bold">Itens</h1>
        <p className="max-w-xs text-sm text-white/60">
          Você ainda não desbloqueou nenhum item. Faça check-in em cultos e eventos para desbloquear!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h1 className="text-center text-lg font-bold">🎒 Itens</h1>
      <div className="grid grid-cols-2 gap-3">
        {inventory.map((userItem) => (
          <div
            key={userItem.itemId}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center"
          >
            <ItemSprite spriteKey={userItem.item.sprite} />
            <p className="text-sm font-semibold">{userItem.item.name}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/65">
              {SLOT_LABELS[userItem.item.slot] ?? userItem.item.slot}
            </p>
            <form action={toggleEquipAction.bind(null, userItem.itemId, userItem.equipped)}>
              <EquipButton equipped={userItem.equipped} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
