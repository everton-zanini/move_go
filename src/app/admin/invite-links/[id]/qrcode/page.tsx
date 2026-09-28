import { notFound } from "next/navigation";
import Image from "next/image";
import { getInviteLinkById } from "@/server/services/invite-link.service";
import { buildInviteUrl } from "@/lib/qrcode/generate";
import { NotFoundError } from "@/server/errors";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function InviteLinkQrCodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let link;
  try {
    link = await getInviteLinkById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = buildInviteUrl(baseUrl, link.token);

  return (
    <div className="flex flex-col items-center gap-4 print:gap-6">
      <h1 className="text-lg font-bold print:text-black">{link.label || "Link de cadastro"}</h1>

      <Image
        src={`/api/qrcode/invite-links/${link.id}`}
        alt="QR Code de cadastro"
        width={320}
        height={320}
        unoptimized
        className="rounded-lg bg-white p-4"
      />

      <p className="max-w-xs break-all text-center text-xs text-white/50 print:text-black">{inviteUrl}</p>

      <div className="flex gap-3 print:hidden">
        <a
          href={`/api/qrcode/invite-links/${link.id}?download=1`}
          download={`qrcode-cadastro-${link.id}.png`}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm"
        >
          Baixar PNG
        </a>
        <PrintButton />
      </div>
    </div>
  );
}
