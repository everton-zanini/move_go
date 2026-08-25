import { auth } from "@/server/auth/auth";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import { getLevelCurveParams } from "@/server/services/config.service";
import { xpProgressForLevel } from "@/lib/game/level-curve";
import { PetSprite } from "@/components/pet/PetSprite";
import { PetStatsBar } from "@/components/pet/PetStatsBar";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function HomePage() {
  const session = await auth();
  const pet = session?.user ? await findPetByUserId(session.user.id) : null;

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

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-6 py-8">
      <div className="w-full max-w-xs text-center">
        <p className="font-pixel text-[10px] text-emerald-400">MOVEGO</p>
        <h1 className="mt-1 text-lg font-bold">{session?.user?.name}</h1>
      </div>

      <PetSprite spriteKey={pet.currentEvolution?.sprite ?? "egg"} />

      <div className="w-full max-w-xs text-center">
        <p className="text-sm text-white/70">
          {pet.currentEvolution?.name ?? "Ovo"} · Nível {pet.level}
        </p>
        <div className="mt-2">
          <ProgressBar value={progress.current} max={progress.required} />
          <p className="mt-1 text-xs text-white/50">
            {progress.current} / {progress.required} XP
          </p>
        </div>
      </div>

      <PetStatsBar energy={pet.energy} happiness={pet.happiness} streak={pet.currentStreak} xp={pet.totalXp} />
    </div>
  );
}
