import "server-only";

import {
  DEFAULT_CONFIG,
  impostorView,
  maxImpostors,
  wordsForDifficulty,
} from "@/lib/games/impostor/engine";
import { BUILTIN_PACKS } from "@/lib/games/impostor/packs";
import type { GameConfig, RoundOutcome } from "@/lib/games/impostor/types";
import {
  ROOM_TTL_MS,
  type PlayerView,
  type PublicRound,
  type RoomAction,
  type RoomPlayer,
} from "@/lib/games/impostor/online/types";

import { roomStorage } from "./room-storage";
import type { Room, RoomSecret } from "./room-types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0, 1
const CODE_LENGTH = 5;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function randomId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function emptyVotes() {
  return { counts: {}, voted: [], candidates: null, runoff: false };
}

/** Grava a sala e acorda os streams (quando o storage sabe avisar). */
async function commit(room: Room) {
  room.state.version++;
  await roomStorage.save(room);
  roomStorage.notify(room.state.code);
}

export const storageKind = roomStorage.kind;

export function subscribeRoom(code: string, notify: () => void) {
  return roomStorage.subscribe(code.toUpperCase(), notify);
}

export async function loadRoom(code: string) {
  return roomStorage.load(code.toUpperCase());
}

export async function createRoom(hostName: string, config?: GameConfig) {
  let code = randomCode();
  while (await roomStorage.load(code)) code = randomCode();

  const host: RoomPlayer = {
    id: randomId(),
    name: hostName.trim().slice(0, 20) || "Anfitrião",
    isHost: true,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };

  const room: Room = {
    state: {
      code,
      phase: "setup",
      config: { ...DEFAULT_CONFIG, ...(config ?? {}), players: [] },
      players: [host],
      round: null,
      revealed: [],
      votes: emptyVotes(),
      revealedRound: null,
      impostorGuessedWord: false,
      scores: {},
      outcomes: [],
      expiresAt: Date.now() + ROOM_TTL_MS,
      version: 1,
    },
    packs: BUILTIN_PACKS,
    secret: null,
    usedWords: [],
    ballots: {},
  };

  await roomStorage.save(room);
  return { code, playerId: host.id };
}

export async function joinRoom(code: string, name: string) {
  const room = await roomStorage.load(code.toUpperCase());
  if (!room) return { error: "Sala não encontrada ou expirada." } as const;
  if (room.state.phase !== "setup") {
    return { error: "A partida já começou nessa sala." } as const;
  }
  if (room.state.players.length >= 20) {
    return { error: "Sala cheia (20 jogadores)." } as const;
  }
  const clean = name.trim().slice(0, 20);
  if (!clean) return { error: "Escolha um nome." } as const;
  if (
    room.state.players.some(
      (p) => p.name.toLowerCase() === clean.toLowerCase(),
    )
  ) {
    return { error: "Já tem alguém com esse nome na sala." } as const;
  }

  const player: RoomPlayer = {
    id: randomId(),
    name: clean,
    isHost: false,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };
  room.state.players.push(player);
  await commit(room);
  return { playerId: player.id } as const;
}

/** Monta a visão de um jogador: estado público + a carta só dele. */
export function viewFor(room: Room, playerId: string): PlayerView | null {
  const me = room.state.players.find((p) => p.id === playerId);
  if (!me) return null;

  let card: PlayerView["card"] = null;
  const secret = room.secret;
  if (secret && room.state.round) {
    const isImpostor = secret.impostorIds.includes(playerId);
    const blind =
      isImpostor &&
      room.state.config.hint === "similar" &&
      !room.state.config.tellImpostorRole;

    if (isImpostor) {
      const view = impostorView(
        {
          index: room.state.round.index,
          word: secret.word,
          packId: secret.packId,
          packName: room.state.round.packName,
          packEmoji: room.state.round.packEmoji,
          impostorIndexes: [],
          decoy: secret.decoy,
          speakingOrder: [],
          firstSpeaker: 0,
        },
        room.state.config.hint,
      );
      card = {
        isImpostor: true,
        title: view.title,
        subtitle: blind ? "Essa é a sua palavra." : view.subtitle,
        showRole: !blind,
      };
    } else {
      card = {
        isImpostor: false,
        title: secret.word,
        subtitle: "Essa é a palavra secreta. Não deixe ninguém ver.",
        showRole: true,
      };
    }
  }

  return {
    you: { id: me.id, name: me.name, isHost: me.isHost },
    card,
    state: room.state,
  };
}

