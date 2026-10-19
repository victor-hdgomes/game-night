"use client";

import * as React from "react";
import { Check, Eye, EyeOff, Hand, ShieldCheck, VenetianMask } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { impostorView } from "@/lib/games/impostor/engine";
import type { GameConfig, Round } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

/**
 * A mesa escolhe a ordem: quem pega o celular toca no próprio nome.
 * Quem já viu fica marcado, e a rodada só segue quando todos viram.
 */
export function RevealStep({
  config,
  round,
  done,
  onRevealed,
  onFinish,
}: {
  config: GameConfig;
  round: Round;
  /** Índices de quem já viu a carta nesta rodada. */
  done: number[];
  onRevealed: (playerIndex: number) => void;
  onFinish: () => void;
}) {
  const [player, setPlayer] = React.useState<number | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  const total = config.players.length;
  const remaining = config.players
    .map((_, i) => i)
    .filter((i) => !done.includes(i));

  if (player !== null) {
    const isImpostor = round.impostorIndexes.includes(player);
    const view = impostorView(round, config.hint);
    const blindImpostor =
      isImpostor && config.hint === "similar" && !config.tellImpostorRole;

    const close = () => {
      onRevealed(player);
      setPlayer(null);
      setRevealed(false);
    };

    return (
      <Card className="min-h-[22rem] justify-center gap-6 py-8 text-center sm:min-h-[26rem]">
        <CardContent className="space-y-6 px-5">
          {!revealed ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
                <Hand className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Celular com
                </p>
                <h2 className="text-2xl font-semibold tracking-tight break-words">
                  {config.players[player]}
                </h2>
                <p className="pt-2 text-xs text-muted-foreground">
                  Só {config.players[player]} pode olhar a próxima tela.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setRevealed(true)}
              >
                <Eye className="h-4 w-4" />
                Ver minha carta
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPlayer(null)}
              >
                Não sou eu, voltar
              </Button>
            </>
          ) : (
            <>
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

              {config.showCategoryToAll ? (
                <p className="text-xs text-muted-foreground">
                  <span aria-hidden>{round.packEmoji}</span> {round.packName}
                </p>
              ) : null}

              <h2 className="text-3xl leading-tight font-bold tracking-tight break-words sm:text-4xl">
                {isImpostor ? view.title : round.word}
              </h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                {isImpostor
                  ? blindImpostor
                    ? "Essa é a sua palavra."
                    : view.subtitle
                  : "Essa é a palavra secreta. Não deixe ninguém ver."}
              </p>

              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={close}
              >
                <EyeOff className="h-4 w-4" />
                Esconder e passar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done.length} de {total} já viram
          </span>
          <span>Rodada {round.index + 1}</span>
        </div>
        <Progress value={(done.length / total) * 100} />
      </div>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Quem vai ver agora?</CardTitle>
          <CardDescription>
            A ordem é de vocês: toque no seu nome quando o celular chegar na
            sua mão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {config.players.map((name, index) => {
            const seen = done.includes(index);
            return (
              <button
                key={`${name}-${index}`}
                type="button"
                disabled={seen}
                onClick={() => setPlayer(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                  seen
                    ? "border-border bg-muted text-muted-foreground"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{name}</span>
                {seen ? (
                  <Check className="h-4 w-4 shrink-0 text-[color:var(--color-income)]" />
                ) : (
                  <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 md:bottom-4">
        <Button
          size="lg"
          className="w-full shadow-lg"
          disabled={remaining.length > 0}
          onClick={onFinish}
        >
          {remaining.length > 0
            ? `Faltam ${remaining.length} jogador(es)`
            : "Todo mundo viu, começar discussão"}
        </Button>
      </div>
    </div>
  );
}
