/**
 * Modelo de dados do Jogo do Impostor.
 *
 * Tudo roda no cliente (um único aparelho passando de mão em mão), então o
 * estado da partida vive em memória e só as configurações/pacotes do usuário
 * são persistidos em localStorage.
 */

export type WordLevel = "easy" | "hard";

export type PackWord = {
  text: string;
  level: WordLevel;
};

export type WordPack = {
  id: string;
  name: string;
  emoji: string;
  /** Pacotes nativos do app não podem ser editados, só duplicados. */
  builtin: boolean;
  words: PackWord[];
};

/** Filtro de dificuldade aplicado ao sorteio da palavra. */
export type Difficulty = "all" | "easy" | "hard";

/** O que o impostor enxerga na tela de revelação. */
export type ImpostorHint =
  | "none" // só "VOCÊ É O IMPOSTOR"
  | "category" // impostor vê a categoria, mas não a palavra
  | "similar" // impostor recebe outra palavra do mesmo pacote (modo cego)
  | "letter"; // impostor vê a primeira letra e o tamanho da palavra

export type TurnOrder = "clockwise" | "random";

/** Como a mesa conduz a conversa antes de votar. */
export type DiscussionMode =
  | "hints" // cada um fala uma palavra, na ordem sorteada
  | "questions" // "X pergunta para Y", e quem responde pergunta em seguida
  | "free"; // conversa solta

export type Scoring = {
  /** Cada inocente, quando o impostor é pego. */
  crewCatch: number;
  /** Impostor, quando escapa da votação. */
  impostorEscape: number;
  /** Impostor pego que acerta a palavra. */
  impostorGuess: number;
};

export type GameConfig = {
  players: string[];
  impostorCount: number;
  packIds: string[];
  difficulty: Difficulty;
  hint: ImpostorHint;
  /** No modo "similar", avisa mesmo assim que a pessoa é o impostor. */
  tellImpostorRole: boolean;
  /** Mostra a categoria para todo mundo na tela de revelação. */
  showCategoryToAll: boolean;
  discussionMode: DiscussionMode;
  turnOrder: TurnOrder;
  /** Votação dentro do app (senão o grupo decide no grito). */
  votingEnabled: boolean;
  /** Empate leva a um segundo turno entre os mais votados. */
  runoffOnTie: boolean;
  /** Impostor descoberto pode tentar adivinhar a palavra e roubar pontos. */
  impostorGuess: boolean;
  scoring: Scoring;
  /** 0 = partida sem fim; a mesa encerra quando quiser. */
  totalRounds: number;
};

export type ConfigPreset = {
  id: string;
  name: string;
  config: GameConfig;
  updatedAt: number;
};

export type Round = {
  index: number;
  word: string;
  packId: string;
  packName: string;
  packEmoji: string;
  /** Índices dos jogadores sorteados como impostores. */
  impostorIndexes: number[];
  /** Palavra falsa entregue ao impostor no modo "similar". */
  decoy: string | null;
  /** Ordem de fala sorteada/definida. */
  speakingOrder: number[];
  /** Quem começa falando (ou perguntando). */
  firstSpeaker: number;
};

export type RoundOutcome = {
  roundIndex: number;
  word: string;
  impostorIndexes: number[];
  accusedIndex: number | null;
  caught: boolean;
  impostorGuessedWord: boolean;
  points: Record<number, number>;
};

export type Phase =
  | "setup"
  | "reveal"
  | "discussion"
  | "voting"
  | "result"
  | "gameover";
