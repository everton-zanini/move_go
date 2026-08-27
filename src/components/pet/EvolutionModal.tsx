"use client";

import { useState } from "react";
import { PetSprite } from "@/components/pet/PetSprite";

const PARTICLE_COUNT = 10;
const PARTICLE_DISTANCE = 70;

const BURSTS: { top: string; left: string; color: string; delay: number }[] = [
  { top: "20%", left: "22%", color: "#39ff88", delay: 0 },
  { top: "15%", left: "72%", color: "#ffe14d", delay: 0.3 },
  { top: "62%", left: "18%", color: "#ff5d8f", delay: 0.6 },
  { top: "60%", left: "78%", color: "#5dc8ff", delay: 0.9 },
];

function FireworkBurst({ top, left, color, delay }: { top: string; left: string; color: string; delay: number }) {
  return (
    <div className="firework-burst" style={{ top, left }}>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = ((360 / PARTICLE_COUNT) * i * Math.PI) / 180;
        const dx = Math.cos(angle) * PARTICLE_DISTANCE;
        const dy = Math.sin(angle) * PARTICLE_DISTANCE;
        return (
          <span
            key={i}
            className="firework-particle"
            style={{
              color,
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
              animationDelay: `${delay + i * 0.03}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

export function EvolutionModal({ evolutionName, spriteKey }: { evolutionName: string; spriteKey: string }) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div
      className="evolution-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 px-6"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Seu pet evoluiu para ${evolutionName}`}
    >
      {BURSTS.map((burst, i) => (
        <FireworkBurst key={i} {...burst} />
      ))}

      <div
        className="evolution-card pixel-frame relative flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-pixel text-xs text-yellow-300">PARABÉNS!</p>
        <p className="font-pixel text-sm text-emerald-400">SEU SPARK EVOLUIU!</p>

        <PetSprite spriteKey={spriteKey} size="lg" />

        <p className="text-lg font-bold">{evolutionName}</p>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-black"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
