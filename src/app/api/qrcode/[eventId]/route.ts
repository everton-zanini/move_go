import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { getQrCodeImage } from "@/server/services/event.service";
import { NotFoundError } from "@/server/errors";

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { eventId } = await params;

  try {
    const png = await getQrCodeImage(eventId);
    const download = request.nextUrl.searchParams.get("download");

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        ...(download ? { "Content-Disposition": `attachment; filename="qrcode-${eventId}.png"` } : {}),
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
