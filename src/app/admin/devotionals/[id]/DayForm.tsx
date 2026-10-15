"use client";

import { useActionState } from "react";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import type { DayFormState } from "../actions";

export function DayForm({
  action,
  dayNumber,
  defaultValues,
}: {
  action: (prevState: DayFormState, formData: FormData) => Promise<DayFormState>;
  dayNumber: number;
  defaultValues?: {
    title: string;
    bibleVerse: string;
    content: string;
    taskPrompt: string;
    xpReward: number;
    happinessReward: number;
  };
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <input type="hidden" name="dayNumber" value={dayNumber} />

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-white/70">
          Título do Dia {dayNumber}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="ex: O Poder da Oração em Segredo"
          defaultValue={defaultValues?.title ?? `Dia ${dayNumber}`}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bibleVerse" className="text-sm text-white/70">
          Passagem / Versículo Bíblico
        </label>
        <input
          id="bibleVerse"
          name="bibleVerse"
          type="text"
          placeholder="ex: Mateus 6:6 ou Filipenses 4:6-7"
          defaultValue={defaultValues?.bibleVerse}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm text-white/70">
          Conteúdo do Devocional / Reflexão
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          placeholder="Escreva a mensagem ou reflexão para os jovens lerem..."
          defaultValue={defaultValues?.content}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="taskPrompt" className="text-sm text-white/70">
          Desafio Prático do Dia
        </label>
        <input
          id="taskPrompt"
          name="taskPrompt"
          type="text"
          placeholder="ex: Separe 10 minutos hoje para orar por 3 amigos"
          defaultValue={defaultValues?.taskPrompt}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="xpReward" className="text-sm text-white/70">
            XP ao Concluir
          </label>
          <input
            id="xpReward"
            name="xpReward"
            type="number"
            min={0}
            defaultValue={defaultValues?.xpReward ?? 20}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="happinessReward" className="text-sm text-white/70">
            Felicidade do Pet (+😊)
          </label>
          <input
            id="happinessReward"
            name="happinessReward"
            type="number"
            min={0}
            max={100}
            defaultValue={defaultValues?.happinessReward ?? 10}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <ConfirmSubmitButton
        label="Salvar Conteúdo do Dia"
        pendingLabel="Salvando..."
        className="mt-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-base font-semibold text-black hover:bg-emerald-400"
      />
    </form>
  );
}
