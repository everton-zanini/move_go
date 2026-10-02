import { signOut } from "@/server/auth/auth";
import { withFlash } from "@/lib/flash";

/** Encerra a sessão de usuário desativado (cookie só pode ser limpo em route handler/action). */
export async function GET() {
  await signOut({ redirectTo: withFlash("/login", "Sua conta está desativada.", "error") });
}
