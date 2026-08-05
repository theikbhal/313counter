"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr } from "@/lib/zikr";

const COLUMNS = 3;
const MAX_CARDS = 600;

export default function CardsPage() {
  const zikr = useZikr();

  const model = useMemo(() => {
    const cellSize = Math.max(1, Math.ceil(zikr.target / MAX_CARDS));
    const cards = Math.ceil(zikr.target / cellSize);
    const filled = Math.min(cards, Math.floor(zikr.count / cellSize));
    const base = Math.floor(cards / COLUMNS);
    const rem = cards % COLUMNS;
    const columns = Array.from({ length: COLUMNS }, (_, i) =>
      i < rem ? base + 1 : base
    );
    return { cellSize, cards, filled, columns };
  }, [zikr.target, zikr.count]);

  let globalIndex = 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link
          href="/ideas"
          className="text-sm font-medium text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          ← Ideas
        </Link>
        <h1 className="text-sm font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
          Cards
        </h1>
        <button
          onClick={zikr.reset}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Reset
        </button>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">
            {zikr.count.toLocaleString()}
          </span>
          <span className="text-xl font-light text-zinc-400 dark:text-zinc-600">
            / {zikr.target.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(zikr.progress * 100).toFixed(2)}%` }}
          />
        </div>
        {model.cellSize > 1 && (
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            each card = {model.cellSize.toLocaleString()}
          </p>
        )}
        {zikr.isDone && (
          <p className="text-center text-sm font-medium text-emerald-500">
            All {model.cards.toLocaleString()} cards filled — ma sha Allah 🎉
          </p>
        )}
      </section>

      <nav className="grid grid-cols-2 gap-2">
        {DEFAULTS.map((z) => (
          <button
            key={z.key}
            onClick={() => zikr.setActive(z.key)}
            className={`rounded-2xl px-4 py-3 text-center transition ${
              zikr.active === z.key
                ? "bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="text-sm font-medium">{z.label}</div>
            <div className="text-xs opacity-60">
              {model.cards.toLocaleString()} cards
            </div>
          </button>
        ))}
      </nav>

      <section className="rounded-3xl border border-zinc-100 p-3 dark:border-zinc-900">
        <div className="flex gap-1.5">
          {model.columns.map((size, col) => {
            const columnCards = Array.from({ length: size }, () => globalIndex++);
            return (
              <div key={col} className="flex flex-1 flex-col gap-1.5">
                {columnCards.map((gi) => {
                  const isFilled = gi < model.filled;
                  return (
                    <button
                      key={gi}
                      onClick={() => zikr.increment(model.cellSize)}
                      disabled={zikr.isDone || isFilled}
                      aria-label={
                        isFilled
                          ? `Card ${gi + 1} filled`
                          : `Fill card ${gi + 1}`
                      }
                      className={`h-6 rounded-md border transition active:scale-95 disabled:cursor-default ${
                        isFilled
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-zinc-300/70 bg-zinc-50 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-500"
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          {model.filled.toLocaleString()} of {model.cards.toLocaleString()} cards filled
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2">
        {[1, 5, 10, 30].map((n) => (
          <button
            key={n}
            onClick={() => zikr.increment(n * model.cellSize)}
            disabled={zikr.isDone}
            className="h-11 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            +{n}
          </button>
        ))}
      </div>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          The target is a wall of {model.cards.toLocaleString()} cards in {COLUMNS} vertical
          lines — fill each horizontal card until every one is green.
        </p>
      </footer>
    </main>
  );
}
