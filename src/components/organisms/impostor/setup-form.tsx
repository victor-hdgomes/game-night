"use client";

import * as React from "react";
import {
  AlertTriangle,
  Layers,
  Play,
  Plus,
  Shuffle,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { OptionRow, Stepper } from "@/components/molecules/option-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  maxImpostors,
  validateConfig,
} from "@/lib/games/impostor/engine";
import type {
  GameConfig,
  ImpostorHint,
  TurnOrder,
  WordPack,
} from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

const HINT_LABEL: Record<ImpostorHint, string> = {
  none: "Nada (modo clássico)",
  category: "Só a categoria",
  letter: "Primeira letra e tamanho",
  similar: "Uma palavra parecida",
};

export function SetupForm({
  config,
  onChange,
  packs,
  onStart,
}: {
  config: GameConfig;
  onChange: (next: GameConfig) => void;
  packs: WordPack[];
  onStart: () => void;
}) {
  const [newPlayer, setNewPlayer] = React.useState("");

  const issues = validateConfig(config, packs);
  const patch = (p: Partial<GameConfig>) => onChange({ ...config, ...p });

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (!name) return;
    if (config.players.length >= MAX_PLAYERS) {
      toast.error(`Máximo de ${MAX_PLAYERS} jogadores.`);
      return;
    }
    if (
      config.players.some((p) => p.toLowerCase() === name.toLowerCase())
    ) {
      toast.error("Esse nome já está na lista.");
      return;
    }
    patch({ players: [...config.players, name] });
    setNewPlayer("");
  };

  const removePlayer = (index: number) => {
    const players = config.players.filter((_, i) => i !== index);
    patch({
      players,
      impostorCount: Math.min(
        config.impostorCount,
        maxImpostors(players.length),
      ),
    });
  };

  const togglePack = (id: string) => {
    const next = config.packIds.includes(id)
      ? config.packIds.filter((p) => p !== id)
      : [...config.packIds, id];
    patch({ packIds: next });
  };

  const selectedWords = packs
    .filter((p) => config.packIds.includes(p.id))
    .reduce((sum, p) => sum + p.words.length, 0);

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-primary" />
            Jogadores
          </CardTitle>
          <CardDescription>
            De {MIN_PLAYERS} a {MAX_PLAYERS} pessoas. O celular passa de mão em
            mão nessa ordem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5">
          <div className="flex gap-2">
            <Input
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPlayer();
                }
              }}
              placeholder="Nome do jogador"
              maxLength={20}
              aria-label="Nome do jogador"
            />
            <Button type="button" onClick={addPlayer} size="icon">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Adicionar jogador</span>
            </Button>
          </div>

          {config.players.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {config.players.map((player, index) => (
                <span
                  key={`${player}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary py-1 pr-1 pl-3 text-sm"
                >
                  <span className="max-w-36 truncate">{player}</span>
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    aria-label={`Remover ${player}`}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ninguém na mesa ainda.
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {config.players.length} na mesa
            </span>
            {config.players.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => patch({ players: [] })}
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" />
            Pacotes de palavras
          </CardTitle>
          <CardDescription>
            {config.packIds.length} selecionados · {selectedWords} palavras no
            sorteio.
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
                    {pack.words.length}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-2 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Regras da partida</CardTitle>
          <CardDescription>
            Tudo aqui vale para a partida inteira.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border px-5">
          <OptionRow
            label="Impostores por rodada"
            hint={`Até ${maxImpostors(config.players.length || MIN_PLAYERS)} com a mesa atual.`}
            control={
              <Stepper
                value={config.impostorCount}
                min={1}
                max={maxImpostors(config.players.length || MIN_PLAYERS)}
                onChange={(impostorCount) => patch({ impostorCount })}
              />
            }
          />
          <OptionRow
            label="Rodadas"
            hint="No zero a partida não acaba sozinha: vocês encerram quando quiserem e o pódio aparece."
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
            hint="Quanto mais pista, mais fácil para quem blefa."
            stack
            control={
              <Select
                value={config.hint}
                onValueChange={(hint) => patch({ hint: hint as ImpostorHint })}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(HINT_LABEL) as ImpostorHint[]
                  ).map((key) => (
                    <SelectItem key={key} value={key}>
                      {HINT_LABEL[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
          {config.hint === "similar" ? (
            <OptionRow
              label="Avisar que a pessoa é o impostor"
              hint="Desligado, o impostor nem sabe que é — acha que está com a palavra certa."
              htmlFor="tell-role"
              control={
                <Switch
                  id="tell-role"
                  checked={config.tellImpostorRole}
                  onCheckedChange={(tellImpostorRole) =>
                    patch({ tellImpostorRole })
                  }
                />
              }
            />
          ) : null}
          <OptionRow
            label="Mostrar a categoria para todos"
            hint="Ajuda a conversa a ter rumo logo na primeira rodada."
            htmlFor="show-category"
            control={
              <Switch
                id="show-category"
                checked={config.showCategoryToAll}
                onCheckedChange={(showCategoryToAll) =>
                  patch({ showCategoryToAll })
                }
              />
            }
          />
          <OptionRow
            label="Rodada de dicas"
            hint="Cada um fala uma palavra sobre o tema antes da discussão solta."
            htmlFor="hint-round"
            control={
              <Switch
                id="hint-round"
                checked={config.hintRound}
                onCheckedChange={(hintRound) => patch({ hintRound })}
              />
            }
          />
          <OptionRow
            label="Ordem de fala"
            stack
            control={
              <Select
                value={config.turnOrder}
                onValueChange={(v) => patch({ turnOrder: v as TurnOrder })}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Sorteada a cada rodada</SelectItem>
                  <SelectItem value="clockwise">
                    Mesma ordem do cadastro
                  </SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <OptionRow
            label="Votação no app"
            hint="Conta os votos na tela. Desligado, o grupo decide no grito."
            htmlFor="voting"
            control={
              <Switch
                id="voting"
                checked={config.votingEnabled}
                onCheckedChange={(votingEnabled) => patch({ votingEnabled })}
              />
            }
          />
          <OptionRow
            label="Chance de redenção"
            hint="Impostor pego pode adivinhar a palavra e roubar pontos."
            htmlFor="guess"
            control={
              <Switch
                id="guess"
                checked={config.impostorGuess}
                onCheckedChange={(impostorGuess) => patch({ impostorGuess })}
              />
            }
          />
        </CardContent>
      </Card>

      {issues.length > 0 ? (
        <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <ul className="space-y-0.5">
            {issues.map((issue) => (
              <li key={issue.field + issue.message}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="sticky bottom-20 z-10 md:bottom-4">
        <Button
          type="button"
          size="lg"
          className="w-full shadow-lg"
          disabled={issues.length > 0}
          onClick={onStart}
        >
          <Play className="h-4 w-4" />
          Começar partida
        </Button>
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-xs text-muted-foreground">
        <Shuffle className="h-3.5 w-3.5" />
        Palavras e impostores são sorteados a cada rodada.
      </p>
    </div>
  );
}
