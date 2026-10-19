/**
 * Modelo de dados do Jogo do Impostor.
 *
 * Tudo roda no cliente (um único aparelho passando de mão em mão), então o
 * estado da partida vive em memória e só as configurações/pacotes do usuário
 * são persistidos em localStorage.
 */

export type WordPack = {
  id: string;
  name: string;
  emoji: string;
  /** Pacotes nativos do app não podem ser editados, só duplicados. */
  builtin: boolean;
  words: string[];
};

/** O que o impostor enxerga na tela de revelação. */
export type ImpostorHint =
  | "none" // só "VOCÊ É O IMPOSTOR"
  | "category" // impostor vê a categoria, mas não a palavra
  | "similar" // impostor recebe outra palavra do mesmo pacote (modo cego)
  | "letter"; // impostor vê a primeira letra e o tamanho da palavra

export type TurnOrder = "clockwise" | "random";

export type GameConfig = {
  players: string[];
  impostorCount: number;
  packIds: string[];
  hint: ImpostorHint;
  /** No modo "similar", avisa mesmo assim que a pessoa é o impostor. */
  tellImpostorRole: boolean;
  /** Mostra a categoria para todo mundo na tela de revelação. */
  showCategoryToAll: boolean;
  /** Rodada de dicas: cada jogador fala uma palavra antes da votação. */
  hintRound: boolean;
  turnOrder: TurnOrder;
  /** Votação dentro do app (senão o grupo decide no grito). */
  votingEnabled: boolean;
  /** Impostor descoberto pode tentar adivinhar a palavra e roubar pontos. */
  impostorGuess: boolean;
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
  /** Quem começa falando. */
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
