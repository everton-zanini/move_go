"use client";

import { useActionState } from "react";
import type { DayFormState } from "../actions";

export function DayForm({
  action,
  dayNumber,
  hasNextDay = false,
  defaultValues,
}: {
  action: (prevState: DayFormState, formData: FormData) => Promise<DayFormState>;
  dayNumber: number;
  hasNextDay?: boolean;
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
    <form action={formAction} className="flex max-w-xl flex-col gap-5 text-left">
      <input type="hidden" name="dayNumber" value={dayNumber} />

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-semibold text-white">
          Título do Dia {dayNumber}
        </label>
        <span className="text-[11px] text-white/50">
          Um tema curto e chamativo para a leitura deste dia.
        </span>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="ex: O Poder da Oração em Segredo"
          defaultValue={defaultValues?.title ?? `Dia ${dayNumber}`}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base text-white outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bibleVerse" className="text-sm font-semibold text-emerald-300">
          📖 Versículos Bíblicos para Leitura
        </label>
        <span className="text-[11px] text-white/50">
          A passagem ou referências bíblicas que o jovem deve abrir e ler.
        </span>
        <input
          id="bibleVerse"
          name="bibleVerse"
          type="text"
          placeholder="ex: Mateus 6:6-13 ou Filipenses 4:6-7"
          defaultValue={defaultValues?.bibleVerse}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-base text-emerald-100 placeholder-emerald-100/30 outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-sm font-semibold text-white">
          ✍️ Texto Base / Estudo / Reflexão
        </label>
        <span className="text-[11px] text-white/50">
          A mensagem que acompanha os versículos para o jovem ler e meditar.
        </span>
        <textarea
          id="content"
          name="content"
          rows={7}
          required
          placeholder="Escreva a mensagem ou reflexão para os jovens lerem..."
          defaultValue={defaultValues?.content}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-base text-white placeholder-white/30 outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="taskPrompt" className="text-sm font-semibold text-yellow-300">
          🎯 Tarefa / Desafio Prático do Dia
        </label>
        <span className="text-[11px] text-white/50">
          A ação prática que o jovem deve cumprir após a leitura (motivo de oração, atitude, etc.).
        </span>
        <input
          id="taskPrompt"
          name="taskPrompt"
          type="text"
          placeholder="ex: Separe 10 minutos hoje para orar por 3 amigos e mande uma mensagem"
          defaultValue={defaultValues?.taskPrompt}
          className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-base text-yellow-100 placeholder-yellow-100/30 outline-none focus:border-yellow-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="xpReward" className="text-sm text-white/70">
            XP Ganho (se lido no dia)
          </label>
          <input
            id="xpReward"
            name="xpReward"
            type="number"
            min={0}
            defaultValue={defaultValues?.xpReward ?? 20}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
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
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="goToNextDay"
          value="false"
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-emerald-400"
        >
          Salvar Este Dia
        </button>

        {hasNextDay && (
          <button
            type="submit"
            name="goToNextDay"
            value="true"
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-5 py-2.5 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-500/30"
          >
            Salvar e Ir para o Próximo Dia ➔
          </button>
        )}
      </div>
    </form>
  );
}
