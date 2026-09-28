import "server-only";
import QRCode from "qrcode";

/** Gera o PNG (Buffer) de um QR Code para a URL informada. Uso: admin-only. */
export async function generateQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}

export function buildCheckInUrl(baseUrl: string, qrCodeToken: string): string {
  return `${baseUrl.replace(/\/$/, "")}/checkin/${qrCodeToken}`;
}

export function buildInviteUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/invite/${token}`;
}
