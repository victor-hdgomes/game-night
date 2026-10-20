import type {
  GameConfig,
  Phase,
  RoundOutcome,
  WordPack,
} from "@/lib/games/impostor/types";

/** Uma sala vive 24h; depois disso o servidor joga tudo fora. */
export const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

export type RoomPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  /** Última vez que o celular desse jogador deu sinal de vida. */
  lastSeen: number;
};

/** Parte da rodada que todo mundo pode ver. O segredo fica no servidor. */
export type PublicRound = {
  index: number;
  packName: string;
  packEmoji: string;
  showCategory: boolean;
  /** Ids na ordem de fala sorteada. */
  speakingOrder: string[];
  firstSpeaker: string;
  impostorCount: number;
};

export type VoteTally = {
  /** Votos recebidos por jogador. */
  counts: Record<string, number>;
  /** Quem já votou. */
  voted: string[];
  /** Em segundo turno, só estes concorrem. */
  candidates: string[] | null;
  runoff: boolean;
};

/** Resultado da rodada, revelado só quando a fase vira "result". */
export type RevealedRound = {
  word: string;
  impostorIds: string[];
  accusedId: string | null;
  caught: boolean;
};

export type RoomState = {
  code: string;
  phase: Phase;
  config: GameConfig;
  players: RoomPlayer[];
  round: PublicRound | null;
  /** Ids de quem já abriu a carta nesta rodada. */
  revealed: string[];
  votes: VoteTally;
  revealedRound: RevealedRound | null;
  impostorGuessedWord: boolean;
  scores: Record<string, number>;
  outcomes: RoundOutcome[];
  expiresAt: number;
  version: number;
};

/** O que o servidor manda para UM jogador: estado público + a carta dele. */
export type PlayerView = {
  you: { id: string; name: string; isHost: boolean };
  card: {
    isImpostor: boolean;
    /** Palavra real, palavra falsa ou null conforme o modo de dica. */
    title: string;
    subtitle: string;
    showRole: boolean;
  } | null;
  state: RoomState;
};

export type RoomAction =
  | { type: "config"; config: GameConfig; packs: WordPack[] }
  | { type: "start" }
  | { type: "reveal" }
  | { type: "discussion" }
  | { type: "voting" }
  | { type: "vote"; targetId: string | null }
  | { type: "closeVote" }
  | { type: "guess"; guessed: boolean }
  | { type: "next" }
  | { type: "finish" }
  | { type: "restart" }
  | { type: "leave" }
  | { type: "kick"; playerId: string }
  | { type: "ping" };

export type ActionResult =
  | { ok: true; view: PlayerView }
  | { ok: false; error: string };
