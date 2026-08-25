import { auth } from "@/server/auth/auth";
import { findPetByUserId } from "@/server/repositories/pet.repository";
import { countCheckInsForUser } from "@/server/repositories/checkin.repository";
import { listUserAchievements } from "@/server/services/achievement.service";
import { listInventory } from "@/server/services/inventory.service";

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-3 text-left">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [pet, checkInCount, achievements, inventory] = await Promise.all([
    userId ? findPetByUserId(userId) : null,
    userId ? countCheckInsForUser(userId) : 0,
    userId ? listUserAchievements(userId) : [],
    userId ? listInventory(userId) : [],
  ]);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-6 py-10 text-center">
      <p className="text-4xl">👤</p>
      <h1 className="text-lg font-bold">{session?.user?.name}</h1>
      <p className="text-sm text-white/60">{session?.user?.email}</p>

      {pet && (
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <ProfileStat label="Nível" value={pet.level} />
          <ProfileStat label="XP total" value={pet.totalXp} />
          <ProfileStat label="Check-ins" value={checkInCount} />
          <ProfileStat label="Maior sequência" value={pet.longestStreak} />
          <ProfileStat label="Conquistas" value={achievements.length} />
          <ProfileStat label="Itens" value={inventory.length} />
        </div>
      )}
    </div>
  );
}
