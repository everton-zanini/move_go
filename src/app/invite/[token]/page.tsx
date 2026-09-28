import Link from "next/link";
import { validateInviteToken } from "@/server/services/invite-link.service";
import { InviteLinkExpiredError, InviteLinkInactiveError, InviteLinkNotFoundError } from "@/server/errors";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  try {
    await validateInviteToken(token);
  } catch (error) {
    if (
      error instanceof InviteLinkNotFoundError ||
      error instanceof InviteLinkExpiredError ||
      error instanceof InviteLinkInactiveError
    ) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-4xl">🔒</p>
          <h1 className="text-lg font-bold">Link inválido</h1>
          <p className="max-w-xs text-sm text-white/60">{error.message}</p>
          <Link href="/login" className="mt-2 text-sm text-emerald-400 underline underline-offset-2">
            Já tenho conta
          </Link>
        </main>
      );
    }
    throw error;
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <p className="text-4xl">🥚</p>
          <h1 className="font-pixel mt-3 text-lg text-emerald-400">MOVEGO</h1>
          <p className="mt-2 text-xs font-semibold text-white/70">Faça check-in. Ganhe XP. Evolua. 🚀</p>
          <p className="mt-1 text-sm text-white/60">Crie sua conta e ganhe seu primeiro ovo.</p>
        </div>

        <RegisterForm token={token} />

        <p className="text-center text-sm text-white/60">
          Já tem conta?{" "}
          <Link href="/login" className="text-emerald-400 underline underline-offset-2">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
