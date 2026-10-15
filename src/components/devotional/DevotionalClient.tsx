"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBR } from "@/lib/datetime";
import { ptBR } from "date-fns/locale";
import type { UserJourneyOverview, DevotionalCheckInResult } from "@/server/services/devotional.service";
import { completeDevotionalAction } from "@/app/(app)/devotional/actions";

export function DevotionalClient({ overview }: { overview: UserJourneyOverview }) {
  const { journey, days, completedCount, todayDayNumber } = overview;

  // Seleciona por padrão o dia de hoje, ou o primeiro dia liberado ainda não concluído
  const defaultDay =
    todayDayNumber ??
    days.find((d) => d.isUnlocked && !d.completed)?.dayNumber ??
    1;

  const [selectedDayNumber, setSelectedDayNumber] = useState(defaultDay);
  const [userNote, setUserNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completionResult, setCompletionResult] = useState<DevotionalCheckInResult | null>(null);

  const selectedDay = days.find((d) => d.dayNumber === selectedDayNumber) ?? days[0];

  const percentCompleted = Math.round((completedCount / journey.totalDays) * 100);

  async function handleComplete() {
    if (!selectedDay.day) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await completeDevotionalAction({
      devotionalDayId: selectedDay.day.id,
      userNote: userNote.trim() || undefined,
    });

    setSubmitting(false);

    if (res.success && res.result) {
      setCompletionResult(res.result);
      selectedDay.completed = true;
      selectedDay.checkIn = {
        completedAt: new Date(),
        earnedXp: res.result.earnedXp,
        userNote: userNote.trim() || null,
      };
    } else {
      setErrorMessage(res.error ?? "Erro ao concluir devocional.");
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header com Progresso Geral */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              JORNADA DEVOCIONAL
            </span>
            <h1 className="mt-1 text-lg font-bold text-white">{journey.title}</h1>
            {journey.description && (
              <p className="mt-0.5 text-xs text-white/60">{journey.description}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{percentCompleted}%</span>
            <p className="text-[10px] text-white/50">
              {completedCount} de {journey.totalDays} dias
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Linha do Tempo dos Dias (Scroll Horizontal) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Linha do Tempo
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((d) => {
            const isSelected = d.dayNumber === selectedDayNumber;

            let badgeColor = "border-white/10 bg-white/5 text-white/50";
            let statusIcon = "";

            if (d.completed) {
              badgeColor = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
              statusIcon = "✓";
            } else if (d.isToday) {
              badgeColor = "border-emerald-400 bg-emerald-500/20 text-white shadow-md shadow-emerald-500/20";
              statusIcon = "HOJE";
            } else if (d.isPast) {
              badgeColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
              statusIcon = "•";
            } else if (d.isFuture) {
              badgeColor = "border-white/5 bg-white/[0.02] text-white/30";
              statusIcon = "🔒";
            }

            return (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => {
                  setSelectedDayNumber(d.dayNumber);
                  setErrorMessage(null);
                  setUserNote("");
                }}
                className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-3.5 py-2.5 transition-all ${badgeColor} ${
                  isSelected ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0f0f1a]" : ""
                }`}
              >
                <span className="text-[10px] uppercase font-bold">Dia {d.dayNumber}</span>
                <span className="mt-1 text-xs font-semibold">{statusIcon}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo do Dia Selecionado */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
              Dia {selectedDay.dayNumber}
            </span>
            <span className="text-xs text-white/50">
              {formatBR(selectedDay.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          <div>
            {selectedDay.completed && (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                ✅ Concluído
              </span>
            )}
            {!selectedDay.completed && selectedDay.isToday && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-black">
                🌟 Disponível Hoje (+{selectedDay.day?.xpReward ?? 20} XP)
              </span>
            )}
            {!selectedDay.completed && selectedDay.isPast && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                📖 Leitura liberada (sem XP)
              </span>
            )}
            {selectedDay.isFuture && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/50">
                🔒 Bloqueado até {formatBR(selectedDay.date, "dd/MM")}
              </span>
            )}
          </div>
        </div>

        {/* Se for dia futuro (bloqueado) */}
        {selectedDay.isFuture && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-white/60">
            <span className="text-4xl">🔒</span>
            <p className="mt-3 text-base font-semibold text-white">Este dia ainda não chegou!</p>
            <p className="mt-1 max-w-xs text-xs text-white/50">
              O conteúdo do Dia {selectedDay.dayNumber} será liberado em{" "}
              {formatBR(selectedDay.date, "dd/MM/yyyy")}. Volte amanhã para continuar sua jornada!
            </p>
          </div>
        )}

        {/* Se for dia liberado (passado ou hoje) */}
        {selectedDay.isUnlocked && (
          <div className="mt-5 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedDay.day?.title ?? `Dia ${selectedDay.dayNumber}`}
              </h2>
            </div>

            {/* Versículo Bíblico */}
            {selectedDay.day?.bibleVerse && (
              <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  📖 Palavra do Dia
                </span>
                <p className="mt-1 text-base font-medium italic text-emerald-100">
                  &ldquo;{selectedDay.day.bibleVerse}&rdquo;
                </p>
              </div>
            )}

            {/* Texto Devocional */}
            <div className="whitespace-pre-line text-sm leading-relaxed text-white/80">
              {selectedDay.day?.content ?? "Nenhum conteúdo cadastrado para este dia."}
            </div>

            {/* Desafio Prático */}
            {selectedDay.day?.taskPrompt && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Desafio Prático de Hoje
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedDay.day.taskPrompt}
                </p>
              </div>
            )}

            {/* Anotação Pessoal */}
            <div className="flex flex-col gap-2">
              <label htmlFor="userNote" className="text-xs font-semibold text-white/70">
                📝 Sua reflexão ou oração pessoal:
              </label>

              {selectedDay.completed ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs italic text-white/70">
                  {selectedDay.checkIn?.userNote || "Nenhuma reflexão anotada neste dia."}
                </div>
              ) : (
                <textarea
                  id="userNote"
                  rows={3}
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="O que Deus falou com você hoje? (Fica salvo de forma privada no seu histórico)"
                  className="rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white placeholder-white/30 outline-none focus:border-emerald-400"
                />
              )}
            </div>

            {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}

            {/* Botão de Conclusão */}
            {!selectedDay.completed && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting || !selectedDay.day}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {submitting
                  ? "Salvando..."
                  : selectedDay.isToday
                  ? `Concluir Dia ${selectedDay.dayNumber} (+${selectedDay.day?.xpReward ?? 20} XP) 🚀`
                  : `Concluir Leitura do Dia ${selectedDay.dayNumber} 📖`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Comemorativo de Conclusão */}
      {completionResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-[#151525] p-6 text-center text-white shadow-2xl">
            <span className="text-5xl">🎆</span>
            <h3 className="mt-3 text-lg font-black text-emerald-400">
              {completionResult.isJourneyCompleted
                ? "🏆 JORNADA CONCLUÍDA COM SUCESSO!"
                : "DEVOCIONAL CONCLUÍDO! 🚀"}
            </h3>

            <p className="mt-2 text-xs text-white/70">
              {completionResult.isDelayed
                ? "Você completou a leitura atrasada e alimentou a felicidade do seu pet!"
                : `Você completou o devocional de hoje! Ganhou +${completionResult.earnedXp} XP e +${completionResult.happinessEarned} de felicidade.`}
            </p>

            {completionResult.leveledUp && (
              <div className="mt-3 rounded-lg bg-emerald-500/20 p-2 text-xs font-bold text-emerald-300">
                🌟 Subiu para o Nível {completionResult.newLevel}!
              </div>
            )}

            {completionResult.evolved && (
              <div className="mt-2 rounded-lg bg-yellow-500/20 p-2 text-xs font-bold text-yellow-300">
                🐣 SEU PET EVOLUIU!
              </div>
            )}

            {completionResult.isJourneyCompleted && (
              <div className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-left">
                <p className="text-xs font-black uppercase text-yellow-400">
                  ⭐ Recompensa Suprema Desbloqueada!
                </p>
                {completionResult.bonusXpEarned > 0 && (
                  <p className="mt-1 text-xs text-white">
                    +{completionResult.bonusXpEarned} XP bônus de conclusão creditados!
                  </p>
                )}
                {completionResult.unlockedRewardItem && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Novo Cenário / Fundo: {completionResult.unlockedRewardItem.name}
                      </p>
                      <p className="text-[10px] text-white/60">
                        Disponível no seu inventário para equipar na tela!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              {completionResult.isJourneyCompleted && (
                <Link
                  href="/inventory"
                  className="rounded-xl bg-yellow-500 py-2.5 text-xs font-bold text-black hover:bg-yellow-400"
                >
                  🎒 Ir para o Inventário equipar meu fundo
                </Link>
              )}
              <button
                type="button"
                onClick={() => setCompletionResult(null)}
                className="rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
