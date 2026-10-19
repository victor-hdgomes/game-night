import type { Metadata } from "next";

import { PackManager } from "@/components/organisms/impostor/pack-manager";

export const metadata: Metadata = {
  title: "Pacotes de palavras",
  description:
    "Crie, edite, importe e exporte pacotes de palavras do Jogo do Impostor.",
};

export default function PacotesPage() {
  return <PackManager />;
}
