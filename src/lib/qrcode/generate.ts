import "server-only";
import QRCode from "qrcode";

/** Gera o PNG (Buffer) do QR Code para um link de check-in. Uso: admin-only. */
export async function generateCheckInQrPng(checkInUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(checkInUrl, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}

export function buildCheckInUrl(baseUrl: string, qrCodeToken: string): string {
  return `${baseUrl.replace(/\/$/, "")}/checkin/${qrCodeToken}`;
}
