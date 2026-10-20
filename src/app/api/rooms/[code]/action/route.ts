import { NextResponse } from "next/server";

import { applyAction } from "@/lib/server/room-store";
import type { RoomAction } from "@/lib/games/impostor/online/types";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = (await request.json().catch(() => null)) as {
    playerId?: string;
    action?: RoomAction;
  } | null;

  if (!body?.playerId || !body?.action) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const result = await applyAction(code, body.playerId, body.action);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ view: result.view ?? null });
}
