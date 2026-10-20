import { NextResponse } from "next/server";

import { createRoom } from "@/lib/server/room-store";
import type { GameConfig } from "@/lib/games/impostor/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    hostName?: string;
    config?: GameConfig;
  } | null;

  const hostName = body?.hostName?.trim();
  if (!hostName) {
    return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  }

  const { code, playerId } = await createRoom(hostName, body?.config);
  return NextResponse.json({ code, playerId });
}
