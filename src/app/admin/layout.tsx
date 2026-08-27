import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/server/auth/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-pixel text-xs text-emerald-400">MOVEGO · ADMIN</span>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            ← Voltar
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-sm text-white/50 hover:text-white">
              Sair
            </button>
          </form>
        </div>
      </header>
      <nav className="flex gap-1 border-b border-white/10 px-4 py-2 text-sm">
        <Link href="/admin" className="rounded-md px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
          Dashboard
        </Link>
        <Link
          href="/admin/events"
          className="rounded-md px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white"
        >
          Eventos
        </Link>
        <Link href="/admin/users" className="rounded-md px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
          Usuários
        </Link>
      </nav>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
