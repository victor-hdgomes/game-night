import "server-only";

import { Redis } from "@upstash/redis";

import type { Room } from "./room-types";

/**
 * Onde as salas moram. Duas implementações:
 *
 * - memória: padrão em desenvolvimento, zero configuração, mas só serve se o
 *   app rodar numa instância só (o estado morre com o processo);
 * - Upstash Redis: usado assim que as variáveis existem, com TTL nativo de
 *   24h, que é o que faz o modo online funcionar em serverless.
 */
export interface RoomStorage {
  /** true quando dá para avisar os streams na hora (memória). */
  readonly realtime: boolean;
  readonly kind: "memory" | "redis";
  load(code: string): Promise<Room | null>;
  save(room: Room): Promise<void>;
  remove(code: string): Promise<void>;
  /** Só faz sentido no modo memória; no Redis o SSE faz polling. */
  subscribe(code: string, notify: () => void): () => void;
  notify(code: string): void;
}

function ttlSeconds(room: Room): number {
  return Math.max(1, Math.ceil((room.state.expiresAt - Date.now()) / 1000));
}

class MemoryRoomStorage implements RoomStorage {
  readonly realtime = true;
  readonly kind = "memory" as const;

  private rooms = new Map<string, Room>();
  private listeners = new Map<string, Set<() => void>>();

  private purge() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (room.state.expiresAt <= now) {
        this.rooms.delete(code);
        this.notify(code);
        this.listeners.delete(code);
      }
    }
  }

  async load(code: string) {
    this.purge();
    return this.rooms.get(code) ?? null;
  }

  async save(room: Room) {
    this.rooms.set(room.state.code, room);
  }

  async remove(code: string) {
    this.rooms.delete(code);
    this.notify(code);
    this.listeners.delete(code);
  }

  subscribe(code: string, notify: () => void) {
    const set = this.listeners.get(code) ?? new Set();
    set.add(notify);
    this.listeners.set(code, set);
    return () => set.delete(notify);
  }

  notify(code: string) {
    for (const listener of this.listeners.get(code) ?? []) listener();
  }
}

class RedisRoomStorage implements RoomStorage {
  readonly realtime = false;
  readonly kind = "redis" as const;

  constructor(private redis: Redis) {}

  private key(code: string) {
    return `game-night:room:${code}`;
  }

  async load(code: string) {
    // O Upstash já devolve o JSON desserializado.
    const room = await this.redis.get<Room>(this.key(code));
    if (!room) return null;
    if (room.state.expiresAt <= Date.now()) {
      await this.remove(code);
      return null;
    }
    return room;
  }

  async save(room: Room) {
    // O próprio TTL do Redis apaga a sala depois de 24h.
    await this.redis.set(this.key(room.state.code), room, {
      ex: ttlSeconds(room),
    });
  }

  async remove(code: string) {
    await this.redis.del(this.key(code));
  }

  subscribe() {
    return () => {};
  }

  notify() {
    // Sem pub/sub: os streams descobrem pelo número de versão.
  }
}

function buildStorage(): RoomStorage {
  // A integração Upstash da Vercel cria as KV_*; o Upstash direto, as UPSTASH_*.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) return new RedisRoomStorage(new Redis({ url, token }));
  return new MemoryRoomStorage();
}

const globalForStorage = globalThis as unknown as {
  __roomStorage?: RoomStorage;
};

export const roomStorage: RoomStorage =
  globalForStorage.__roomStorage ?? (globalForStorage.__roomStorage = buildStorage());
