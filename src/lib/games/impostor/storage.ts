"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { BUILTIN_PACKS } from "./packs";
import { DEFAULT_CONFIG, DEFAULT_SCORING } from "./engine";
import type { GameConfig, PackWord, WordPack } from "./types";

const PACKS_KEY = "game-night:impostor:packs";
const LAST_CONFIG_KEY = "game-night:impostor:last-config";

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Aceita o formato antigo (lista de strings) e o novo (com dificuldade). */
function normalizeWords(words: unknown): PackWord[] {
  if (!Array.isArray(words)) return [];
  const seen = new Set<string>();
  const out: PackWord[] = [];
  for (const raw of words) {
    const word: PackWord | null =
      typeof raw === "string"
        ? { text: raw.trim(), level: "easy" }
        : raw && typeof raw === "object" && typeof (raw as PackWord).text === "string"
          ? {
              text: String((raw as PackWord).text).trim(),
              level: (raw as PackWord).level === "hard" ? "hard" : "easy",
            }
          : null;
    if (!word || !word.text) continue;
    const key = word.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(word);
  }
  return out;
}

function normalizePack(pack: WordPack): WordPack {
  return { ...pack, builtin: false, words: normalizeWords(pack.words) };
}

/** Pacotes criados pelo usuário + os nativos, numa lista só. */
export function useWordPacks() {
  const [stored, setStored, ready] = useLocalStorage<WordPack[]>(PACKS_KEY, []);

  // Pacotes salvos antes da dificuldade existir vinham como lista de strings.
  const custom = React.useMemo(
    () => (Array.isArray(stored) ? stored.map(normalizePack) : []),
    [stored],
  );
  const all = React.useMemo(() => [...BUILTIN_PACKS, ...custom], [custom]);

  const createPack = React.useCallback(
    (pack: Omit<WordPack, "id" | "builtin">) => {
      const created: WordPack = { ...pack, id: newId("pack"), builtin: false };
      setStored((prev) => [...prev, created]);
      return created;
    },
    [setStored],
  );

  const updatePack = React.useCallback(
    (id: string, patch: Partial<Omit<WordPack, "id" | "builtin">>) => {
      setStored((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [setStored],
  );

  const deletePack = React.useCallback(
    (id: string) => setStored((prev) => prev.filter((p) => p.id !== id)),
    [setStored],
  );

  const duplicatePack = React.useCallback(
    (source: WordPack) => {
      const copy: WordPack = {
        id: newId("pack"),
        name: `${source.name} (cópia)`,
        emoji: source.emoji,
        builtin: false,
        words: source.words.map((w) => ({ ...w })),
      };
      setStored((prev) => [...prev, copy]);
      return copy;
    },
    [setStored],
  );

  const importPacks = React.useCallback(
    (incoming: WordPack[]) => {
      const sane = incoming
        .filter((p) => p && typeof p.name === "string")
        .map<WordPack>((p) => ({
          id: newId("pack"),
          name: String(p.name).slice(0, 60),
          emoji: typeof p.emoji === "string" && p.emoji ? p.emoji : "🗂️",
          builtin: false,
          words: normalizeWords(p.words),
        }))
        .filter((p) => p.words.length > 0);
      setStored((prev) => [...prev, ...sane]);
      return sane.length;
    },
    [setStored],
  );

  return {
    packs: all,
    customPacks: custom,
    ready,
    createPack,
    updatePack,
    deletePack,
    duplicatePack,
    importPacks,
  };
}

/** Completa configurações salvas por versões anteriores do app. */
function normalizeConfig(config: GameConfig): GameConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    scoring: { ...DEFAULT_SCORING, ...(config?.scoring ?? {}) },
  };
}

/** Última configuração usada, pra não refazer tudo na próxima partida. */
export function useLastConfig() {
  const [stored, setStored, ready] = useLocalStorage<GameConfig>(
    LAST_CONFIG_KEY,
    DEFAULT_CONFIG,
  );
  const config = React.useMemo(() => normalizeConfig(stored), [stored]);
  return [config, setStored, ready] as const;
}
