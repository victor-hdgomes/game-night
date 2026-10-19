import type { Metadata } from "next";

import { ImpostorGame } from "@/components/organisms/impostor/impostor-game";

export const metadata: Metadata = {
  title: "Impostor",
  description:
    "Jogo do impostor para jogar em grupo com um aparelho só: pacotes de palavras, cronômetro, votação e placar.",
};

export default function ImpostorPage() {
  return <ImpostorGame />;
}
