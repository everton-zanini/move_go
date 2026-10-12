"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EvolutionModal, FireworkBurst } from "@/components/pet/EvolutionModal";
import { ShareActions } from "@/components/share/ShareActions";
import { isMuted, playFeedback, setMuted } from "@/lib/feedback";
import type { CheckInResult } from "@/server/services/checkin.service";

const COUNT_UP_MS = 900;
const REVEAL_STEP_S = 0.45;

function buildShareContent(r: CheckInResult): { headline: string; subline: string } {
  if (r.evolved) {
    return { headline: "Meu pet evoluiu! 🎉", subline: r.evolutionName };
  }
  if (r.newAchievements.length > 0) {
    return { headline: "Conquista desbloqueada! 🏆", subline: r.newAchievements[0].name };
  }
  if (r.newItems.length > 0) {
    return { headline: "Item desbloqueado! ✨", subline: r.newItems[0].name };
  }
  if (r.leveledUp) {
    return { headline: "Subi de nível! 🎉", subline: `Nível ${r.newLevel}` };
  }
  return { headline: "Fiz check-in! ✅", subline: r.eventName };
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : COUNT_UP_MS;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export function CheckInReward({ result: r, userName }: { result: CheckInResult; userName: string }) {
  const xp = useCountUp(r.xpEarned);
  // Só renderiza no client (depois da server action), então ler o localStorage aqui é seguro.
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => {
    // A evolução toca o próprio som; aqui só os casos sem o modal.
    if (!r.evolved) {
      playFeedback(r.leveledUp ? "levelUp" : "reward", r.leveledUp ? [60, 50, 60, 50, 160] : [40]);
    }
  }, [r.evolved, r.leveledUp]);

  function toggleMute() {
    setMuted(!muted);
    setMutedState(!muted);
  }

  // Cada bloco entra um depois do outro: a sequência é o único movimento "automático" da tela.
  let step = 1;
  const reveal = () => ({ animationDelay: `${step++ * REVEAL_STEP_S}s` });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <p className="font-pixel text-xs text-emerald-400">XP GANHO!</p>
      <p aria-label={`${r.xpEarned} pontos de experiência ganhos`} className="font-pixel text-4xl text-white">
        +{xp}
      </p>

      <div className="reward-reveal flex gap-4 text-sm text-white/80" style={reveal()}>
        <span>❤️ +{r.energyGained} Energia</span>
        <span>😊 +{r.happinessGained} Felicidade</span>
      </div>

      {r.streakBonusXp > 0 && (
        <p className="reward-reveal text-sm text-orange-300" style={reveal()}>
          🔥 Bônus de sequência ({r.streak}): +{r.streakBonusXp} XP
        </p>
      )}

      {r.leveledUp && (
        <div className="reward-reveal relative mt-2 flex flex-col items-center gap-2" style={reveal()}>
          <FireworkBurst top="40%" left="50%" color="#ffe14d" delay={0.2} />
          <p className="font-pixel text-lg text-yellow-300">LEVEL UP!</p>
          <p className="text-sm text-white/80">
            Nível {r.previousLevel} → {r.newLevel}
          </p>
        </div>
      )}

      {r.evolved && <EvolutionModal evolutionName={r.evolutionName} spriteKey={r.spriteKey} />}

      {r.newItems.length > 0 && (
        <div className="reward-reveal mt-2 flex flex-col items-center gap-1" style={reveal()}>
          <p className="font-pixel text-xs text-emerald-400">ITEM DESBLOQUEADO!</p>
          {r.newItems.map((item) => (
            <p key={item.id} className="text-sm text-white/80">
              ✨ {item.name}
            </p>
          ))}
        </div>
      )}

      {r.newAchievements.length > 0 && (
        <div className="reward-reveal mt-2 flex flex-col items-center gap-1" style={reveal()}>
          <p className="font-pixel text-xs text-yellow-300">CONQUISTA DESBLOQUEADA!</p>
          {r.newAchievements.map((achievement) => (
            <p key={achievement.id} className="text-sm text-white/80">
              {achievement.icon} {achievement.name}
            </p>
          ))}
        </div>
      )}

      <Link
        href="/"
        className="reward-reveal mt-4 inline-flex min-h-12 items-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
        style={reveal()}
      >
        Ver meu pet
      </Link>

      <div className="reward-reveal mt-2 border-t border-white/10 pt-6" style={reveal()}>
        <ShareActions petName={userName} spriteKey={r.spriteKey} level={r.newLevel} streak={r.streak} {...buildShareContent(r)} />
      </div>

      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        className="min-h-11 text-xs text-white/70 underline underline-offset-2"
      >
        {muted ? "🔇 Som desligado" : "🔊 Som ligado"}
      </button>
    </div>
  );
}
