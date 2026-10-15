import Link from "next/link";
import { requireMember } from "@/server/auth/context";
import { getUserActiveJourney } from "@/server/services/devotional.service";
import { DevotionalClient } from "@/components/devotional/DevotionalClient";

export default async function DevotionalPage() {
  const user = await requireMember();
  const overview = await getUserActiveJourney(user.userId, user.churchId);

  if (!overview) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="text-5xl">📖</span>
        <h1 className="text-lg font-bold text-white">Nenhum Devocional Ativo</h1>
        <p className="max-w-xs text-xs text-white/60">
          A sua igreja ainda não possui uma campanha de devocional diário ativa no momento.
          Fique ligado nos próximos avisos dos cultos!
        </p>
        <Link
          href="/"
          className="mt-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
        >
          ← Voltar para o meu pet
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <DevotionalClient overview={overview} />
    </div>
  );
}
