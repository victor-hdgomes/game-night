"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Flag,
  Gavel,
  LogOut,
  MessageCircleQuestion,
  PartyPopper,
  ShieldCheck,
  Skull,
  Trophy,
  Users,
  VenetianMask,
} from "lucide-react";
import { toast } from "sonner";

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
import { Skeleton } from "@/components/ui/skeleton";
import { forgetPlayerId, useRoom } from "@/lib/games/impostor/online/client";
import type { PlayerView } from "@/lib/games/impostor/online/types";
import { useWordPacks } from "@/lib/games/impostor/storage";
import { cn } from "@/lib/utils";

import { RoomConfig } from "./room-config";

export function OnlineRoom({ code }: { code: string }) {
  const router = useRouter();
  const { view, status, error, send } = useRoom(code);
  const { packs } = useWordPacks();

  React.useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (status === "gone") {
    return (
      <Card className="gap-4 py-6 text-center">
        <CardContent className="space-y-4 px-5">
          <h1 className="text-lg font-semibold">Sala indisponível</h1>
          <p className="text-sm text-muted-foreground">
            Ela expirou (salas duram 24h), foi encerrada, ou este aparelho
            ainda não entrou nela.
          </p>
          <Button onClick={() => router.push(`/online?code=${code}`)}>
            Entrar com o código {code}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!view) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { state, you } = view;
  const isHost = you.isHost;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <VenetianMask className="h-5 w-5 shrink-0 text-primary" />
            <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">
              Sala {state.code}
            </h1>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {you.name}
            {isHost ? " · anfitrião" : ""} ·{" "}
            {state.players.length} na sala
            {state.round ? ` · rodada ${state.round.index + 1}` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await send({ type: "leave" });
            forgetPlayerId(code);
            router.push("/online");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </header>

      {state.phase === "setup" ? (
        <Lobby view={view} packs={packs} onSend={send} />
      ) : null}
      {state.phase === "reveal" ? <Reveal view={view} onSend={send} /> : null}
      {state.phase === "discussion" ? (
        <Discussion view={view} onSend={send} />
      ) : null}
      {state.phase === "voting" ? <Voting view={view} onSend={send} /> : null}
      {state.phase === "result" ? <Result view={view} onSend={send} /> : null}
      {state.phase === "gameover" ? (
        <GameOver view={view} onSend={send} />
      ) : null}
    </div>
  );
}

type Send = ReturnType<typeof useRoom>["send"];

function PlayerList({
  view,
  highlight,
}: {
  view: PlayerView;
  highlight?: string[];
}) {
  return (
    <div className="space-y-2">
      {view.state.players.map((player) => (
        <div
          key={player.id}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
            highlight?.includes(player.id)
              ? "border-primary/50 bg-primary/5"
              : "border-border",
          )}
        >
          <span className="min-w-0 flex-1 truncate">{player.name}</span>
          {player.isHost ? (
            <Crown className="h-4 w-4 shrink-0 text-[color:var(--color-warning)]" />
          ) : null}
          {player.id === view.you.id ? (
            <Badge variant="secondary" className="shrink-0">
              você
            </Badge>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Lobby({
  view,
  packs,
  onSend,
}: {
  view: PlayerView;
  packs: ReturnType<typeof useWordPacks>["packs"];
  onSend: Send;
}) {
  const { state, you } = view;
  const [qr, setQr] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const link =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/online?code=${state.code}`;

  React.useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { width: 320, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [link]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não deu para copiar. Dite o código mesmo.");
    }
  };

  const expiresAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(state.expiresAt));

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-6 text-center">
        <CardContent className="space-y-4 px-5">
          <p className="text-xs text-muted-foreground">
            Código da sala — some em {expiresAt}
          </p>
          <p className="text-4xl font-bold tracking-[0.3em] tabular-nums">
            {state.code}
          </p>
          {qr ? (
            <Image
              src={qr}
              alt={`QR Code da sala ${state.code}`}
              width={176}
              height={176}
              unoptimized
              className="mx-auto size-44 rounded-lg bg-white p-2"
            />
          ) : (
            <Skeleton className="mx-auto size-44" />
          )}
          <Button variant="outline" className="w-full" onClick={copy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copiar link
          </Button>
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Na sala ({state.players.length})
          </CardTitle>
          <CardDescription>
            Mínimo de 3 para começar. Quem entrar depois do início só joga na
            próxima sala.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <PlayerList view={view} />
        </CardContent>
      </Card>

      {you.isHost ? (
        <>
          <RoomConfig
            config={state.config}
            packs={packs}
            playerCount={state.players.length}
            onChange={(config) =>
              onSend({
                type: "config",
                config,
                packs: packs.filter((p) => !p.builtin),
              })
            }
          />
          <div className="sticky bottom-20 z-10 md:bottom-4">
            <Button
              size="lg"
              className="w-full shadow-lg"
              disabled={state.players.length < 3}
              onClick={() => onSend({ type: "start" })}
            >
              {state.players.length < 3
                ? `Faltam ${3 - state.players.length} jogador(es)`
                : "Começar partida"}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Esperando o anfitrião começar…
        </p>
      )}
    </div>
  );
}

function SecretCard({ view }: { view: PlayerView }) {
  const [open, setOpen] = React.useState(false);
  const card = view.card;
  if (!card) return null;

  return (
    <Card className="min-h-72 justify-center gap-6 py-8 text-center">
      <CardContent className="space-y-6 px-5">
        {!open ? (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
              <Eye className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Ninguém pode ver sua tela agora.
            </p>
            <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
              <Eye className="h-4 w-4" />
              Ver minha carta
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              {card.isImpostor && card.showRole ? (
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
            {view.state.round?.showCategory ? (
              <p className="text-xs text-muted-foreground">
                {view.state.round.packEmoji} {view.state.round.packName}
              </p>
            ) : null}
            <h2 className="text-3xl leading-tight font-bold tracking-tight break-words sm:text-4xl">
              {card.title}
            </h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              {card.subtitle}
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              <EyeOff className="h-4 w-4" />
              Esconder
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Reveal({ view, onSend }: { view: PlayerView; onSend: Send }) {
  const { state, you } = view;
  const seen = state.revealed.includes(you.id);
  const total = state.players.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {state.revealed.length} de {total} já viram
          </span>
          <span>Rodada {(state.round?.index ?? 0) + 1}</span>
        </div>
        <Progress value={(state.revealed.length / total) * 100} />
      </div>

      <SecretCard view={view} />

      {!seen ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSend({ type: "reveal" })}
        >
          <Check className="h-4 w-4" />
          Já vi minha carta
        </Button>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Esperando os outros…
        </p>
      )}

      <PlayerList view={view} highlight={state.revealed} />

      {you.isHost ? (
        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Button
            size="lg"
            className="w-full shadow-lg"
            disabled={state.revealed.length < total}
            onClick={() => onSend({ type: "discussion" })}
          >
            {state.revealed.length < total
              ? `Faltam ${total - state.revealed.length} para ver`
              : "Começar a discussão"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Discussion({ view, onSend }: { view: PlayerView; onSend: Send }) {
  const { state, you } = view;
  const round = state.round;
  const nameOf = (id: string) =>
    state.players.find((p) => p.id === id)?.name ?? "?";

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircleQuestion className="h-4 w-4 text-primary" />
            Discussão
          </CardTitle>
          <CardDescription>
            {state.config.discussionMode === "questions"
              ? `Rodada de perguntas: ${nameOf(round?.firstSpeaker ?? "")} abre perguntando para quem quiser, e quem responde pergunta em seguida.`
              : state.config.discussionMode === "hints"
                ? "Cada um fala uma palavra sobre o tema, nesta ordem."
                : `Conversa livre. Quem começa: ${nameOf(round?.firstSpeaker ?? "")}.`}
            {round?.showCategory
              ? ` Categoria: ${round.packEmoji} ${round.packName}.`
              : ""}
          </CardDescription>
        </CardHeader>
        {state.config.discussionMode === "hints" && round ? (
          <CardContent className="px-5">
            <ol className="space-y-2">
              {round.speakingOrder.map((id, position) => (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                    {position + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{nameOf(id)}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        ) : null}
      </Card>

      <SecretCard view={view} />

      {you.isHost ? (
        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Button
            size="lg"
            className="w-full shadow-lg"
            onClick={() => onSend({ type: "voting" })}
          >
            <Gavel className="h-4 w-4" />
            Abrir a votação
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          O anfitrião abre a votação quando a mesa decidir.
        </p>
      )}
    </div>
  );
}

function Voting({ view, onSend }: { view: PlayerView; onSend: Send }) {
  const { state, you } = view;
  const { votes } = state;
  const voted = votes.voted.includes(you.id);
  const candidates = votes.candidates ?? state.players.map((p) => p.id);

  return (
    <div className="space-y-4">
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel className="h-4 w-4 text-primary" />
            {votes.runoff ? "Segundo turno" : "Votação"}
          </CardTitle>
          <CardDescription>
            {votes.runoff
              ? "Empatou: só os mais votados seguem."
              : "Cada um vota no próprio celular."}{" "}
            {votes.voted.length} de {state.players.length} já votaram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {state.players
            .filter((p) => candidates.includes(p.id))
            .map((player) => (
              <button
                key={player.id}
                type="button"
                disabled={voted}
                onClick={() => onSend({ type: "vote", targetId: player.id })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  voted
                    ? "border-border bg-muted"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{player.name}</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {votes.counts[player.id] ?? 0}
                </span>
              </button>
            ))}
          {!voted ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onSend({ type: "vote", targetId: null })}
            >
              Votar em branco
            </Button>
          ) : (
            <p className="pt-1 text-center text-sm text-muted-foreground">
              Voto registrado. Esperando o resto da mesa.
            </p>
          )}
        </CardContent>
      </Card>

      {you.isHost ? (
        <div className="sticky bottom-20 z-10 md:bottom-4">
          <Button
            size="lg"
            className="w-full shadow-lg"
            onClick={() => onSend({ type: "closeVote" })}
          >
            Fechar votação agora
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Result({ view, onSend }: { view: PlayerView; onSend: Send }) {
  const { state, you } = view;
  const revealed = state.revealedRound;
  if (!revealed) return null;

  const nameOf = (id: string) =>
    state.players.find((p) => p.id === id)?.name ?? "?";
  const askGuess = revealed.caught && state.config.impostorGuess;
  const total = state.config.totalRounds;
  const isLast = total > 0 && state.outcomes.length + 1 >= total;

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "gap-4 py-6 text-center",
          revealed.caught ? "border-income/50" : "border-expense/50",
        )}
      >
        <CardContent className="space-y-4 px-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            {revealed.caught ? (
              <PartyPopper className="h-6 w-6 text-[color:var(--color-income)]" />
            ) : (
              <Skull className="h-6 w-6 text-[color:var(--color-expense)]" />
            )}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            {revealed.caught ? "Impostor desmascarado!" : "O impostor escapou!"}
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              A palavra era{" "}
              <span className="font-semibold text-foreground">
                {revealed.word}
              </span>
            </p>
            <p>
              {revealed.impostorIds.length > 1 ? "Impostores: " : "Impostor: "}
              <span className="font-semibold text-foreground">
                {revealed.impostorIds.map(nameOf).join(", ")}
              </span>
            </p>
            <p>
              Acusado:{" "}
              <span className="font-medium text-foreground">
                {revealed.accusedId ? nameOf(revealed.accusedId) : "ninguém"}
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
              {revealed.impostorIds.map(nameOf).join(", ")} chuta a palavra.
              Acertou?
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 px-5">
            <Button
              variant={state.impostorGuessedWord ? "default" : "outline"}
              className="flex-1"
              disabled={!you.isHost}
              onClick={() => onSend({ type: "guess", guessed: true })}
            >
              Acertou (+{state.config.scoring.impostorGuess})
            </Button>
            <Button
              variant={!state.impostorGuessedWord ? "default" : "outline"}
              className="flex-1"
              disabled={!you.isHost}
              onClick={() => onSend({ type: "guess", guessed: false })}
            >
              Errou
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Ranking view={view} />

      {you.isHost ? (
        <div className="sticky bottom-20 z-10 space-y-2 md:bottom-4">
          <Button
            size="lg"
            className="w-full shadow-lg"
            onClick={() => onSend({ type: "next" })}
          >
            {isLast ? "Ver pódio" : "Próxima rodada"}
          </Button>
          {!isLast ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSend({ type: "finish" })}
            >
              <Flag className="h-4 w-4" />
              Encerrar e ver pódio
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          O anfitrião puxa a próxima rodada.
        </p>
      )}
    </div>
  );
}

function Ranking({ view }: { view: PlayerView }) {
  const ranking = [...view.state.players]
    .map((p) => ({ ...p, points: view.state.scores[p.id] ?? 0 }))
    .sort((a, b) => b.points - a.points);

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-[color:var(--color-warning)]" />
          Placar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-5">
        {ranking.map((row, position) => (
          <div
            key={row.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
              position === 0 && row.points > 0
                ? "border-primary/40 bg-primary/5"
                : "border-border",
            )}
          >
            <span className="w-5 shrink-0 text-center font-semibold tabular-nums text-muted-foreground">
              {position + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {row.name}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              {row.points}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GameOver({ view, onSend }: { view: PlayerView; onSend: Send }) {
  return (
    <div className="space-y-4">
      <Card className="gap-3 py-6 text-center">
        <CardContent className="space-y-2 px-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <Trophy className="h-6 w-6 text-[color:var(--color-warning)]" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Fim de partida
          </h2>
          <p className="text-sm text-muted-foreground">
            {view.state.outcomes.length} rodada
            {view.state.outcomes.length === 1 ? "" : "s"} jogada
            {view.state.outcomes.length === 1 ? "" : "s"}.
          </p>
        </CardContent>
      </Card>

      <Ranking view={view} />

      {view.you.isHost ? (
        <Button
          size="lg"
          className="w-full"
          onClick={() => onSend({ type: "restart" })}
        >
          Nova partida com a mesma galera
        </Button>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          O anfitrião pode começar outra partida com a mesma sala.
        </p>
      )}
    </div>
  );
}
