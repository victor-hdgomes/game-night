import type {
  GameConfig,
  ImpostorHint,
  Round,
  RoundOutcome,
  WordPack,
} from "./types";

export const DEFAULT_CONFIG: GameConfig = {
  players: ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"],
  impostorCount: 1,
  packIds: ["lugares", "comidas", "animais"],
  hint: "none",
  tellImpostorRole: true,
  showCategoryToAll: true,
  hintRound: true,
  turnOrder: "random",
  votingEnabled: true,
  impostorGuess: true,
  totalRounds: 5,
};

/** Pontuação de uma rodada. Fixa, para o placar ser previsível. */
export const SCORING = {
  crewCatch: 2, // cada inocente, quando o impostor é pego
  impostorEscape: 3, // impostor, quando não é pego
  impostorGuess: 2, // impostor pego que acerta a palavra
} as const;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

/** Teto de impostores: sempre menos de metade da mesa. */
export function maxImpostors(playerCount: number): number {
  return Math.max(1, Math.ceil(playerCount / 2) - 1);
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

export type ConfigIssue = { field: string; message: string };

export function validateConfig(
  config: GameConfig,
  packs: WordPack[],
): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  const named = config.players.filter((p) => p.trim().length > 0);

  if (named.length < MIN_PLAYERS) {
    issues.push({
      field: "players",
      message: `Precisa de pelo menos ${MIN_PLAYERS} jogadores com nome.`,
    });
  }
  if (named.length > MAX_PLAYERS) {
    issues.push({
      field: "players",
      message: `No máximo ${MAX_PLAYERS} jogadores.`,
    });
  }
  if (new Set(named.map((p) => p.trim().toLowerCase())).size !== named.length) {
    issues.push({ field: "players", message: "Tem nome repetido na lista." });
  }
  if (config.impostorCount > maxImpostors(named.length)) {
    issues.push({
      field: "impostorCount",
      message: "Impostores demais: a maioria tem que ser inocente.",
    });
  }

  const selected = packs.filter((p) => config.packIds.includes(p.id));
  if (selected.length === 0) {
    issues.push({ field: "packIds", message: "Escolha ao menos um pacote." });
  }
  if (selected.some((p) => p.words.length < 2)) {
    issues.push({
      field: "packIds",
      message: "Todo pacote precisa de pelo menos 2 palavras.",
    });
  }
  return issues;
}

/**
 * Sorteia a rodada: pacote, palavra, impostores e ordem de fala.
 * `usedWords` evita repetir palavra dentro da mesma partida.
 */
export function buildRound(
  config: GameConfig,
  packs: WordPack[],
  index: number,
  usedWords: string[] = [],
): Round {
  const players = config.players.filter((p) => p.trim().length > 0);
  const pool = packs.filter(
    (p) => config.packIds.includes(p.id) && p.words.length >= 2,
  );
  const pack = pick(pool);

  const fresh = pack.words.filter((w) => !usedWords.includes(w));
  const word = pick(fresh.length > 0 ? fresh : pack.words);

  const others = pack.words.filter((w) => w !== word);
  const decoy =
    config.hint === "similar" && others.length > 0 ? pick(others) : null;

  const impostorIndexes = shuffle(players.map((_, i) => i)).slice(
    0,
    Math.min(config.impostorCount, maxImpostors(players.length)),
  );

  const order =
    config.turnOrder === "random"
      ? shuffle(players.map((_, i) => i))
      : players.map((_, i) => i);

  return {
    index,
    word,
    packId: pack.id,
    packName: pack.name,
    packEmoji: pack.emoji,
    impostorIndexes,
    decoy,
    speakingOrder: order,
    firstSpeaker: order[0],
  };
}

/** Texto que o impostor vê no lugar da palavra, conforme a dica configurada. */
export function impostorView(
  round: Round,
  hint: ImpostorHint,
): { title: string; subtitle: string } {
  switch (hint) {
    case "category":
      return {
        title: "VOCÊ É O IMPOSTOR",
        subtitle: `A categoria é ${round.packName}. Blefa sem entregar que não sabe a palavra.`,
      };
    case "letter": {
      const letter = round.word.trim().charAt(0).toUpperCase();
      const size = round.word.replace(/\s/g, "").length;
      return {
        title: "VOCÊ É O IMPOSTOR",
        subtitle: `A palavra começa com "${letter}" e tem ${size} letras.`,
      };
    }
    case "similar":
      return {
        title: round.decoy ?? round.word,
        subtitle: "Essa é a sua palavra... será?",
      };
    default:
      return {
        title: "VOCÊ É O IMPOSTOR",
        subtitle: "Você não sabe a palavra. Finja que sabe.",
      };
  }
}

/** Índice mais votado. Empate devolve null (ninguém é eliminado). */
export function resolveVotes(votes: Record<number, number>): number | null {
  const entries = Object.entries(votes).map(
    ([i, n]) => [Number(i), n] as const,
  );
  if (entries.length === 0) return null;
  const top = Math.max(...entries.map(([, n]) => n));
  const leaders = entries.filter(([, n]) => n === top);
  return leaders.length === 1 ? leaders[0][0] : null;
}

export function scoreRound(
  round: Round,
  playerCount: number,
  accusedIndex: number | null,
  impostorGuessedWord: boolean,
): RoundOutcome {
  const caught = accusedIndex !== null && round.impostorIndexes.includes(accusedIndex);
  const points: Record<number, number> = {};

  for (let i = 0; i < playerCount; i++) {
    const isImpostor = round.impostorIndexes.includes(i);
    if (isImpostor) {
      points[i] = caught
        ? impostorGuessedWord
          ? SCORING.impostorGuess
          : 0
        : SCORING.impostorEscape;
    } else {
      points[i] = caught ? SCORING.crewCatch : 0;
    }
  }

  return {
    roundIndex: round.index,
    word: round.word,
    impostorIndexes: round.impostorIndexes,
    accusedIndex,
    caught,
    impostorGuessedWord,
    points,
  };
}
