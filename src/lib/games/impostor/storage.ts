"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { BUILTIN_PACKS } from "./packs";
import { DEFAULT_CONFIG } from "./engine";
import type { ConfigPreset, GameConfig, WordPack } from "./types";

const PACKS_KEY = "game-night:impostor:packs";
const PRESETS_KEY = "game-night:impostor:presets";
const LAST_CONFIG_KEY = "game-night:impostor:last-config";

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/** Pacotes criados pelo usuário + os nativos, numa lista só. */
export function useWordPacks() {
  const [custom, setCustom, ready] = useLocalStorage<WordPack[]>(PACKS_KEY, []);
  const all = React.useMemo(
    () => [...BUILTIN_PACKS, ...custom],
    [custom],
  );

  const createPack = React.useCallback(
    (pack: Omit<WordPack, "id" | "builtin">) => {
      const created: WordPack = { ...pack, id: newId("pack"), builtin: false };
      setCustom((prev) => [...prev, created]);
      return created;
    },
    [setCustom],
  );

  const updatePack = React.useCallback(
    (id: string, patch: Partial<Omit<WordPack, "id" | "builtin">>) => {
      setCustom((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [setCustom],
  );

  const deletePack = React.useCallback(
    (id: string) => setCustom((prev) => prev.filter((p) => p.id !== id)),
    [setCustom],
  );

  const duplicatePack = React.useCallback(
    (source: WordPack) => {
      const copy: WordPack = {
        id: newId("pack"),
        name: `${source.name} (cópia)`,
        emoji: source.emoji,
        builtin: false,
        words: [...source.words],
      };
      setCustom((prev) => [...prev, copy]);
      return copy;
    },
    [setCustom],
  );

  const importPacks = React.useCallback(
    (incoming: WordPack[]) => {
      const sane = incoming
        .filter((p) => p && typeof p.name === "string" && Array.isArray(p.words))
        .map<WordPack>((p) => ({
          id: newId("pack"),
          name: String(p.name).slice(0, 60),
          emoji: typeof p.emoji === "string" && p.emoji ? p.emoji : "🗂️",
          builtin: false,
          words: p.words
            .filter((w): w is string => typeof w === "string")
            .map((w) => w.trim())
            .filter(Boolean),
        }))
        .filter((p) => p.words.length > 0);
      setCustom((prev) => [...prev, ...sane]);
      return sane.length;
    },
    [setCustom],
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

/** Presets de configuração salvos pelo usuário. */
export function useConfigPresets() {
  const [presets, setPresets, ready] = useLocalStorage<ConfigPreset[]>(
    PRESETS_KEY,
    [],
  );

  const savePreset = React.useCallback(
    (name: string, config: GameConfig) => {
      const preset: ConfigPreset = {
        id: newId("preset"),
        name: name.trim() || "Sem nome",
        config,
        updatedAt: Date.now(),
      };
      setPresets((prev) => [preset, ...prev.filter((p) => p.name !== preset.name)]);
      return preset;
    },
    [setPresets],
  );

  const deletePreset = React.useCallback(
    (id: string) => setPresets((prev) => prev.filter((p) => p.id !== id)),
    [setPresets],
  );

  return { presets, ready, savePreset, deletePreset };
}

/** Última configuração usada, pra não refazer tudo na próxima partida. */
export function useLastConfig() {
  return useLocalStorage<GameConfig>(LAST_CONFIG_KEY, DEFAULT_CONFIG);
}
