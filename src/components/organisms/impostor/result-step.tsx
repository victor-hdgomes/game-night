"use client";

import * as React from "react";
import {
  ArrowRight,
  Flag,
  PartyPopper,
  Skull,
  VenetianMask,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GameConfig, Round } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

export function ResultStep({
  config,
  round,
  accusedIndex,
  needsAccusation,
  isLastRound,
  endless,
  onConfirm,
  onFinishMatch,
}: {
  config: GameConfig;
  round: Round;
  accusedIndex: number | null;
  /** Votação fora do app: o grupo escolhe o acusado aqui. */
  needsAccusation: boolean;
  isLastRound: boolean;
  /** Partida sem número fixo de rodadas: a mesa encerra quando quiser. */
  endless: boolean;
  onConfirm: (accused: number | null, impostorGuessedWord: boolean) => void;
  onFinishMatch: (
    accused: number | null,
    impostorGuessedWord: boolean,
  ) => void;
}) {
  const [manualAccused, setManualAccused] = React.useState<number | null>(null);
  const [stage, setStage] = React.useState<"accuse" | "reveal">(
    needsAccusation ? "accuse" : "reveal",
  );
  const [guessed, setGuessed] = React.useState<boolean | null>(null);

  const accused = needsAccusation ? manualAccused : accusedIndex;
  const caught = accused !== null && round.impostorIndexes.includes(accused);
  const askGuess = caught && config.impostorGuess;

  if (stage === "accuse") {
    return (
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Quem o grupo acusou?</CardTitle>
          <CardDescription>
            A votação foi na conversa — registre só o resultado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {config.players.map((player, index) => (
            <button
              key={`${player}-${index}`}
              type="button"
              onClick={() => setManualAccused(index)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                manualAccused === index
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:bg-accent",
              )}
            >
              <span className="truncate">{player}</span>
              {manualAccused === index ? (
                <Badge variant="secondary">acusado</Badge>
              ) : null}
            </button>
          ))}
          <Separator className="my-2" />
          <Button
            size="lg"
            className="w-full"
            onClick={() => setStage("reveal")}
            disabled={manualAccused === null}
          >
            Revelar
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setManualAccused(null);
              setStage("reveal");
            }}
          >
            Ninguém foi acusado
          </Button>
        </CardContent>
      </Card>
    );
  }

  const impostorNames = round.impostorIndexes
    .map((i) => config.players[i])
    .join(", ");

  const confirmDisabled = askGuess && guessed === null;

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "gap-4 py-6 text-center",
          caught ? "border-income/50" : "border-expense/50",
        )}
      >
        <CardContent className="space-y-4 px-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            {caught ? (
              <PartyPopper className="h-6 w-6 text-[color:var(--color-income)]" />
            ) : (
              <Skull className="h-6 w-6 text-[color:var(--color-expense)]" />
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            {caught ? "Impostor desmascarado!" : "O impostor escapou!"}
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              A palavra era{" "}
              <span className="font-semibold text-foreground">
                {round.word}
              </span>{" "}
              ({round.packEmoji} {round.packName})
            </p>
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              <VenetianMask className="h-4 w-4" />
              {round.impostorIndexes.length > 1 ? "Impostores:" : "Impostor:"}{" "}
              <span className="font-semibold text-foreground">
                {impostorNames}
              </span>
            </p>
            <p>
              Acusado:{" "}
              <span className="font-medium text-foreground">
                {accused === null ? "ninguém" : config.players[accused]}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {askGuess ? (
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Chance de redenção</CardTitle>
            <CardDescription>
              {impostorNames} pode chutar a palavra. Acertou?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 px-5">
            <Button
              variant={guessed === true ? "default" : "outline"}
              className="flex-1"
              onClick={() => setGuessed(true)}
            >
              Acertou (+{config.scoring.impostorGuess})
            </Button>
            <Button
              variant={guessed === false ? "default" : "outline"}
              className="flex-1"
              onClick={() => setGuessed(false)}
            >
              Errou
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-2 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Pontos da rodada</CardTitle>
        </CardHeader>
        <CardContent className="px-5 text-sm text-muted-foreground">
          {caught ? (
            <ul className="space-y-1">
              <li>
                Inocentes: +{config.scoring.crewCatch} cada um por pegar o impostor.
              </li>
              <li>
                Impostor:{" "}
                {guessed
                  ? `+${config.scoring.impostorGuess} por acertar a palavra.`
                  : "0 ponto."}
              </li>
            </ul>
          ) : (
            <ul className="space-y-1">
              <li>Impostor: +{config.scoring.impostorEscape} por escapar.</li>
              <li>Inocentes: 0 ponto.</li>
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 space-y-2 md:bottom-4">
        <Button
          size="lg"
          className="w-full shadow-lg"
          disabled={confirmDisabled}
          onClick={() => onConfirm(accused, guessed === true)}
        >
          {isLastRound ? "Ver pódio" : "Próxima rodada"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        {endless ? (
          <Button
            variant="outline"
            className="w-full"
            disabled={confirmDisabled}
            onClick={() => onFinishMatch(accused, guessed === true)}
          >
            <Flag className="h-4 w-4" />
            Encerrar e ver pódio
          </Button>
        ) : null}
      </div>
    </div>
  );
}
