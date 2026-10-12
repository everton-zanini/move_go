import { formatBR } from "@/lib/datetime";
import { ptBR } from "date-fns/locale";
import { auth } from "@/server/auth/auth";
import { listAchievementsWithProgress } from "@/server/services/achievement.service";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function AchievementsPage() {
  const session = await auth();
  const items = session?.user ? await listAchievementsWithProgress(session.user.id) : [];
  const unlockedCount = items.filter((item) => item.unlockedAt).length;

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <h1 className="text-center text-lg font-bold">🏆 Conquistas</h1>
      <p className="text-center text-xs text-white/70">
        {unlockedCount} de {items.length} desbloqueadas
      </p>

      <div className="grid grid-cols-2 gap-3">
        {items.map(({ achievement, unlockedAt, progress }) => (
          <div
            key={achievement.id}
            className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center ${
              unlockedAt ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/5"
            }`}
          >
            <p className={`text-3xl ${unlockedAt ? "" : "opacity-40 grayscale"}`}>{achievement.icon}</p>
            <p className="text-sm font-semibold">{achievement.name}</p>
            <p className="text-xs text-white/70">{achievement.description}</p>
            {unlockedAt ? (
              <p className="text-xs text-emerald-300">
                Desbloqueada em {formatBR(unlockedAt, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            ) : (
              progress && (
                <div className="w-full">
                  <ProgressBar value={progress.current} max={progress.target} label={`Progresso de ${achievement.name}`} />
                  <p className="mt-1 text-xs text-white/70">
                    {progress.current} / {progress.target}
                  </p>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
