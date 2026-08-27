"use client";

import { useActionState } from "react";
import {
  debugAddXpAction,
  debugResetPetAction,
  type DebugActionState,
} from "@/app/(app)/actions";

const initialState: DebugActionState = {};

export function DebugPanel() {
  const [xpState, xpAction, xpPending] = useActionState(debugAddXpAction, initialState);
  const [resetState, resetAction, resetPending] = useActionState(debugResetPetAction, initialState);

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2 rounded-lg border border-dashed border-yellow-400/40 p-3">
      <p className="text-center text-[10px] font-pixel text-yellow-400">MODO DEBUG (ADMIN)</p>
      <div className="flex gap-2">
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
      </div>
      {(xpState.message || resetState.message) && (
        <p className="text-center text-xs text-white/60">{xpState.message ?? resetState.message}</p>
      )}
    </div>
  );
}
