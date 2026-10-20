import type {
  Difficulty,
  GameConfig,
  ImpostorHint,
  PackWord,
  Round,
  RoundOutcome,
  Scoring,
  WordPack,
} from "./types";

/** Pontuação padrão; cada partida pode ajustar no setup. */
export const DEFAULT_SCORING: Scoring = {
  crewCatch: 2,
  impostorEscape: 3,
  impostorGuess: 2,
};

export const DEFAULT_CONFIG: GameConfig = {
  players: ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"],
  impostorCount: 1,
  packIds: ["lugares", "comidas", "animais"],
  difficulty: "all",
  hint: "none",
  tellImpostorRole: true,
  showCategoryToAll: true,
  discussionMode: "hints",
  turnOrder: "random",
  votingEnabled: true,
  runoffOnTie: true,
  impostorGuess: true,
  scoring: DEFAULT_SCORING,
  totalRounds: 5,
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;

/** Teto de impostores: sempre menos de metade da mesa. */
export function maxImpostors(playerCount: number): number {
  return Math.max(1, Math.ceil(playerCount / 2) - 1);
}

/** Palavras do pacote que servem para a dificuldade escolhida. */
export function wordsForDifficulty(
  pack: WordPack,
  difficulty: Difficulty,
): PackWord[] {
  if (difficulty === "all") return pack.words;
  return pack.words.filter((w) =>
    difficulty === "hard" ? w.level === "hard" : w.level === "easy",
  );
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
  const usable = selected.filter(
    (p) => wordsForDifficulty(p, config.difficulty).length >= 2,
  );
  if (selected.length > 0 && usable.length === 0) {
    issues.push({
      field: "difficulty",
      message:
        "Nenhum pacote selecionado tem 2 palavras nessa dificuldade. Troque o filtro ou marque mais palavras.",
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
    (p) =>
      config.packIds.includes(p.id) &&
      wordsForDifficulty(p, config.difficulty).length >= 2,
  );
  const pack = pick(pool);
  const available = wordsForDifficulty(pack, config.difficulty);

  const fresh = available.filter((w) => !usedWords.includes(w.text));
  const word = pick(fresh.length > 0 ? fresh : available);

  const others = available.filter((w) => w.text !== word.text);
  const decoy =
    config.hint === "similar" && others.length > 0 ? pick(others).text : null;

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
    word: word.text,
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

/** Mais votados. Um só nome = acusado; vários = empate. */
export function voteLeaders(votes: Record<number, number>): number[] {
  const entries = Object.entries(votes)
    .map(([i, n]) => [Number(i), n] as const)
    .filter(([, n]) => n > 0);
  if (entries.length === 0) return [];
  const top = Math.max(...entries.map(([, n]) => n));
  return entries.filter(([, n]) => n === top).map(([i]) => i);
}

/** Índice mais votado. Empate devolve null (ninguém é eliminado). */
export function resolveVotes(votes: Record<number, number>): number | null {
  const leaders = voteLeaders(votes);
  return leaders.length === 1 ? leaders[0] : null;
}

export function scoreRound(
  round: Round,
  playerCount: number,
  accusedIndex: number | null,
  impostorGuessedWord: boolean,
  scoring: Scoring = DEFAULT_SCORING,
): RoundOutcome {
  const caught =
    accusedIndex !== null && round.impostorIndexes.includes(accusedIndex);
  const points: Record<number, number> = {};

  for (let i = 0; i < playerCount; i++) {
    const isImpostor = round.impostorIndexes.includes(i);
    if (isImpostor) {
      points[i] = caught
        ? impostorGuessedWord
          ? scoring.impostorGuess
          : 0
        : scoring.impostorEscape;
    } else {
      points[i] = caught ? scoring.crewCatch : 0;
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
