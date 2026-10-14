import { NextResponse } from "next/server";
import { sendDailyEventReminders } from "@/server/services/push-notification.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await sendDailyEventReminders();
    return NextResponse.json({
      status: "ok",
      eventsProcessed: result.eventsProcessed,
    });
  } catch (error) {
    console.error("[Cron:EventReminders] Erro ao enviar lembretes:", error);
    return NextResponse.json({ error: "Erro interno ao processar lembretes." }, { status: 500 });
  }
}
