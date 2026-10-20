import { NextResponse } from "next/server";

import { joinRoom } from "@/lib/server/room-store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;

  const result = await joinRoom(code, body?.name ?? "");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ playerId: result.playerId });
}
