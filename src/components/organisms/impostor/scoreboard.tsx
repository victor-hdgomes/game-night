"use client";

import * as React from "react";
import { RotateCcw, Settings2, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GameConfig, RoundOutcome } from "@/lib/games/impostor/types";

import { RankingList, rankPlayers } from "./ranking-list";

export function Scoreboard({
  config,
  scores,
  outcomes,
  onPlayAgain,
  onBackToSetup,
}: {
  config: GameConfig;
  scores: Record<number, number>;
  outcomes: RoundOutcome[];
  onPlayAgain: () => void;
  onBackToSetup: () => void;
}) {
  const ranking = rankPlayers(config, scores);

  const top = ranking[0]?.points ?? 0;

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-6 text-center">
        <CardContent className="space-y-3 px-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <Trophy className="h-6 w-6 text-[color:var(--color-warning)]" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Fim de partida
          </h2>
          <p className="text-sm text-muted-foreground">
            {ranking
              .filter((p) => p.points === top && top > 0)
              .map((p) => p.name)
              .join(", ") || "Ninguém"}{" "}
            no topo com {top} ponto{top === 1 ? "" : "s"}.
          </p>
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Placar</CardTitle>
          <CardDescription>
            {outcomes.length} rodada{outcomes.length === 1 ? "" : "s"} jogada
            {outcomes.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <RankingList config={config} scores={scores} />
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {outcomes.map((o) => (
            <div
              key={o.roundIndex}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{o.word}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.impostorIndexes.map((i) => config.players[i]).join(", ")}
                </p>
              </div>
              <Badge variant={o.caught ? "default" : "destructive"}>
                {o.caught
                  ? o.impostorGuessedWord
                    ? "Pego, mas acertou"
                    : "Pego"
                  : "Escapou"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 pb-2 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={onPlayAgain}>
          <RotateCcw className="h-4 w-4" />
          Jogar de novo
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={onBackToSetup}
        >
          <Settings2 className="h-4 w-4" />
          Mudar configurações
        </Button>
      </div>
    </div>
  );
}
