import { notFound } from "next/navigation";
import Image from "next/image";
import { getEventById } from "@/server/services/event.service";
import { buildCheckInUrl } from "@/lib/qrcode/generate";
import { NotFoundError } from "@/server/errors";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function EventQrCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event;
  try {
    event = await getEventById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const checkInUrl = buildCheckInUrl(baseUrl, event.qrCodeToken);

  return (
    <div className="flex flex-col items-center gap-4 print:gap-6">
      <h1 className="text-lg font-bold print:text-black">{event.name}</h1>

      <Image
        src={`/api/qrcode/${event.id}`}
        alt={`QR Code de check-in para ${event.name}`}
        width={320}
        height={320}
        unoptimized
        className="rounded-lg bg-white p-4"
      />

      <p className="max-w-xs break-all text-center text-xs text-white/50 print:text-black">{checkInUrl}</p>

      <div className="flex gap-3 print:hidden">
        <a
          href={`/api/qrcode/${event.id}?download=1`}
          download={`qrcode-${event.name}.png`}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm"
        >
          Baixar PNG
        </a>
        <PrintButton />
      </div>
    </div>
  );
}