/** Visão de um jogador a partir do código, já lendo do storage. */
export async function getView(code: string, playerId: string) {
  const room = await roomStorage.load(code.toUpperCase());
  if (!room) return null;
  return viewFor(room, playerId);
}

function drawRound(room: Room): { round: PublicRound; secret: RoomSecret } | null {
  const { config, players } = room.state;
  const pool = room.packs.filter(
    (p) =>
      config.packIds.includes(p.id) &&
      wordsForDifficulty(p, config.difficulty).length >= 2,
  );
  if (pool.length === 0 || players.length < 3) return null;

  const pack = pick(pool);
  const available = wordsForDifficulty(pack, config.difficulty);
  const fresh = available.filter((w) => !room.usedWords.includes(w.text));
  const word = pick(fresh.length > 0 ? fresh : available);
  const others = available.filter((w) => w.text !== word.text);
  const decoy =
    config.hint === "similar" && others.length > 0 ? pick(others).text : null;

  const ids = players.map((p) => p.id);
  const impostorIds = shuffle(ids).slice(
    0,
    Math.min(config.impostorCount, maxImpostors(ids.length)),
  );
  const order = config.turnOrder === "random" ? shuffle(ids) : ids;
  const index = (room.state.round?.index ?? -1) + 1;

  return {
    round: {
      index,
      packName: pack.name,
      packEmoji: pack.emoji,
      showCategory: config.showCategoryToAll,
      speakingOrder: order,
      firstSpeaker: order[0],
      impostorCount: impostorIds.length,
    },
    secret: { word: word.text, decoy, impostorIds, packId: pack.id },
  };
}

function startRound(room: Room): string | null {
  const drawn = drawRound(room);
  if (!drawn) {
    return "Precisa de 3 jogadores e de um pacote com palavras suficientes.";
  }
  room.state.round = drawn.round;
  room.secret = drawn.secret;
  room.state.revealed = [];
  room.state.votes = emptyVotes();
  room.state.revealedRound = null;
  room.state.impostorGuessedWord = false;
  room.ballots = {};
  room.state.phase = "reveal";
  return null;
}

function tally(room: Room) {
  const counts: Record<string, number> = {};
  for (const target of Object.values(room.ballots)) {
    if (!target) continue;
    counts[target] = (counts[target] ?? 0) + 1;
  }
  room.state.votes = {
    counts,
    voted: Object.keys(room.ballots),
    candidates: room.state.votes.candidates,
    runoff: room.state.votes.runoff,
  };
  return counts;
}

function leaders(counts: Record<string, number>): string[] {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (entries.length === 0) return [];
  const top = Math.max(...entries.map(([, n]) => n));
  return entries.filter(([, n]) => n === top).map(([id]) => id);
}

function closeVote(room: Room) {
  const counts = tally(room);
  const top = leaders(counts);

  if (
    top.length > 1 &&
    room.state.config.runoffOnTie &&
    !room.state.votes.runoff
  ) {
    room.ballots = {};
    room.state.votes = { counts: {}, voted: [], candidates: top, runoff: true };
    return;
  }

  const accusedId = top.length === 1 ? top[0] : null;
  const impostorIds = room.secret?.impostorIds ?? [];
  room.state.revealedRound = {
    word: room.secret?.word ?? "",
    impostorIds,
    accusedId,
    caught: accusedId !== null && impostorIds.includes(accusedId),
  };
  room.state.phase = "result";
}

