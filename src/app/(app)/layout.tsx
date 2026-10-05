import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/server/auth/auth";
import { getCurrentUser } from "@/server/auth/context";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallButton } from "@/components/layout/InstallButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/session-ended");
  }
  if (user.role === "SUPER_ADMIN") {
    redirect("/platform");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-pixel text-xs text-emerald-400">MOVEGO</span>
          {user.church && <span className="truncate text-[10px] text-white/40">{user.church.name}</span>}
        </div>
        <div className="flex items-center gap-3">
          <InstallButton />
          {user.role === "ADMIN" && (
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
