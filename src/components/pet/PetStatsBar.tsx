function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 py-2">
      <span aria-hidden="true" className="text-lg">
        {icon}
      </span>
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

export function PetStatsBar({
  energy,
  happiness,
  streak,
  xp,
}: {
  energy: number;
  happiness: number;
  streak: number;
  xp: number;
}) {
  return (
    <div className="grid w-full max-w-xs grid-cols-4 gap-2">
      <Stat icon="❤️" value={energy} label="Energia" />
      <Stat icon="😊" value={happiness} label="Feliz" />
      <Stat icon="🔥" value={streak} label="Sequência" />
      <Stat icon="⭐" value={xp} label="XP" />
    </div>
  );
}
