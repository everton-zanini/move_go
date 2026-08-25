import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-4xl">🥚</p>
        <h1 className="font-pixel mt-3 text-lg text-emerald-400">MOVEGO</h1>
        <p className="mt-2 text-xs font-semibold text-white/70">Faça check-in. Ganhe XP. Evolua. 🚀</p>
        <p className="mt-1 text-sm text-white/60">Entre para ver seu pet.</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-white/60">
        Não tem conta?{" "}
        <Link href="/register" className="text-emerald-400 underline underline-offset-2">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
