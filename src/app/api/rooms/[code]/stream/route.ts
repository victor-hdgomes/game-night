import {
  getView,
  loadRoom,
  storageKind,
  subscribeRoom,
} from "@/lib/server/room-store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Com Redis não há pub/sub: o stream relê a sala neste intervalo. */
const POLL_MS = 2000;
const HEARTBEAT_MS = 25_000;

/**
 * Server-Sent Events: cada celular abre um stream e recebe a visão dele
 * sempre que a sala muda de versão.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const playerId = new URL(request.url).searchParams.get("playerId") ?? "";

  const room = await loadRoom(code);
  if (!room) {
    return new Response("Sala não encontrada ou expirada.", { status: 404 });
  }
  if (!room.state.players.some((p) => p.id === playerId)) {
    return new Response("Você não está nessa sala.", { status: 403 });
  }

  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let poll: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let lastVersion = -1;

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

      const cleanup = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
        if (poll) clearInterval(poll);
        try {
          controller.close();
        } catch {
          // já fechado pelo cliente
        }
      };

      const push = async (force = false) => {
        if (closed) return;
        const view = await getView(code, playerId);
        if (!view) {
          send("gone", { reason: "expired" });
          cleanup();
          return;
        }
        if (!force && view.state.version === lastVersion) return;
        lastVersion = view.state.version;
        send("state", view);
      };

      void push(true);
      unsubscribe = subscribeRoom(code, () => void push());
      if (storageKind === "redis") {
        poll = setInterval(() => void push(), POLL_MS);
      }
      heartbeat = setInterval(() => send("ping", Date.now()), HEARTBEAT_MS);
      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
      if (poll) clearInterval(poll);
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
