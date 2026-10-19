"use client";

import * as React from "react";
import {
  Copy,
  Download,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Upload,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BUILTIN_PACKS } from "@/lib/games/impostor/packs";
import { useWordPacks } from "@/lib/games/impostor/storage";
import type { WordPack } from "@/lib/games/impostor/types";

type Draft = {
  id: string | null;
  name: string;
  emoji: string;
  wordsText: string;
};

const EMPTY_DRAFT: Draft = { id: null, name: "", emoji: "🗂️", wordsText: "" };

/** Uma palavra por linha; vírgulas também servem de separador. */
function parseWords(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split(/[\n,]/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => {
      const key = w.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function PackManager() {
  const {
    customPacks,
    ready,
    createPack,
    updatePack,
    deletePack,
    duplicatePack,
    importPacks,
  } = useWordPacks();

  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState("");

  const openNew = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (pack: WordPack) =>
    setDraft({
      id: pack.id,
      name: pack.name,
      emoji: pack.emoji,
      wordsText: pack.words.join("\n"),
    });

  const saveDraft = () => {
    if (!draft) return;
    const words = parseWords(draft.wordsText);
    const name = draft.name.trim();
    if (!name) {
      toast.error("Dê um nome ao pacote.");
      return;
    }
    if (words.length < 2) {
      toast.error("Coloque pelo menos 2 palavras.");
      return;
    }
    if (draft.id) {
      updatePack(draft.id, { name, emoji: draft.emoji || "🗂️", words });
      toast.success("Pacote atualizado.");
    } else {
      createPack({ name, emoji: draft.emoji || "🗂️", words });
      toast.success("Pacote criado.");
    }
    setDraft(null);
  };

  const exportPacks = () => {
    if (customPacks.length === 0) {
      toast.error("Você ainda não tem pacotes próprios.");
      return;
    }
    const blob = new Blob([JSON.stringify(customPacks, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meus-pacotes-impostor.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const runImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const list: WordPack[] = Array.isArray(parsed) ? parsed : [parsed];
      const count = importPacks(list);
      if (count === 0) {
        toast.error("Nenhum pacote válido no JSON.");
        return;
      }
      toast.success(`${count} pacote(s) importado(s).`);
      setImportText("");
      setImportOpen(false);
    } catch {
      toast.error("JSON inválido.");
    }
  };

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Pacotes de palavras
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Os nativos são só leitura: duplique para adaptar à sua turma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={exportPacks}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo pacote
          </Button>
        </div>
      </header>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Meus pacotes</CardTitle>
          <CardDescription>
            {customPacks.length === 0
              ? "Nenhum ainda. Crie do zero ou duplique um nativo."
              : `${customPacks.length} pacote(s) seus.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {customPacks.map((pack) => (
            <div
              key={pack.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span className="text-lg" aria-hidden>
                {pack.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pack.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {pack.words.length} palavras · {pack.words.slice(0, 3).join(", ")}
                  {pack.words.length > 3 ? "…" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Editar ${pack.name}`}
                  onClick={() => openEdit(pack)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Apagar ${pack.name}`}
                  onClick={() => {
                    deletePack(pack.id);
                    toast.success("Pacote apagado.");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <CardTitle className="text-base">Pacotes nativos</CardTitle>
          <CardDescription>
            {BUILTIN_PACKS.length} categorias prontas para usar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          {BUILTIN_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span className="text-lg" aria-hidden>
                {pack.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pack.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {pack.words.slice(0, 4).join(", ")}…
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {pack.words.length}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Duplicar ${pack.name}`}
                onClick={() => {
                  duplicatePack(pack);
                  toast.success(`"${pack.name}" duplicado para edição.`);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "Editar pacote" : "Novo pacote"}
            </DialogTitle>
            <DialogDescription>
              Uma palavra por linha. Vírgula também separa.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="w-20 space-y-1.5">
                  <Label htmlFor="pack-emoji">Ícone</Label>
                  <Input
                    id="pack-emoji"
                    value={draft.emoji}
                    maxLength={4}
                    className="text-center"
                    onChange={(e) =>
                      setDraft({ ...draft, emoji: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="pack-name">Nome</Label>
                  <Input
                    id="pack-name"
                    value={draft.name}
                    maxLength={40}
                    placeholder="Ex: Memes do grupo"
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pack-words">Palavras</Label>
                <Textarea
                  id="pack-words"
                  value={draft.wordsText}
                  rows={10}
                  placeholder={"Praia\nAeroporto\nHospital"}
                  onChange={(e) =>
                    setDraft({ ...draft, wordsText: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {parseWords(draft.wordsText).length} palavras válidas
                  (duplicadas são ignoradas).
                </p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={saveDraft}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar pacotes</DialogTitle>
            <DialogDescription>
              Cole um JSON no formato{" "}
              <code className="text-xs">
                [{"{"} &quot;name&quot;, &quot;emoji&quot;, &quot;words&quot;: []{" "}
                {"}"}]
              </code>
              .
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            rows={10}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{"name":"Meu pacote","emoji":"🎯","words":["Um","Dois"]}]'
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={runImport} disabled={!importText.trim()}>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
