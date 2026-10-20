"use client";

import * as React from "react";

import type { PlayerView, RoomAction } from "./types";

const PLAYER_KEY = (code: string) => `game-night:impostor:room:${code}`;

export function savePlayerId(code: string, playerId: string) {
  try {
    window.localStorage.setItem(PLAYER_KEY(code.toUpperCase()), playerId);
  } catch {
    // modo privado: segue sem lembrar o jogador
  }
}

export function readPlayerId(code: string): string | null {
  try {
    return window.localStorage.getItem(PLAYER_KEY(code.toUpperCase()));
  } catch {
    return null;
  }
}

export function forgetPlayerId(code: string) {
  try {
    window.localStorage.removeItem(PLAYER_KEY(code.toUpperCase()));
  } catch {
    // nada a fazer
  }
}

export async function createRoom(hostName: string) {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostName }),
  });
  const data = (await res.json()) as {
    code?: string;
    playerId?: string;
    error?: string;
  };
  if (!res.ok || !data.code || !data.playerId) {
    throw new Error(data.error ?? "Não deu para criar a sala.");
  }
  savePlayerId(data.code, data.playerId);
  return data as { code: string; playerId: string };
}

export async function joinRoom(code: string, name: string) {
  const clean = code.trim().toUpperCase();
  const res = await fetch(`/api/rooms/${clean}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = (await res.json()) as { playerId?: string; error?: string };
  if (!res.ok || !data.playerId) {
    throw new Error(data.error ?? "Não deu para entrar na sala.");
  }
  savePlayerId(clean, data.playerId);
  return { code: clean, playerId: data.playerId };
}

export type RoomStatus = "connecting" | "live" | "gone" | "error";

/**
 * Liga o celular à sala: estado chega por SSE e as ações vão por POST.
 * O estado recebido já vem filtrado pelo servidor — a carta dos outros
 * jogadores nunca trafega para cá.
 */
export function useRoom(code: string) {
  const [view, setView] = React.useState<PlayerView | null>(null);
  const [status, setStatus] = React.useState<RoomStatus>("connecting");
  const [error, setError] = React.useState<string | null>(null);
  const [playerId, setPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = readPlayerId(code);
    // localStorage só existe depois da hidratação.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlayerId(stored);
    if (!stored) setStatus("gone");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [code]);

  React.useEffect(() => {
    if (!playerId) return;
    const source = new EventSource(
      `/api/rooms/${code.toUpperCase()}/stream?playerId=${encodeURIComponent(playerId)}`,
    );

    source.addEventListener("state", (event) => {
      setView(JSON.parse((event as MessageEvent<string>).data) as PlayerView);
      setStatus("live");
      setError(null);
    });
    source.addEventListener("gone", () => {
      setStatus("gone");
      source.close();
    });
    source.onerror = () => {
      // O browser tenta reconectar sozinho; só avisa se ainda não há estado.
      setStatus((prev) => (prev === "live" ? "live" : "error"));
    };

    return () => source.close();
  }, [code, playerId]);

  const send = React.useCallback(
    async (action: RoomAction) => {
      if (!playerId) return;
      const res = await fetch(`/api/rooms/${code.toUpperCase()}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Ação recusada.");
        return;
      }
      const data = (await res.json()) as { view: PlayerView | null };
      if (data.view) setView(data.view);
      setError(null);
    },
    [code, playerId],
  );

  return { view, status, error, playerId, send, setError };
}
