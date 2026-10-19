"use client";

import * as React from "react";
import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { GameConfig, RoundOutcome } from "@/lib/games/impostor/types";

import { RankingList } from "./ranking-list";

/** Placar a qualquer momento da partida, sem revelar a rodada em curso. */
export function RankingDialog({
  config,
  scores,
  outcomes,
}: {
  config: GameConfig;
  scores: Record<number, number>;
  outcomes: RoundOutcome[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trophy className="h-4 w-4" />
          Placar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Placar</DialogTitle>
          <DialogDescription>
            {outcomes.length} rodada{outcomes.length === 1 ? "" : "s"}{" "}
            encerrada{outcomes.length === 1 ? "" : "s"} até aqui.
          </DialogDescription>
        </DialogHeader>

        <RankingList config={config} scores={scores} />

        {outcomes.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Rodadas anteriores</p>
              {outcomes.map((o) => (
                <div
                  key={o.roundIndex}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.word}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.impostorIndexes
                        .map((i) => config.players[i])
                        .join(", ")}
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
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
