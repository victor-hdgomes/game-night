"use client";

import * as React from "react";
import { Gavel, Minus, Plus, Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { voteLeaders } from "@/lib/games/impostor/engine";
import type { GameConfig } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

/**
 * Contagem aberta: o grupo levanta a mão e alguém registra os votos aqui.
 * Com `runoffOnTie`, empate leva a um segundo turno só entre os mais
 * votados; empate de novo solta o impostor.
 */
export function VotingStep({
  config,
  onConfirm,
}: {
  config: GameConfig;
  onConfirm: (accusedIndex: number | null) => void;
}) {
  const [votes, setVotes] = React.useState<Record<number, number>>({});
  /** null = todos concorrem; lista = segundo turno entre esses jogadores. */
  const [candidates, setCandidates] = React.useState<number[] | null>(null);

  const running = candidates ?? config.players.map((_, i) => i);
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const leaders = voteLeaders(votes);
  const tied = leaders.length > 1;
  const isRunoff = candidates !== null;

  const bump = (index: number, delta: number) =>
    setVotes((prev) => {
      const next = Math.max(0, (prev[index] ?? 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[index];
      else copy[index] = next;
      return copy;
    });

  const confirm = () => {
    if (leaders.length === 1) {
      onConfirm(leaders[0]);
      return;
    }
    // Empate: segundo turno uma única vez, se a regra estiver ligada.
    if (tied && config.runoffOnTie && !isRunoff) {
      setCandidates(leaders);
      setVotes({});
      return;
    }
    onConfirm(null);
  };

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            {isRunoff ? (
              <Repeat className="h-4 w-4 text-primary" />
            ) : (
              <Gavel className="h-4 w-4 text-primary" />
            )}
            {isRunoff ? "Segundo turno" : "Votação"}
          </CardTitle>
          <CardDescription>
            {isRunoff
              ? "Empatou: só os mais votados seguem. Novo empate solta o impostor."
              : "Toque no nome para somar um voto."}{" "}
            {total} de {config.players.length} votos registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {running.map((index) => {
            const player = config.players[index];
            const count = votes[index] ?? 0;
            const isLeader = leaders.length === 1 && leaders[0] === index;
            return (
              <div
                key={`${player}-${index}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  isLeader ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => bump(index, 1)}
                  className="min-w-0 flex-1 text-left"
                  aria-label={`Votar em ${player}`}
                >
                  <span className="block truncate text-sm font-medium">
                    {player}
                  </span>
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {count}
                </span>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Tirar voto de ${player}`}
                    disabled={count === 0}
                    onClick={() => bump(index, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Somar voto em ${player}`}
                    onClick={() => bump(index, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {tied ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          <span>Empate entre</span>
          {leaders.map((i) => (
            <Badge key={i} variant="secondary">
              {config.players[i]}
            </Badge>
          ))}
          <span>
            {config.runoffOnTie && !isRunoff
              ? "— confirmar abre o segundo turno."
              : "— o impostor escapa."}
          </span>
        </div>
      ) : null}

      <div className="sticky bottom-20 z-10 space-y-2 md:bottom-4">
        <Button
          size="lg"
          className="w-full shadow-lg"
          disabled={total === 0}
          onClick={confirm}
        >
          {tied && config.runoffOnTie && !isRunoff
            ? "Abrir segundo turno"
            : "Confirmar votação"}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => onConfirm(null)}
        >
          Ninguém foi acusado
        </Button>
      </div>
    </div>
  );
}
