"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr } from "@/lib/zikr";

const MAX_CELLS = 600;

export default function RectanglePage() {
  const zikr = useZikr();

  const model = useMemo(() => {
    const cellSize = Math.max(1, Math.ceil(zikr.target / MAX_CELLS));
    const cells = Math.ceil(zikr.target / cellSize);
    const filled = Math.min(cells, Math.floor(zikr.count / cellSize));
    return { cellSize, cells, filled };
  }, [zikr.target, zikr.count]);

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
          Rectangle
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
            each cell = {model.cellSize.toLocaleString()}
          </p>
        )}
        {zikr.isDone && (
          <p className="text-center text-sm font-medium text-emerald-500">
            Rectangle filled — ma sha Allah 🎉
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
            <div className="text-xs opacity-60">{zikr.targets[z.key]?.toLocaleString()}</div>
          </button>
        ))}
      </nav>

      <section className="rounded-3xl border border-zinc-100 p-4 dark:border-zinc-900">
        <div className="mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div
            className="grid h-full w-full gap-px"
            style={{ gridTemplateColumns: "repeat(20, 1fr)" }}
          >
            {Array.from({ length: model.cells }).map((_, i) => (
              <div
                key={i}
                className={`min-h-px rounded-[2px] ${
                  i < model.filled
                    ? "bg-emerald-500"
                    : "bg-zinc-200/70 dark:bg-zinc-800/70"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          {model.filled.toLocaleString()} of {model.cells.toLocaleString()} cells filled
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2">
        {[1, 5, 10, 30].map((n) => (
          <button
            key={n}
            onClick={() => zikr.increment(n)}
            disabled={zikr.isDone}
            className="h-11 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            +{n}
          </button>
        ))}
      </div>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Idea 2 — each target goal is a rectangle; fill it with grid cells to match.
        </p>
      </footer>
    </main>
  );
}
