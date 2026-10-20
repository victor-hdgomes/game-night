import { getRoom, subscribe, viewFor } from "@/lib/server/room-store";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events: cada celular abre um stream e recebe a visão dele
 * sempre que a sala muda. Heartbeat a cada 25s segura a conexão.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const playerId = new URL(request.url).searchParams.get("playerId") ?? "";

  const room = getRoom(code);
  if (!room) {
    return new Response("Sala não encontrada ou expirada.", { status: 404 });
  }
  if (!viewFor(room, playerId)) {
    return new Response("Você não está nessa sala.", { status: 403 });
  }

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      };

      const push = () => {
        const current = getRoom(code);
        if (!current) {
          send("gone", { reason: "expired" });
          cleanup();
          return;
        }
        const view = viewFor(current, playerId);
        if (!view) {
          send("gone", { reason: "removed" });
          cleanup();
          return;
        }
        send("state", view);
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // já fechado pelo cliente
        }
      };

      push();
      unsubscribe = subscribe(code, push);
      heartbeat = setInterval(() => send("ping", Date.now()), 25_000);
      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
