import { auth } from "@/server/auth/auth";
import { listAchievements } from "@/server/repositories/achievement.repository";
import { listUserAchievements } from "@/server/services/achievement.service";

export default async function AchievementsPage() {
  const session = await auth();

  const [allAchievements, unlocked] = await Promise.all([
    listAchievements(),
    session?.user ? listUserAchievements(session.user.id) : Promise.resolve([]),
  ]);

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h1 className="text-center text-lg font-bold">🏆 Conquistas</h1>
      <p className="text-center text-xs text-white/50">
        {unlocked.length} de {allAchievements.length} desbloqueadas
      </p>

      <div className="grid grid-cols-2 gap-3">
        {allAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center ${
                isUnlocked ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/5 opacity-50"
              }`}
            >
              <p className="text-3xl">{achievement.icon}</p>
              <p className="text-sm font-semibold">{achievement.name}</p>
              <p className="text-xs text-white/50">{achievement.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
