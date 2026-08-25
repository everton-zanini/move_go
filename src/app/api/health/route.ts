import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.configEntry.count();
    return NextResponse.json({ status: "ok", db: true });
  } catch {
    return NextResponse.json({ status: "error", db: false }, { status: 500 });
  }
}
