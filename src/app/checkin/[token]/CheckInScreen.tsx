"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckInReward } from "@/components/checkin/CheckInReward";
import { performCheckInAction, type CheckInActionState } from "./actions";

const initialState: CheckInActionState = { status: "idle" };

export function CheckInScreen({
  token,
  eventName,
  eventDate,
  eventTime,
  alreadyCheckedIn,
  userName,
  autoConfirm,
}: {
  token: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  alreadyCheckedIn: boolean;
  userName: string;
  autoConfirm: boolean;
}) {
  const [state, formAction, isPending] = useActionState(performCheckInAction, initialState);
  const autoSubmitted = useRef(false);

  // QR lido dentro do app: confirma direto, sem pedir um segundo toque. O servidor segue sendo
  // quem valida janela, igreja e duplicidade (performCheckIn é idempotente).
  useEffect(() => {
    if (!autoConfirm || alreadyCheckedIn || autoSubmitted.current) return;
    autoSubmitted.current = true;
    const formData = new FormData();
    formData.set("token", token);
    startTransition(() => formAction(formData));
  }, [autoConfirm, alreadyCheckedIn, token, formAction]);

  if (state.status === "success") {
    const r = state.result;

    if (r.alreadyCheckedIn) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <p className="text-4xl">✅</p>
          <p className="text-sm text-white/70">Você já fez check-in em {r.eventName}.</p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white"
          >
            Voltar para o pet
          </Link>
        </div>
      );
    }

    return <CheckInReward result={r} userName={userName} />;
  }

  if (autoConfirm && !alreadyCheckedIn && state.status === "idle") {
    return (
      <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl motion-safe:animate-bounce">🥚</p>
        <p className="text-sm text-white/80">Confirmando seu check-in em {eventName}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-emerald-400">🔥 CHECK-IN ENCONTRADO</p>

      <div>
        <h1 className="text-xl font-bold">{eventName}</h1>
        <p className="mt-1 text-sm text-white/70">
          {eventDate} · {eventTime}
        </p>
      </div>

      {alreadyCheckedIn ? (
        <p className="text-sm text-white/70">Você já fez check-in neste evento. ✅</p>
      ) : (
        <form action={formAction} className="flex flex-col items-center gap-3">
          <input type="hidden" name="token" value={token} />
          {state.status === "error" && <p className="text-sm text-red-400" role="alert">{state.message}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-black disabled:opacity-60"
          >
            {isPending ? "Confirmando..." : "FAZER CHECK-IN"}
          </button>
        </form>
      )}

      <Link href="/" className="text-sm text-white/70 underline underline-offset-2 inline-flex min-h-11 items-center">
        Voltar para o pet
      </Link>
    </div>
  );
}
