/**
 * MVP: emoji + moldura pixelada CSS (sem spritesheet real ainda).
 * A chave vem de PetEvolution.sprite — trocar por spritesheet real no futuro
 * não exige mudança de schema, só desta tabela de resolução.
 */
const SPRITE_EMOJI: Record<string, string> = {
  egg: "🥚",
  hatchling: "🐣",
  young: "🐥",
  adult: "🐦",
  special: "🦅",
};

export function PetSprite({
  spriteKey,
  size = "lg",
}: {
  spriteKey: string;
  size?: "md" | "lg";
}) {
  const emoji = SPRITE_EMOJI[spriteKey] ?? "🥚";
  const frameSize = size === "lg" ? "h-48 w-48" : "h-24 w-24";
  const textSize = size === "lg" ? "text-8xl" : "text-5xl";

  return (
    <div className={`pixel-frame flex items-center justify-center rounded-2xl ${frameSize}`}>
      <span className={`pet-idle pet-blink select-none ${textSize}`}>{emoji}</span>
    </div>
  );
}
