import type { RoomState } from "@/lib/games/impostor/online/types";
import type { WordPack } from "@/lib/games/impostor/types";

/** O que só o servidor pode saber sobre a rodada em andamento. */
export type RoomSecret = {
  word: string;
  decoy: string | null;
  impostorIds: string[];
  packId: string;
};

/**
 * A sala inteira, do jeito que vai para o storage. Tudo aqui é
 * serializável — nada de Set, Map ou callback.
 */
export type Room = {
  state: RoomState;
  packs: WordPack[];
  secret: RoomSecret | null;
  usedWords: string[];
  /** voterId -> alvo (null = voto em branco). */
  ballots: Record<string, string | null>;
};
