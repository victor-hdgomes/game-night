"use client";

import * as React from "react";

import { OptionRow, Stepper } from "@/components/molecules/option-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  maxImpostors,
  wordsForDifficulty,
} from "@/lib/games/impostor/engine";
import type {
  Difficulty,
  DiscussionMode,
  GameConfig,
  ImpostorHint,
  WordPack,
} from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  all: "Todas as palavras",
  easy: "Só as fáceis",
  hard: "Só as difíceis",
};

const DISCUSSION_LABEL: Record<DiscussionMode, string> = {
  hints: "Rodada de dicas",
  questions: "Rodada de perguntas",
  free: "Conversa livre",
};

const HINT_LABEL: Record<ImpostorHint, string> = {
  none: "Nada (modo clássico)",
  category: "Só a categoria",
  letter: "Primeira letra e tamanho",
  similar: "Uma palavra parecida",
};

/** Painel de regras do anfitrião dentro da sala online. */
export function RoomConfig({
  config,
  packs,
  playerCount,
  onChange,
}: {
  config: GameConfig;
  packs: WordPack[];
  playerCount: number;
  onChange: (next: GameConfig) => void;
}) {
  const patch = (p: Partial<GameConfig>) => onChange({ ...config, ...p });

  const togglePack = (id: string) =>
    patch({
      packIds: config.packIds.includes(id)
        ? config.packIds.filter((p) => p !== id)
        : [...config.packIds, id],
    });

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Pacotes</CardTitle>
          <CardDescription>
            {config.packIds.length} selecionados ·{" "}
            {packs
              .filter((p) => config.packIds.includes(p.id))
              .reduce(
                (sum, p) => sum + wordsForDifficulty(p, config.difficulty).length,
                0,
              )}{" "}
            palavras no sorteio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5">
          <div className="flex flex-wrap gap-2">
            {packs.map((pack) => {
              const on = config.packIds.includes(pack.id);
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => togglePack(pack.id)}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent",
                  )}
                >
                  <span aria-hidden>{pack.emoji}</span>
                  <span className="max-w-40 truncate">{pack.name}</span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      on ? "opacity-80" : "text-muted-foreground",
                    )}
                  >
                    {wordsForDifficulty(pack, config.difficulty).length}
                  </span>
                </button>
              );
            })}
          </div>
          <OptionRow
            label="Dificuldade das palavras"
            stack
            control={
              <Select
                value={config.difficulty}
                onValueChange={(v) => patch({ difficulty: v as Difficulty })}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {DIFFICULTY_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>

      <Card className="gap-2 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Regras</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border px-5">
          <OptionRow
            label="Impostores por rodada"
            hint={`Até ${maxImpostors(Math.max(playerCount, 3))} com ${playerCount} na sala.`}
            control={
              <Stepper
                value={config.impostorCount}
                min={1}
                max={maxImpostors(Math.max(playerCount, 3))}
                onChange={(impostorCount) => patch({ impostorCount })}
              />
            }
          />
          <OptionRow
            label="Rodadas"
            hint="0 = sem limite; o anfitrião encerra quando quiser."
            control={
              <Stepper
                value={config.totalRounds}
                min={0}
                max={20}
                onChange={(totalRounds) => patch({ totalRounds })}
                format={(v) => (v === 0 ? "Sem limite" : null)}
              />
            }
          />
          <OptionRow
            label="O que o impostor recebe"
            stack
            control={
              <Select
                value={config.hint}
                onValueChange={(v) => patch({ hint: v as ImpostorHint })}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(HINT_LABEL) as ImpostorHint[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {HINT_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          <OptionRow
            label="Como a mesa conversa"
            stack
            control={
              <Select
                value={config.discussionMode}
                onValueChange={(v) =>
                  patch({ discussionMode: v as DiscussionMode })
                }
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DISCUSSION_LABEL) as DiscussionMode[]).map(
                    (k) => (
                      <SelectItem key={k} value={k}>
                        {DISCUSSION_LABEL[k]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            }
          />
          <OptionRow
            label="Mostrar a categoria para todos"
            htmlFor="online-category"
            control={
              <Switch
                id="online-category"
                checked={config.showCategoryToAll}
                onCheckedChange={(showCategoryToAll) =>
                  patch({ showCategoryToAll })
                }
              />
            }
          />
          <OptionRow
            label="Empate vira segundo turno"
            htmlFor="online-runoff"
            control={
              <Switch
                id="online-runoff"
                checked={config.runoffOnTie}
                onCheckedChange={(runoffOnTie) => patch({ runoffOnTie })}
              />
            }
          />
          <OptionRow
            label="Chance de redenção"
            hint="Impostor pego pode adivinhar a palavra."
            htmlFor="online-guess"
            control={
              <Switch
                id="online-guess"
                checked={config.impostorGuess}
                onCheckedChange={(impostorGuess) => patch({ impostorGuess })}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
