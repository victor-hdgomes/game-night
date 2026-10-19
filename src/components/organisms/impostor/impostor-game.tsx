"use client";

import * as React from "react";
import { LogOut, VenetianMask } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { buildRound, scoreRound } from "@/lib/games/impostor/engine";
import { useLastConfig, useWordPacks } from "@/lib/games/impostor/storage";
import type {
  GameConfig,
  Phase,
  Round,
  RoundOutcome,
} from "@/lib/games/impostor/types";

import { DiscussionStep } from "./discussion-step";
import { RankingDialog } from "./ranking-dialog";
import { ResultStep } from "./result-step";
import { RevealStep } from "./reveal-step";
import { Scoreboard } from "./scoreboard";
import { SetupForm } from "./setup-form";
import { VotingStep } from "./voting-step";

const MATCH_KEY = "game-night:impostor:match";

type MatchState = {
  phase: Phase;
  round: Round | null;
  /** Quem já viu a carta na rodada atual. A mesa escolhe a ordem. */
  revealed: number[];
  usedWords: string[];
  scores: Record<number, number>;
  outcomes: RoundOutcome[];
  accused: number | null;
};

const EMPTY_MATCH: MatchState = {
  phase: "setup",
  round: null,
  revealed: [],
  usedWords: [],
  scores: {},
  outcomes: [],
  accused: null,
};

/**
 * A partida fica em localStorage: trocar de aba, recarregar ou tocar sem
 * querer no menu não pode jogar fora o placar da mesa.
 */
export function ImpostorGame() {
  const { packs, ready: packsReady } = useWordPacks();
  const [config, setConfig, configReady] = useLastConfig();
  const [match, setMatch, matchReady] = useLocalStorage<MatchState>(
    MATCH_KEY,
    EMPTY_MATCH,
  );

  const { phase, round, scores, outcomes, accused } = match;
  // Partida salva por uma versão anterior pode não ter a lista de revelados.
  const revealed = match.revealed ?? [];

  const startGame = React.useCallback(
    (nextConfig: GameConfig) => {
      setMatch({
        ...EMPTY_MATCH,
        phase: "reveal",
        round: buildRound(nextConfig, packs, 0, []),
      });
    },
    [packs, setMatch],
  );

  const markRevealed = (playerIndex: number) =>
    setMatch((prev) =>
      (prev.revealed ?? []).includes(playerIndex)
        ? prev
        : { ...prev, revealed: [...(prev.revealed ?? []), playerIndex] },
    );

  const handleResultConfirm = (
    accusedIndex: number | null,
    guessed: boolean,
  ) => {
    if (!round) return;
    const outcome = scoreRound(
      round,
      config.players.length,
      accusedIndex,
      guessed,
    );

    setMatch((prev) => {
      const nextScores = { ...prev.scores };
      for (const [index, points] of Object.entries(outcome.points)) {
        nextScores[Number(index)] = (nextScores[Number(index)] ?? 0) + points;
      }
      const used = [...prev.usedWords, round.word];
      const nextIndex = round.index + 1;
      // totalRounds 0 = partida sem fim; só encerra pelo botão do resultado.
      const done = config.totalRounds > 0 && nextIndex >= config.totalRounds;

      return {
        phase: done ? "gameover" : "reveal",
        round: done ? prev.round : buildRound(config, packs, nextIndex, used),
        revealed: [],
        usedWords: used,
        scores: nextScores,
        outcomes: [...prev.outcomes, outcome],
        accused: null,
      };
    });
  };

  const quit = () => setMatch(EMPTY_MATCH);

  if (!packsReady || !configReady || !matchReady) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <VenetianMask className="h-5 w-5 shrink-0 text-primary" />
            <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
              Impostor
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {phase === "setup"
              ? "Monte a mesa, ajuste as regras e passe o celular."
              : `Rodada ${(round?.index ?? 0) + 1}${
                  config.totalRounds > 0 ? ` de ${config.totalRounds}` : ""
                } · ${config.players.length} jogadores`}
          </p>
        </div>

        {phase !== "setup" ? (
          <div className="flex shrink-0 items-center gap-1">
            <RankingDialog
              config={config}
              scores={scores}
              outcomes={outcomes}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar a partida?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O placar desta partida será perdido. Suas configurações e
                    pacotes continuam salvos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuar jogando</AlertDialogCancel>
                  <AlertDialogAction onClick={quit}>Encerrar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </header>

      {phase === "setup" ? (
        <SetupForm
          config={config}
          onChange={setConfig}
          packs={packs}
          onStart={() => startGame(config)}
        />
      ) : null}

      {phase === "reveal" && round ? (
        <RevealStep
          config={config}
          round={round}
          done={revealed}
          onRevealed={markRevealed}
          onFinish={() =>
            setMatch((prev) => ({ ...prev, phase: "discussion" }))
          }
        />
      ) : null}

      {phase === "discussion" && round ? (
        <DiscussionStep
          config={config}
          round={round}
          onFinish={() =>
            setMatch((prev) => ({
              ...prev,
              phase: config.votingEnabled ? "voting" : "result",
            }))
          }
        />
      ) : null}

      {phase === "voting" && round ? (
        <VotingStep
          config={config}
          onConfirm={(accusedIndex) =>
            setMatch((prev) => ({
              ...prev,
              accused: accusedIndex,
              phase: "result",
            }))
          }
        />
      ) : null}

      {phase === "result" && round ? (
        <ResultStep
          key={round.index}
          config={config}
          round={round}
          accusedIndex={accused}
          needsAccusation={!config.votingEnabled}
          isLastRound={
            config.totalRounds > 0 && round.index + 1 >= config.totalRounds
          }
          endless={config.totalRounds === 0}
          onConfirm={handleResultConfirm}
          onFinishMatch={(accusedIndex, guessed) => {
            handleResultConfirm(accusedIndex, guessed);
            setMatch((prev) => ({ ...prev, phase: "gameover" }));
          }}
        />
      ) : null}

      {phase === "gameover" ? (
        <Scoreboard
          config={config}
          scores={scores}
          outcomes={outcomes}
          onPlayAgain={() => startGame(config)}
          onBackToSetup={quit}
        />
      ) : null}
    </div>
  );
}
