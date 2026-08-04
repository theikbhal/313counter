"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr } from "@/lib/zikr";

const CHAIN = [5, 10, 20, 30, 50, 100];

export default function JarV2Page() {
  const zikr = useZikr();
  const [fills, setFills] = useState<number[]>(() => CHAIN.map(() => 0));
  const [bigCount, setBigCount] = useState(0);

  const total = bigCount + fills.reduce((a, b) => a + b, 0);
  const progress = Math.min(1, total / zikr.target);
  const isDone = total >= zikr.target;

  const pour = (n: number) => {
    setFills((prev) => {
      const f = [...prev];
      f[0] += n;
      for (let i = 0; i < CHAIN.length; i++) {
        while (f[i] >= CHAIN[i]) {
          f[i] -= CHAIN[i];
          if (i + 1 < CHAIN.length) f[i + 1] += CHAIN[i];
          else setBigCount((b) => b + CHAIN[i]);
        }
      }
      return f;
    });
  };

  const reset = () => {
    setFills(CHAIN.map(() => 0));
    setBigCount(0);
  };

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
          Jars v2 · Cascade
        </h1>
        <button
          onClick={reset}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Reset
        </button>
      </header>

      <section className="flex flex-col items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">
            {total.toLocaleString()}
          </span>
          <span className="text-xl font-light text-zinc-400 dark:text-zinc-600">
            / {zikr.target.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${(progress * 100).toFixed(2)}%` }}
          />
        </div>
        {isDone && (
          <p className="text-sm font-medium text-sky-500">Cascade complete — ma sha Allah 🎉</p>
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

      <section className="flex flex-col gap-4 rounded-3xl border border-zinc-100 p-6 dark:border-zinc-900">
        <div className="flex items-center justify-center gap-3">
          {CHAIN.map((size, i) => {
            const pct = Math.min(1, (fills[i] || 0) / size);
            const full = fills[i] >= size;
            return (
              <div key={size} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {size.toLocaleString()}
                </span>
                <div
                  className={`relative flex h-24 w-9 items-end justify-center overflow-hidden rounded-b-lg rounded-t-sm border-2 transition ${
                    full
                      ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950"
                      : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
                  }`}
                >
                  <div
                    className="w-full bg-sky-400/80 transition-all duration-300"
                    style={{ height: `${pct * 100}%` }}
                  />
                  {full && (
                    <span className="absolute top-1 text-[8px] text-sky-600 dark:text-sky-300">
                      full
                    </span>
                  )}
                </div>
                {i > 0 && (
                  <span className="-my-1 text-xs text-zinc-300 dark:text-zinc-700">↓</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          The lowest jar fills first — when full it pours into the next jar and empties itself.
        </p>

        <div className="flex items-center justify-center">
          <div className="relative flex h-40 w-28 flex-col items-center justify-end overflow-hidden rounded-b-2xl rounded-t-sm border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950">
            <div
              className="absolute bottom-0 w-full bg-sky-400/80 transition-all duration-300"
              style={{ height: `${(progress * 100).toFixed(2)}%` }}
            />
            <span className="relative z-10 pb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2">
        {[1, 5, 10, 30].map((n) => (
          <button
            key={n}
            onClick={() => pour(n)}
            disabled={isDone}
            className="h-11 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            +{n}
          </button>
        ))}
      </div>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Variation — when the lowest jar fills, the next jar fills and the previous one empties.
        </p>
      </footer>
    </main>
  );
}
