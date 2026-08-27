import { auth } from "@/server/auth/auth";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import { getLevelCurveParams } from "@/server/services/config.service";
import { listInventory } from "@/server/services/inventory.service";
import { xpProgressForLevel } from "@/lib/game/level-curve";
import { PetSprite } from "@/components/pet/PetSprite";
import { PetStatsBar } from "@/components/pet/PetStatsBar";
import { PetNameForm } from "@/components/pet/PetNameForm";
import { PetShareToggle } from "@/components/pet/PetShareToggle";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function HomePage() {
  const session = await auth();
  const pet = session?.user ? await findPetByUserId(session.user.id) : null;
  const inventory = session?.user ? await listInventory(session.user.id) : [];
  const equippedItemSpriteKeys = inventory.filter((ui) => ui.equipped).map((ui) => ui.item.sprite);

  if (!pet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🥚</p>
        <p className="text-sm text-white/60">Seu pet ainda está sendo preparado. Volte em instantes.</p>
      </div>
    );
  }

  const curve = await getLevelCurveParams();
  const progress = xpProgressForLevel(pet.totalXp, pet.level, curve);

  const stageName = pet.currentEvolution?.name ?? "Spark";
  const hasHatched = (pet.currentEvolution?.levelRequired ?? 1) > 1;
  const needsName = hasHatched && !pet.nickname;

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-8">
      <div className="w-full max-w-xs text-center">
        <p className="font-pixel text-[10px] text-emerald-400">MOVEGO</p>
        <h1 className="mt-1 text-lg font-bold">{session?.user?.name}</h1>
      </div>

      <PetSprite spriteKey={pet.currentEvolution?.sprite ?? "egg"} equippedItemSpriteKeys={equippedItemSpriteKeys} />

      {needsName && <PetNameForm />}

      <div className="w-full max-w-xs text-center">
        <p className="text-sm text-white/70">
          {pet.nickname ? `${pet.nickname} · ` : ""}
          {stageName} · Nível {pet.level}
        </p>
        <div className="mt-2">
          <ProgressBar value={progress.current} max={progress.required} />
          <p className="mt-1 text-xs text-white/50">
            {progress.current} / {progress.required} XP
          </p>
        </div>
      </div>

      <PetStatsBar energy={pet.energy} happiness={pet.happiness} streak={pet.currentStreak} xp={pet.totalXp} />

      <PetShareToggle
        petName={pet.nickname ?? session?.user?.name ?? "Jovem"}
        spriteKey={pet.currentEvolution?.sprite ?? "egg"}
        level={pet.level}
        headline={pet.nickname ?? "Meu pet"}
        subline={`${stageName} · Nível ${pet.level}`}
        streak={pet.currentStreak}
        energy={pet.energy}
        happiness={pet.happiness}
        equippedItemSpriteKeys={equippedItemSpriteKeys}
      />
    </div>
  );
}
