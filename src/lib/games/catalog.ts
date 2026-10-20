import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Wifi,
  Drama,
  MessageCircleQuestion,
  Puzzle,
  VenetianMask,
} from "lucide-react";

export type GameStatus = "ready" | "soon";

export type GameEntry = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  players: string;
  minutes: string;
  status: GameStatus;
  href: string;
};

/** Catálogo da sala de jogos. Novos jogos entram aqui. */
export const GAMES: GameEntry[] = [
  {
    slug: "impostor",
    name: "Impostor",
    tagline: "Todo mundo sabe a palavra. Menos um.",
    description:
      "Um aparelho só, passando de mão em mão: cada um vê a palavra secreta — menos o impostor. Discute, vota e descobre quem estava blefando.",
    icon: VenetianMask,
    players: "3 a 20 jogadores",
    minutes: "5 a 30 min",
    status: "ready",
    href: "/impostor",
  },
  {
    slug: "impostor-online",
    name: "Impostor online",
    tagline: "Cada um no seu celular, mesma sala.",
    description:
      "Crie uma sala com código e QR Code, a galera entra pelo link e todo mundo acompanha a mesma partida — bom para jogar em chamada de vídeo.",
    icon: Wifi,
    players: "3 a 20 jogadores",
    minutes: "5 a 30 min",
    status: "ready",
    href: "/online",
  },
  {
    slug: "quem-sou-eu",
    name: "Quem sou eu?",
    tagline: "A palavra na testa, a dica no grupo.",
    description:
      "Cada jogador recebe um personagem que todos veem menos ele, e precisa descobrir quem é com perguntas de sim ou não.",
    icon: MessageCircleQuestion,
    players: "2 a 12 jogadores",
    minutes: "10 min",
    status: "soon",
    href: "/impostor",
  },
  {
    slug: "mimica",
    name: "Mímica",
    tagline: "Sem falar, sem apontar, sem desistir.",
    description:
      "Times alternam rodadas cronometradas tentando adivinhar o que o colega está representando.",
    icon: Drama,
    players: "4 a 20 jogadores",
    minutes: "15 min",
    status: "soon",
    href: "/impostor",
  },
  {
    slug: "eu-nunca",
    name: "Eu nunca",
    tagline: "A verdade aparece rápido.",
    description:
      "Cartas de confissão com níveis de ousadia ajustáveis para o clima da mesa.",
    icon: Brain,
    players: "3 a 16 jogadores",
    minutes: "20 min",
    status: "soon",
    href: "/impostor",
  },
  {
    slug: "desenho",
    name: "Desenho rápido",
    tagline: "Rabisca e torce.",
    description:
      "Sorteio de palavra, cronômetro e pontuação por acerto para jogar com papel e caneta.",
    icon: Puzzle,
    players: "3 a 12 jogadores",
    minutes: "15 min",
    status: "soon",
    href: "/impostor",
  },
];
