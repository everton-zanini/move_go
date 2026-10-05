import { Suspense } from "react";
import { LoginForm } from "@/app/(public)/login/LoginForm";

export default function PlatformLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="font-pixel text-lg text-emerald-400">MOVEGO</h1>
          <p className="mt-2 text-sm text-white/60">Painel da plataforma</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
