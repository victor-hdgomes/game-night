"use client";

import * as React from "react";
import { Gavel, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveVotes } from "@/lib/games/impostor/engine";
import type { GameConfig } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

/**
 * Contagem aberta: o grupo levanta a mão e alguém registra os votos aqui.
 * Empate = ninguém é acusado, e o impostor escapa.
 */
export function VotingStep({
  config,
  onConfirm,
}: {
  config: GameConfig;
  onConfirm: (accusedIndex: number | null) => void;
}) {
  const [votes, setVotes] = React.useState<Record<number, number>>({});

  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const leader = resolveVotes(votes);
  const tied = total > 0 && leader === null;

  const bump = (index: number, delta: number) =>
    setVotes((prev) => {
      const next = Math.max(0, (prev[index] ?? 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[index];
      else copy[index] = next;
      return copy;
    });

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel className="h-4 w-4 text-primary" />
            Votação
          </CardTitle>
          <CardDescription>
            Toque no nome para somar um voto. {total} de{" "}
            {config.players.length} votos registrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {config.players.map((player, index) => {
            const count = votes[index] ?? 0;
            const isLeader = leader === index && count > 0;
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
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          Empate na votação: ninguém é acusado e o impostor escapa.
        </p>
      ) : null}

      <div className="sticky bottom-20 z-10 space-y-2 md:bottom-4">
        <Button
          size="lg"
          className="w-full shadow-lg"
          disabled={total === 0}
          onClick={() => onConfirm(leader)}
        >
          Confirmar votação
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
