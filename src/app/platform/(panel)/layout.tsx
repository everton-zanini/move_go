import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/server/auth/auth";
import { getCurrentUser } from "@/server/auth/context";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/platform/login");
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/session-ended");
  }
  if (user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-pixel text-xs text-emerald-400">MOVEGO · PLATAFORMA</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/platform/login" });
          }}
        >
          <button type="submit" className="text-sm text-white/50 hover:text-white">
            Sair
          </button>
        </form>
      </header>
      <nav className="flex gap-1 border-b border-white/10 px-4 py-2 text-sm">
        <Link href="/platform" className="rounded-md px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
          Igrejas
        </Link>
      </nav>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
