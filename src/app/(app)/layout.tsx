import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/server/auth/auth";
import { isUserActive } from "@/server/auth/active";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallButton } from "@/components/layout/InstallButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  if (!(await isUserActive(session.user.id))) {
    redirect("/api/session-ended");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-pixel text-xs text-emerald-400">MOVEGO</span>
        <div className="flex items-center gap-3">
          <InstallButton />
          {session.user.role === "ADMIN" && (
            <Link href="/admin" className="text-sm text-white/50 hover:text-white">
              Admin
            </Link>
          )}
          <SignOutForm />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}

function SignOutForm() {
  return (
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
  );
}
