import { auth } from "@/server/auth/auth";
import { requireMember } from "@/server/auth/context";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import {
  applyMissedEventPenalties,
  getNextEvolutionProgress,
  listSelectableLines,
} from "@/server/services/pet.service";
import { getLevelCurveParams } from "@/server/services/config.service";
import { listInventory } from "@/server/services/inventory.service";
import { xpProgressForLevel } from "@/lib/game/level-curve";
import { getPetTheme } from "@/lib/game/pet-theme";
import { getPetMood, PET_MOOD_MESSAGES } from "@/lib/game/pet-mood";
import { PetSprite } from "@/components/pet/PetSprite";
import { PetStatsBar } from "@/components/pet/PetStatsBar";
import { HatchIntro } from "@/components/pet/HatchIntro";
import { PetNameForm } from "@/components/pet/PetNameForm";
import { PetShareToggle } from "@/components/pet/PetShareToggle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckInModal } from "@/components/checkin/CheckInModal";
import { DebugPanel } from "@/components/debug/DebugPanel";

export default async function HomePage() {
  const session = await auth();
  const member = await requireMember();
  const penalty =
    member.role !== "ADMIN" ? await applyMissedEventPenalties(member.userId, member.churchId) : null;
  const pet = session?.user ? await findPetByUserId(session.user.id) : null;
  const inventory = session?.user ? await listInventory(session.user.id) : [];
  const equippedItemSpriteKeys = inventory
    .filter((ui) => ui.equipped)
    .map((ui) => ui.item.sprite);

  if (!pet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🥚</p>
        <p className="text-sm text-white/60">
          Seu pet ainda está sendo preparado. Volte em instantes.
        </p>
      </div>
    );
  }

  const curve = await getLevelCurveParams();
  const progress = xpProgressForLevel(pet.totalXp, pet.level, curve);

  const stageName = pet.currentEvolution?.name ?? "Spark";
  const hasHatched = (pet.currentEvolution?.levelRequired ?? 1) > 1;
  const mood = getPetMood(pet.energy, pet.happiness);
  const needsName = hasHatched && !pet.nickname;
  const [lines, nextEvolution] = await Promise.all([
    needsName ? listSelectableLines(pet.level) : Promise.resolve([]),
    needsName ? Promise.resolve(null) : getNextEvolutionProgress(pet),
  ]);
  const theme = getPetTheme(pet.currentEvolution?.sprite ?? "egg");

  return (
    <div
      className="flex flex-1 flex-col items-center gap-6 px-6 py-8"
      style={{ "--accent": theme.accent } as React.CSSProperties}
    >
      <div className="w-full max-w-xs text-center">
        <p className="font-pixel text-[10px] text-emerald-400">MOVEGO</p>
        <h1 className="mt-1 text-lg font-bold">{session?.user?.name}</h1>
      </div>

      {penalty && penalty.missedEvents.length > 0 && (
        <div className="w-full max-w-xs rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-center text-xs text-red-200">
          <p>Você perdeu: {penalty.missedEvents.join(", ")}</p>
          <p className="mt-1">
            {penalty.energyLost > 0 && `−${penalty.energyLost} ❤️ Energia `}
            {penalty.happinessLost > 0 &&
              `−${penalty.happinessLost} 😊 Felicidade`}
          </p>
        </div>
      )}

      {member.role === "ADMIN" && <DebugPanel />}

      <CheckInModal />

      {needsName ? (
        // Antes de escolher a linha o estágio atual é provisório — só o formulário aparece.
        <HatchIntro>
          <PetNameForm lines={lines} />
        </HatchIntro>
      ) : (
        <>
          <PetSprite
            spriteKey={pet.currentEvolution?.sprite ?? "egg"}
            equippedItemSpriteKeys={equippedItemSpriteKeys}
            mood={mood}
            alt={`${pet.nickname ?? "Seu pet"}, ${stageName}`}
          />

          <p className="max-w-xs rounded-lg bg-white/5 px-3 py-2 text-center text-sm text-white/80">
            {PET_MOOD_MESSAGES[mood]}
          </p>

          <div className="w-full max-w-xs text-center">
            <p className="text-sm text-white/70">
              {pet.nickname ? `${pet.nickname} · ` : ""}
              {stageName} · Nível {pet.level}
            </p>
            <div className="mt-2">
              <ProgressBar value={progress.current} max={progress.required} label="Progresso de XP até o próximo nível" />
              <p className="mt-1 text-xs text-white/70">
                {progress.current} / {progress.required} XP para o nível {pet.level + 1}
              </p>
              {nextEvolution && (
                <p className="mt-1 text-xs text-white/70">
                  Evolui para {nextEvolution.name} no nível {nextEvolution.levelRequired} (faltam {nextEvolution.xpRemaining} XP no total)
                </p>
              )}
            </div>
          </div>

          <PetStatsBar
            energy={pet.energy}
            happiness={pet.happiness}
            streak={pet.currentStreak}
            xp={pet.totalXp}
          />

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
        </>
      )}
    </div>
  );
}
