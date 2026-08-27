import { forwardRef } from "react";
import { PetSprite } from "@/components/pet/PetSprite";

export interface ShareCardProps {
  petName: string;
  spriteKey: string;
  level: number;
  headline: string;
  subline: string;
  streak: number;
  energy?: number;
  happiness?: number;
  equippedItemSpriteKeys?: string[];
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { petName, spriteKey, level, headline, subline, streak, energy, happiness, equippedItemSpriteKeys },
  ref
) {
  return (
    <div
      ref={ref}
      className="pixel-frame flex aspect-[9/16] w-full max-w-[280px] flex-col items-center justify-between rounded-2xl p-6 text-center"
    >
      <p className="font-pixel text-[10px] text-emerald-400">MOVEGO</p>

      <div className="flex flex-col items-center gap-3">
        <PetSprite spriteKey={spriteKey} size="lg" equippedItemSpriteKeys={equippedItemSpriteKeys} />
        <p className="text-lg leading-tight font-bold text-white">{headline}</p>
        <p className="text-sm text-white/70">{subline}</p>
        {(energy !== undefined || happiness !== undefined) && (
          <div className="flex gap-3 text-xs text-white/70">
            {energy !== undefined && <span>❤️ {energy}</span>}
            {happiness !== undefined && <span>😊 {happiness}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-white/80">
          Nível {level} · {petName}
        </p>
        {streak > 0 && <p className="text-sm text-orange-300">🔥 {streak} check-ins seguidos</p>}
        <p className="font-pixel mt-2 text-[9px] text-emerald-400">#MoveGO #MoveSantana</p>
      </div>
    </div>
  );
});
