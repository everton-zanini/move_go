"use client";

import { useEffect, useState } from "react";
import { PetSprite } from "@/components/pet/PetSprite";
import { playFeedback } from "@/lib/feedback";

const SEEN_KEY = "movego:hatch-seen";
const HATCH_MS = 2800;

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Sem storage a animação só repete se a página recarregar antes da escolha da linha.
  }
}

function alreadySeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Toca a animação do ovo chocando uma vez e depois revela o conteúdo (a escolha da linha). */
export function HatchIntro({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || alreadySeen()) {
      const skip = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(skip);
    }

    const sound = setTimeout(() => playFeedback("levelUp", [60, 40, 60, 40, 150]), HATCH_MS - 500);
    const finish = setTimeout(() => {
      markSeen();
      setDone(true);
    }, HATCH_MS);
    return () => {
      clearTimeout(sound);
      clearTimeout(finish);
    };
  }, []);

  if (done) {
    return <div className="hatch-reveal flex w-full flex-col items-center">{children}</div>;
  }

  return (
    <div role="status" className="flex flex-col items-center gap-4 py-4 text-center">
      <p className="text-sm text-white/80">Tem algo acontecendo com o seu ovo...</p>

      <div className="egg-hatch relative">
        <PetSprite spriteKey="egg" alt="Seu ovo começando a chocar" />
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          shapeRendering="crispEdges"
          className="egg-cracks pointer-events-none absolute inset-0 h-full w-full"
        >
          <path d="M24 10 L21 16 L26 20 L20 26 L25 31 L22 38" pathLength={1} />
          <path d="M26 20 L32 22 L34 28" pathLength={1} />
        </svg>
        <div className="egg-flash pointer-events-none absolute inset-0 rounded-2xl bg-white" />
      </div>

      <button
        type="button"
        onClick={() => {
          markSeen();
          setDone(true);
        }}
        className="min-h-11 text-xs text-white/70 underline underline-offset-2"
      >
        Pular
      </button>
    </div>
  );
}