function applyScore(room: Room) {
  const revealed = room.state.revealedRound;
  if (!revealed) return;
  const { scoring } = room.state.config;
  const points: Record<number, number> = {};

  room.state.players.forEach((player, index) => {
    const isImpostor = revealed.impostorIds.includes(player.id);
    const gained = isImpostor
      ? revealed.caught
        ? room.state.impostorGuessedWord
          ? scoring.impostorGuess
          : 0
        : scoring.impostorEscape
      : revealed.caught
        ? scoring.crewCatch
        : 0;
    room.state.scores[player.id] = (room.state.scores[player.id] ?? 0) + gained;
    points[index] = gained;
  });

  const outcome: RoundOutcome = {
    roundIndex: room.state.round?.index ?? 0,
    word: revealed.word,
    impostorIndexes: revealed.impostorIds
      .map((id) => room.state.players.findIndex((p) => p.id === id))
      .filter((i) => i >= 0),
    accusedIndex:
      revealed.accusedId === null
        ? null
        : room.state.players.findIndex((p) => p.id === revealed.accusedId),
    caught: revealed.caught,
    impostorGuessedWord: room.state.impostorGuessedWord,
    points,
  };
  room.state.outcomes.push(outcome);
  if (revealed.word) room.usedWords.push(revealed.word);
}

/** Aplica uma ação. Só o anfitrião controla as fases. */
export async function applyAction(
  code: string,
  playerId: string,
  action: RoomAction,
): Promise<{ error?: string; view?: PlayerView }> {
  const room = await roomStorage.load(code.toUpperCase());
  if (!room) return { error: "Sala não encontrada ou expirada." };
  const me = room.state.players.find((p) => p.id === playerId);
  if (!me) return { error: "Você não está nessa sala." };
  me.lastSeen = Date.now();

  const hostOnly = () => (me.isHost ? null : "Só o anfitrião pode fazer isso.");

  switch (action.type) {
    case "ping":
      break;

    case "config": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.state.config = { ...action.config, players: [] };
      if (action.packs?.length) {
        const custom = action.packs.filter((p) => !p.builtin);
        room.packs = [...BUILTIN_PACKS, ...custom];
      }
      await commit(room);
      break;
    }

    case "start":
    case "next": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      if (action.type === "next") applyScore(room);
      const total = room.state.config.totalRounds;
      if (action.type === "next" && total > 0 && room.state.outcomes.length >= total) {
        room.state.phase = "gameover";
        await commit(room);
        break;
      }
      const error = startRound(room);
      if (error) return { error };
      await commit(room);
      break;
    }

    case "reveal": {
      if (!room.state.revealed.includes(playerId)) {
        room.state.revealed.push(playerId);
        await commit(room);
      }
      break;
    }

    case "discussion": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.state.phase = "discussion";
      await commit(room);
      break;
    }

    case "voting": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.ballots = {};
      room.state.votes = emptyVotes();
      room.state.phase = "voting";
      await commit(room);
      break;
    }

    case "vote": {
      if (room.state.phase !== "voting") {
        return { error: "A votação não está aberta." };
      }
      const candidates = room.state.votes.candidates;
      if (action.targetId && candidates && !candidates.includes(action.targetId)) {
        return { error: "Esse jogador não está no segundo turno." };
      }
      room.ballots[playerId] = action.targetId;
      tally(room);
      // Todo mundo votou: fecha sozinho.
      if (Object.keys(room.ballots).length >= room.state.players.length) {
        closeVote(room);
      }
      await commit(room);
      break;
    }

    case "closeVote": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      closeVote(room);
      await commit(room);
      break;
    }

    case "guess": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.state.impostorGuessedWord = action.guessed;
      await commit(room);
      break;
    }

    case "finish": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      if (room.state.phase === "result") applyScore(room);
      room.state.phase = "gameover";
      await commit(room);
      break;
    }

    case "restart": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.state.scores = {};
      room.state.outcomes = [];
      room.usedWords = [];
      room.state.round = null;
      room.state.phase = "setup";
      room.secret = null;
      await commit(room);
      break;
    }

    case "kick": {
      const denied = hostOnly();
      if (denied) return { error: denied };
      room.state.players = room.state.players.filter(
        (p) => p.id !== action.playerId || p.isHost,
      );
      await commit(room);
      break;
    }

    case "leave": {
      room.state.players = room.state.players.filter((p) => p.id !== playerId);
      if (room.state.players.length === 0) {
        await roomStorage.remove(room.state.code);
        return {};
      }
      if (me.isHost) room.state.players[0].isHost = true;
      await commit(room);
      return {};
    }
  }

  const view = viewFor(room, playerId);
  return view ? { view } : { error: "Você não está nessa sala." };
}
