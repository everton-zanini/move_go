"use client";

import { useActionState } from "react";
import {
  debugAddXpAction,
  debugRedoLineChoiceAction,
  debugResetPetAction,
  debugUnlockFoneAction,
  debugUnlockOculosAction,
  type DebugActionState,
} from "@/app/(app)/actions";

const initialState: DebugActionState = {};

export function DebugPanel() {
  const [xpState, xpAction, xpPending] = useActionState(debugAddXpAction, initialState);
  const [resetState, resetAction, resetPending] = useActionState(debugResetPetAction, initialState);
  const [lineState, lineAction, linePending] = useActionState(debugRedoLineChoiceAction, initialState);
  const [foneState, foneAction, fonePending] = useActionState(debugUnlockFoneAction, initialState);
  const [oculosState, oculosAction, oculosPending] = useActionState(debugUnlockOculosAction, initialState);

  const message = xpState.message ?? resetState.message ?? lineState.message ?? foneState.message ?? oculosState.message;

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2 rounded-lg border border-dashed border-yellow-400/40 p-3">
      <p className="text-center text-[10px] font-pixel text-yellow-400">MODO DEBUG (ADMIN)</p>
      <div className="flex flex-wrap justify-center gap-2">
        <form action={xpAction}>
          <button
            type="submit"
            disabled={xpPending}
            className="rounded-lg bg-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-60"
          >
            {xpPending ? "..." : "⚡ +XP próxima fase"}
          </button>
        </form>
        <form
          action={resetAction}
          onSubmit={(event) => {
            if (!window.confirm("Resetar este pet para o estágio inicial?")) {
              event.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            disabled={resetPending}
            className="rounded-lg bg-red-400/20 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-60"
          >
            {resetPending ? "..." : "♻️ Resetar pet"}
          </button>
        </form>
        <form action={lineAction}>
          <button
            type="submit"
            disabled={linePending}
            className="rounded-lg bg-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-60"
          >
            {linePending ? "..." : "🐺 Refazer escolha de linha"}
          </button>
        </form>
        <form action={foneAction}>
          <button
            type="submit"
            disabled={fonePending}
            className="rounded-lg bg-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-60"
          >
            {fonePending ? "..." : "🎧 Liberar Fone"}
          </button>
        </form>
        <form action={oculosAction}>
          <button
            type="submit"
            disabled={oculosPending}
            className="rounded-lg bg-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-200 disabled:opacity-60"
          >
            {oculosPending ? "..." : "🕶️ Liberar Óculos"}
          </button>
        </form>
      </div>
      {message && <p className="text-center text-xs text-white/60">{message}</p>}
    </div>
  );
}
