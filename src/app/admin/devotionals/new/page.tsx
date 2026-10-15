import { requireChurchAdmin } from "@/server/auth/context";
import { listItems } from "@/server/repositories/item.repository";
import { JourneyForm } from "../JourneyForm";
import { createJourneyAction } from "../actions";

export default async function NewJourneyPage() {
  await requireChurchAdmin();
  const items = await listItems();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Nova Jornada Devocional</h1>
        <p className="text-xs text-white/60">Configure o período e o objetivo da campanha diária.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs">
        <h2 className="font-bold text-emerald-300">Como funciona o cadastro?</h2>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/70">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <span className="font-bold text-emerald-400">1. Configuração Geral (Agora):</span>
            <p className="mt-1 text-white/80">
              Defina o tema, quantos dias irá durar a jornada e a data de início.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <span className="font-bold text-white">2. Cadastro Dia a Dia (Próxima tela):</span>
            <p className="mt-1 text-white/80">
              Você será direcionado para cadastrar as <b>tarefas diárias</b>, <b>versículos de leitura</b> e o <b>texto base</b> de cada dia (Dia 1, 2, 3...).
            </p>
          </div>
        </div>
      </div>

      <JourneyForm
        action={createJourneyAction}
        submitLabel="Criar Jornada e Cadastrar o Dia 1 ➔"
        items={items}
      />
    </div>
  );
}
