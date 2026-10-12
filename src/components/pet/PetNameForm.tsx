"use client";

import { useActionState, useEffect, useState } from "react";
import { renamePetAction, type PetNameState } from "@/app/(app)/actions";
import { PetSprite } from "@/components/pet/PetSprite";
import { getPetTheme } from "@/lib/game/pet-theme";
import { toast } from "@/components/ui/Toaster";
import type { SelectableLine } from "@/server/services/pet.service";

const initialState: PetNameState = {};

export function PetNameForm({ lines }: { lines: SelectableLine[] }) {
  const [state, formAction, isPending] = useActionState(renamePetAction, initialState);
  const [selectedId, setSelectedId] = useState(lines[0]?.speciesId ?? "");
  const selectedLine = lines.find((line) => line.speciesId === selectedId);
  const selectedTheme = selectedLine ? getPetTheme(selectedLine.spriteKey) : null;

  useEffect(() => {
    if (state?.saved) toast("Nome do pet salvo!");
  }, [state]);

  return (
    <div className="w-full max-w-xs rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-center">
      <p className="text-sm font-semibold">Seu pet já tem forma própria! 🎉</p>
      <p className="mt-1 text-xs text-white/70">
        Escolha a linha do seu companheiro e dê um nome pra ele. Essa escolha é definitiva.
      </p>

      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="speciesId" value={selectedId} />

        <div className="flex flex-wrap justify-center gap-2">
          {lines.map((line) => {
            const selected = line.speciesId === selectedId;
            const theme = getPetTheme(line.spriteKey);
            return (
              <button
                key={line.speciesId}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedId(line.speciesId)}
                style={{ "--accent": theme.accent } as React.CSSProperties}
                className={`flex min-h-11 flex-col items-center gap-1 rounded-xl border-2 p-1 transition ${
                  selected ? "border-[var(--accent)] bg-white/10" : "border-transparent opacity-70"
                }`}
              >
                <PetSprite spriteKey={line.spriteKey} size="md" />
                <span className="text-xs font-semibold">{line.speciesName}</span>
                <span className="text-xs text-white/70">{theme.element}</span>
              </button>
            );
          })}
        </div>

        {selectedTheme && <p className="text-xs text-white/80">{selectedTheme.description}</p>}

        <input
          name="nickname"
          type="text"
          required
          maxLength={20}
          placeholder="Nome do seu pet"
          aria-label="Nome do seu pet"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-sm outline-none focus:border-emerald-400"
        />
        {state?.error && (
          <p role="alert" className="text-xs text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Confirmar escolha"}
        </button>
      </form>
    </div>
  );
}
