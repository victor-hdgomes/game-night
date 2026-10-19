"use client";

import * as React from "react";
import { Eye, EyeOff, ShieldCheck, VenetianMask } from "lucide-react";

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
import { impostorView } from "@/lib/games/impostor/engine";
import type { GameConfig, Round } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

/**
 * "Esqueci minha palavra": o jogador escolhe o próprio nome e vê a carta de
 * novo, com o mesmo toque-para-revelar da rodada de distribuição.
 */
export function PeekWordDialog({
  config,
  round,
}: {
  config: GameConfig;
  round: Round;
}) {
  const [open, setOpen] = React.useState(false);
  const [player, setPlayer] = React.useState<number | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const reset = () => {
    setPlayer(null);
    setRevealed(false);
  };

  const isImpostor =
    player !== null && round.impostorIndexes.includes(player);
  const view = impostorView(round, config.hint);
  const blindImpostor =
    isImpostor && config.hint === "similar" && !config.tellImpostorRole;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Eye className="h-4 w-4" />
          Esqueci minha palavra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {player === null ? "Quem esqueceu?" : config.players[player]}
          </DialogTitle>
          <DialogDescription>
            {player === null
              ? "Toque no seu nome e olhe sozinho."
              : revealed
                ? "Esconda assim que terminar de ler."
                : "Só você pode ver a próxima tela."}
          </DialogDescription>
        </DialogHeader>

        {player === null ? (
          <div className="space-y-2">
            {config.players.map((name, index) => (
              <button
                key={`${name}-${index}`}
                type="button"
                onClick={() => setPlayer(index)}
                className="w-full truncate rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                {name}
              </button>
            ))}
          </div>
        ) : !revealed ? (
          <Button size="lg" className="w-full" onClick={() => setRevealed(true)}>
            <Eye className="h-4 w-4" />
            Ver minha carta
          </Button>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div className="flex justify-center">
              {isImpostor && !blindImpostor ? (
                <Badge variant="destructive" className="gap-1">
                  <VenetianMask className="h-3.5 w-3.5" />
                  Impostor
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Você sabe a palavra
                </Badge>
              )}
            </div>
            <p
              className={cn(
                "text-2xl leading-tight font-bold tracking-tight break-words",
              )}
            >
              {isImpostor ? view.title : round.word}
            </p>
            {isImpostor && !blindImpostor ? (
              <p className="text-sm text-muted-foreground">{view.subtitle}</p>
            ) : null}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              <EyeOff className="h-4 w-4" />
              Esconder
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
