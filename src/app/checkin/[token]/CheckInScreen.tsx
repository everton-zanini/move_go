"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PetSprite } from "@/components/pet/PetSprite";
import { ShareActions } from "@/components/share/ShareActions";
import { performCheckInAction, type CheckInActionState } from "./actions";
import type { CheckInResult } from "@/server/services/checkin.service";

const initialState: CheckInActionState = { status: "idle" };

function buildShareContent(r: CheckInResult): { headline: string; subline: string } {
  if (r.evolved) {
    return { headline: "Meu Spark evoluiu! 🎉", subline: r.evolutionName };
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

export function CheckInScreen({
  token,
  eventName,
  eventDate,
  eventTime,
  alreadyCheckedIn,
  userName,
}: {
  token: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  alreadyCheckedIn: boolean;
  userName: string;
}) {
  const [state, formAction, isPending] = useActionState(performCheckInAction, initialState);

  if (state.status === "success") {
    const r = state.result;

    if (r.alreadyCheckedIn) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <p className="text-4xl">✅</p>
          <p className="text-sm text-white/60">Você já fez check-in em {r.eventName}.</p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white"
          >
            Voltar para o pet
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="text-3xl">✨</p>
        <p className="font-pixel text-xs text-emerald-400">XP GANHO!</p>
        <p className="text-3xl font-bold">+{r.xpEarned} XP</p>

        <div className="flex gap-4 text-sm text-white/70">
          <span>❤️ +{r.energyGained} Energia</span>
          <span>😊 +{r.happinessGained} Felicidade</span>
        </div>

        {r.streakBonusXp > 0 && (
          <p className="text-sm text-orange-300">
            🔥 Bônus de sequência ({r.streak}): +{r.streakBonusXp} XP
          </p>
        )}

        {r.leveledUp && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="text-3xl">🎉</p>
            <p className="font-pixel text-xs text-yellow-300">LEVEL UP!</p>
            <p className="text-sm text-white/70">Nível {r.newLevel}</p>
          </div>
        )}

        {r.evolved && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <PetSprite spriteKey={r.spriteKey} size="md" />
            <p className="text-sm text-white/70">Seu pet evoluiu para {r.evolutionName}!</p>
          </div>
        )}

        {r.newItems.length > 0 && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="font-pixel text-xs text-emerald-400">ITEM DESBLOQUEADO!</p>
            {r.newItems.map((item) => (
              <p key={item.id} className="text-sm text-white/70">
                ✨ {item.name}
              </p>
            ))}
          </div>
        )}

        {r.newAchievements.length > 0 && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <p className="font-pixel text-xs text-yellow-300">CONQUISTA DESBLOQUEADA!</p>
            {r.newAchievements.map((achievement) => (
              <p key={achievement.id} className="text-sm text-white/70">
                {achievement.icon} {achievement.name}
              </p>
            ))}
          </div>
        )}

        <p className="mt-2 max-w-xs text-sm text-white/70">
          Seu pet ficou feliz porque você voltou! 🐾
        </p>

        <div className="mt-6 border-t border-white/10 pt-6">
          <ShareActions
            petName={userName}
            spriteKey={r.spriteKey}
            level={r.newLevel}
            streak={r.streak}
            {...buildShareContent(r)}
          />
        </div>

        <Link
          href="/"
          className="mt-4 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-black"
        >
          Ver meu Spark
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-emerald-400">🔥 CHECK-IN ENCONTRADO</p>

      <div>
        <h1 className="text-xl font-bold">{eventName}</h1>
        <p className="mt-1 text-sm text-white/60">
          {eventDate} · {eventTime}
        </p>
      </div>

      {alreadyCheckedIn ? (
        <p className="text-sm text-white/60">Você já fez check-in neste evento. ✅</p>
      ) : (
        <form action={formAction} className="flex flex-col items-center gap-3">
          <input type="hidden" name="token" value={token} />
          {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-black disabled:opacity-60"
          >
            {isPending ? "Confirmando..." : "FAZER CHECK-IN"}
          </button>
        </form>
      )}

      <Link href="/" className="text-sm text-white/50 underline underline-offset-2">
        Voltar para o pet
      </Link>
    </div>
  );
}
