"use client";

import * as React from "react";
import { MessagesSquare, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GameConfig, Round } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

import { PeekWordDialog } from "./peek-word-dialog";

export function DiscussionStep({
  config,
  round,
  onFinish,
}: {
  config: GameConfig;
  round: Round;
  onFinish: () => void;
}) {
  const [spoken, setSpoken] = React.useState<number[]>([]);

  const toggleSpoken = (index: number) =>
    setSpoken((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessagesSquare className="h-4 w-4 text-primary" />
            Discussão
          </CardTitle>
          <CardDescription>
            {config.hintRound
              ? "Cada um fala uma palavra sobre o tema, nesta ordem. Toque no nome para marcar quem já falou."
              : `Quem começa: ${config.players[round.firstSpeaker]}.`}
            {config.showCategoryToAll
              ? ` Categoria: ${round.packEmoji} ${round.packName}.`
              : ""}
          </CardDescription>
        </CardHeader>
        {config.hintRound ? (
          <CardContent className="px-5">
            <ol className="space-y-2">
              {round.speakingOrder.map((playerIndex, position) => {
                const done = spoken.includes(playerIndex);
                return (
                  <li key={playerIndex}>
                    <button
                      type="button"
                      onClick={() => toggleSpoken(playerIndex)}
                      aria-pressed={done}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        done
                          ? "border-border bg-muted text-muted-foreground line-through"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                        {position + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {config.players[playerIndex]}
                      </span>
                      {position === 0 && !done ? (
                        <Badge variant="secondary" className="shrink-0">
                          começa
                        </Badge>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        ) : null}
      </Card>

      <PeekWordDialog config={config} round={round} />

      <div className="sticky bottom-20 z-10 md:bottom-4">
        <Button size="lg" className="w-full shadow-lg" onClick={onFinish}>
          <Vote className="h-4 w-4" />
          {config.votingEnabled ? "Ir para a votação" : "Revelar o impostor"}
        </Button>
      </div>
    </div>
  );
}
