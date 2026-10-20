"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DoorOpen, Plus, Wifi } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom, joinRoom } from "@/lib/games/impostor/online/client";

const NAME_KEY = "game-night:impostor:my-name";

export function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState(
    (params.get("code") ?? "").toUpperCase(),
  );
  const [busy, setBusy] = React.useState<"create" | "join" | null>(null);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setName(saved);
    } catch {
      // sem localStorage: o nome é digitado toda vez
    }
  }, []);

  const remember = (value: string) => {
    try {
      window.localStorage.setItem(NAME_KEY, value);
    } catch {
      // ignora
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Digite seu nome primeiro.");
      return;
    }
    setBusy("create");
    try {
      const room = await createRoom(name.trim());
      remember(name.trim());
      router.push(`/online/${room.code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falhou ao criar a sala.");
      setBusy(null);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || code.trim().length < 4) {
      toast.error("Precisa do seu nome e do código da sala.");
      return;
    }
    setBusy("join");
    try {
      const room = await joinRoom(code.trim(), name.trim());
      remember(name.trim());
      router.push(`/online/${room.code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falhou ao entrar.");
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Impostor online
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Cada um no seu celular, todo mundo na mesma sala. Útil quando a
          galera está numa chamada de vídeo.
        </p>
      </header>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Seu nome</CardTitle>
          <CardDescription>É assim que a mesa vai te ver.</CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <Label htmlFor="player-name" className="sr-only">
            Seu nome
          </Label>
          <Input
            id="player-name"
            value={name}
            maxLength={20}
            placeholder="Ex: Victor"
            onChange={(e) => setName(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" />
            Criar sala
          </CardTitle>
          <CardDescription>
            Você vira o anfitrião: define as regras e conduz as rodadas. A sala
            e tudo que acontece nela somem depois de 24h.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <Button
            className="w-full"
            disabled={busy !== null}
            onClick={handleCreate}
          >
            {busy === "create" ? "Criando…" : "Criar sala"}
          </Button>
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <DoorOpen className="h-4 w-4 text-primary" />
            Entrar com código
          </CardTitle>
          <CardDescription>
            Leia o QR Code do anfitrião ou digite o código de 5 letras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-5">
          <Label htmlFor="room-code" className="sr-only">
            Código da sala
          </Label>
          <Input
            id="room-code"
            value={code}
            maxLength={5}
            autoCapitalize="characters"
            placeholder="ABCDE"
            className="text-center text-lg tracking-[0.3em] uppercase"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
          />
          <Button
            variant="outline"
            className="w-full"
            disabled={busy !== null}
            onClick={handleJoin}
          >
            {busy === "join" ? "Entrando…" : "Entrar na sala"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
