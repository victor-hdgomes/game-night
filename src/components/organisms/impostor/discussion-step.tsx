"use client";

import * as React from "react";
import { MessageCircleQuestion, MessagesSquare, Vote } from "lucide-react";

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
  return (
    <div className="space-y-4">
      {config.discussionMode === "questions" ? (
        <QuestionRound config={config} round={round} />
      ) : (
        <HintRound config={config} round={round} />
      )}

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

function CategoryLine({
  config,
  round,
}: {
  config: GameConfig;
  round: Round;
}) {
  if (!config.showCategoryToAll) return null;
  return (
    <>
      {" "}
      Categoria: {round.packEmoji} {round.packName}.
    </>
  );
}

function HintRound({ config, round }: { config: GameConfig; round: Round }) {
  const [spoken, setSpoken] = React.useState<number[]>([]);
  const list = config.discussionMode === "hints";

  const toggleSpoken = (index: number) =>
    setSpoken((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessagesSquare className="h-4 w-4 text-primary" />
          Discussão
        </CardTitle>
        <CardDescription>
          {list
            ? "Cada um fala uma palavra sobre o tema, nesta ordem. Toque no nome para marcar quem já falou."
            : `Conversa livre. Quem começa: ${config.players[round.firstSpeaker]}.`}
          <CategoryLine config={config} round={round} />
        </CardDescription>
      </CardHeader>
      {list ? (
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
  );
}

/**
 * Rodada de perguntas estilo Spyfall: o app sorteia quem abre, essa pessoa
 * escolhe o alvo, e quem responde vira o próximo a perguntar.
 */
function QuestionRound({
  config,
  round,
}: {
  config: GameConfig;
  round: Round;
}) {
  const [asker, setAsker] = React.useState(round.firstSpeaker);
  const [target, setTarget] = React.useState<number | null>(null);
  const [asked, setAsked] = React.useState(0);

  const answered = () => {
    if (target === null) return;
    setAsker(target);
    setTarget(null);
    setAsked((n) => n + 1);
  };

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircleQuestion className="h-4 w-4 text-primary" />
          Rodada de perguntas
        </CardTitle>
        <CardDescription>
          Pergunte algo que só quem sabe a palavra responde bem — e responda
          sem entregar demais.
          <CategoryLine config={config} round={round} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5">
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            {asked === 0 ? "Abre a rodada" : `Pergunta ${asked + 1}`}
          </p>
          <p className="pt-1 text-lg font-semibold tracking-tight break-words">
            {config.players[asker]}
            {target === null ? (
              <span className="text-muted-foreground"> pergunta para…</span>
            ) : (
              <>
                <span className="text-muted-foreground"> pergunta para </span>
                {config.players[target]}
              </>
            )}
          </p>
        </div>

        {target === null ? (
          <div className="space-y-2">
            {config.players.map((name, index) =>
              index === asker ? null : (
                <button
                  key={`${name}-${index}`}
                  type="button"
                  onClick={() => setTarget(index)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 truncate">{name}</span>
                  <MessageCircleQuestion className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button size="lg" className="w-full" onClick={answered}>
              Respondeu — agora {config.players[target]} pergunta
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setTarget(null)}
            >
              Trocar o alvo
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {asked} pergunta{asked === 1 ? "" : "s"} nesta rodada
        </p>
      </CardContent>
    </Card>
  );
}
