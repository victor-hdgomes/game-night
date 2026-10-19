"use client";

import * as React from "react";
import { Medal } from "lucide-react";

import type { GameConfig } from "@/lib/games/impostor/types";
import { cn } from "@/lib/utils";

const MEDAL_TONE = [
  "text-[color:var(--color-warning)]",
  "text-muted-foreground",
  "text-[color:var(--color-expense)]",
];

export function rankPlayers(
  config: GameConfig,
  scores: Record<number, number>,
) {
  return config.players
    .map((name, index) => ({ name, index, points: scores[index] ?? 0 }))
    .sort((a, b) => b.points - a.points);
}

export function RankingList({
  config,
  scores,
}: {
  config: GameConfig;
  scores: Record<number, number>;
}) {
  const ranking = rankPlayers(config, scores);

  return (
    <div className="space-y-2">
      {ranking.map((row, position) => (
        <div
          key={row.index}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5",
            position === 0 && row.points > 0
              ? "border-primary/40 bg-primary/5"
              : "border-border",
          )}
        >
          <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
            {position + 1}
          </span>
          {position < 3 ? (
            <Medal className={cn("h-4 w-4 shrink-0", MEDAL_TONE[position])} />
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {row.name}
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {row.points}
          </span>
        </div>
      ))}
    </div>
  );
}
