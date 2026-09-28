import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <p className="text-4xl">🔒</p>
      <h1 className="font-pixel text-lg text-emerald-400">CADASTRO POR CONVITE</h1>
      <p className="text-sm text-white/60">
        O cadastro no MoveGO é feito através de um link de convite enviado pela organização do evento.
      </p>
      <p className="text-sm text-white/60">Peça um link válido a um administrador para criar sua conta.</p>
      <Link href="/login" className="text-emerald-400 underline underline-offset-2">
        Já tenho conta
      </Link>
    </div>
  );
}
