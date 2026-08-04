"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr } from "@/lib/zikr";

const JARS = [5, 10, 15, 20, 30, 50, 100];

export default function JarPage() {
  const zikr = useZikr();
  const [fill, setFill] = useState<Record<number, number>>({});
  const [pouring, setPouring] = useState<number | null>(null);

  const pourJar = (n: number) => {
    const next = (fill[n] || 0) + 1;
    setFill((f) => ({ ...f, [n]: next }));
    if (next >= n) {
      setPouring(n);
      setTimeout(() => {
        zikr.increment(n);
        setFill((f) => ({ ...f, [n]: 0 }));
        setPouring(null);
      }, 350);
    }
  };

  const reset = () => {
    zikr.reset();
    setFill({});
    setPouring(null);
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
          Jars
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
            {zikr.count.toLocaleString()}
          </span>
          <span className="text-xl font-light text-zinc-400 dark:text-zinc-600">
            / {zikr.target.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${(zikr.progress * 100).toFixed(2)}%` }}
          />
        </div>
        {zikr.isDone && (
          <p className="text-sm font-medium text-sky-500">Big jar full — ma sha Allah 🎉</p>
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

      <section className="flex flex-col items-center gap-6 rounded-3xl border border-zinc-100 p-6 dark:border-zinc-900">
        <div
          className="relative flex h-40 w-24 flex-col items-center justify-end overflow-hidden rounded-b-2xl rounded-t-sm border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
          aria-label="Big jar"
        >
          <div
            className={`absolute bottom-0 w-full bg-sky-400/80 transition-all duration-300 ${
              pouring !== null ? "opacity-90" : "opacity-100"
            }`}
            style={{ height: `${(zikr.progress * 100).toFixed(2)}%` }}
          />
          <span className="relative z-10 pb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {zikr.count.toLocaleString()}
          </span>
        </div>
        <p className="-mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Tap a small jar to fill it — when full it pours into the big jar
        </p>

        <div className="grid grid-cols-4 gap-3">
          {JARS.map((n) => {
            const level = fill[n] || 0;
            const pct = Math.min(1, level / n);
            return (
              <button
                key={n}
                onClick={() => pourJar(n)}
                disabled={pouring !== null}
                className="flex flex-col items-center gap-1 disabled:opacity-60"
              >
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {n.toLocaleString()}
                </span>
                <span
                  className={`relative flex h-14 w-9 items-end justify-center overflow-hidden rounded-b-lg rounded-t-sm border-2 transition ${
                    pouring === n
                      ? "border-sky-400 bg-sky-100 dark:bg-sky-900"
                      : level >= n
                        ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950"
                        : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
                  }`}
                >
                  <span
                    className={`w-full bg-sky-400/80 transition-all duration-300 ${
                      pouring === n ? "animate-pulse" : ""
                    }`}
                    style={{ height: `${pct * 100}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Idea 3 — the target is a big jar; fill small jars of different sizes and pour them in.
        </p>
      </footer>
    </main>
  );
}
