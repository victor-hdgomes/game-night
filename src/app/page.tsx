import Link from "next/link";
import { ArrowRight, Dices, Layers, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GAMES } from "@/lib/games/catalog";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Dices className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Sala de Jogos
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Jogos para a turma jogar junta usando um aparelho só. Escolha um jogo,
          ajuste as regras e passe o celular.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const Icon = game.icon;
          const ready = game.status === "ready";
          return (
            <Card
              key={game.slug}
              className={cn(
                "h-full gap-4 py-5 transition-colors",
                ready
                  ? "hover:border-primary/40"
                  : "opacity-70",
              )}
            >
              <CardHeader className="px-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <Badge variant={ready ? "default" : "secondary"}>
                    {ready ? "Jogável" : "Em breve"}
                  </Badge>
                </div>
                <CardTitle className="pt-2 text-base">{game.name}</CardTitle>
                <CardDescription>{game.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {game.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-1">
                    {game.players}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1">
                    {game.minutes}
                  </span>
                </div>
                {ready ? (
                  <Button asChild className="w-full">
                    <Link href={game.href}>
                      Jogar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    Em breve
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="gap-3 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              Pacotes de palavras
            </CardTitle>
            <CardDescription>
              Crie suas próprias categorias, edite as nativas e importe listas
              em JSON.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/impostor/pacotes">Abrir editor</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-3 py-5">
          <CardHeader className="px-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" />
              Como funciona
            </CardTitle>
            <CardDescription>
              Um aparelho, todo mundo em volta.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 text-sm text-muted-foreground">
            <ol className="list-inside list-decimal space-y-1">
              <li>Cadastre a galera e escolha as regras.</li>
              <li>Passe o celular: cada um vê sua carta em segredo.</li>
              <li>Discutam, votem e revelem o impostor.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
