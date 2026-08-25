import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-4xl">🥚</p>
        <h1 className="font-pixel mt-3 text-lg text-emerald-400">MOVEGO</h1>
        <p className="mt-2 text-xs font-semibold text-white/70">Faça check-in. Ganhe XP. Evolua. 🚀</p>
        <p className="mt-1 text-sm text-white/60">Crie sua conta e ganhe seu primeiro ovo.</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-white/60">
        Já tem conta?{" "}
        <Link href="/login" className="text-emerald-400 underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </div>
  );
}
