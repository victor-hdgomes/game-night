"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Linha de configuração: rótulo + explicação à esquerda, controle à direita.
 * No celular o controle desce para baixo quando não cabe.
 */
export function OptionRow({
  label,
  hint,
  htmlFor,
  control,
  className,
  stack,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  control: React.ReactNode;
  className?: string;
  /** Força o controle abaixo do texto (útil para controles largos). */
  stack?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        stack
          ? "flex-col"
          : "flex-col sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </Label>
        {hint ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
      <div className={cn("shrink-0", stack && "w-full")}>{control}</div>
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
  format,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  suffix?: string;
  /** Texto no lugar do número (ex: 0 vira "Sem limite"). */
  format?: (value: number) => string | null;
}) {
  const label = format?.(value);
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border p-1">
      <button
        type="button"
        aria-label="Diminuir"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="size-8 rounded-sm text-base leading-none transition-colors hover:bg-accent disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-24 text-center text-sm font-medium tabular-nums">
        {label ?? `${value}${suffix ? ` ${suffix}` : ""}`}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="size-8 rounded-sm text-base leading-none transition-colors hover:bg-accent disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
