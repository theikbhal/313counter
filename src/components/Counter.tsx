"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ZikrKey = "darood" | "istighfar";
type Zikr = { key: ZikrKey; label: string; target: number };

const DEFAULTS: Zikr[] = [
  { key: "darood", label: "Darood", target: 313 },
  { key: "istighfar", label: "Istighfar", target: 100 },
];

const MAX = 1000000;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadAll(): Record<string, Record<ZikrKey, number>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("zikr-counts") || "{}");
  } catch {
    return {};
  }
}

function loadActive(): ZikrKey {
  if (typeof window === "undefined") return "darood";
  const stored = localStorage.getItem("zikr-active");
  return stored === "istighfar" || stored === "darood" ? stored : "darood";
}

function loadTargets(): Record<ZikrKey, number> {
  if (typeof window === "undefined")
    return { darood: DEFAULTS[0].target, istighfar: DEFAULTS[1].target };
  try {
    const stored = localStorage.getItem("zikr-targets");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.darood && parsed.istighfar) return parsed;
    }
  } catch {}
  return { darood: DEFAULTS[0].target, istighfar: DEFAULTS[1].target };
}

function initialDark(): boolean {
  if (typeof window === "undefined") return false;
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function Counter() {
  const [dark, setDark] = useState(initialDark);
  const [targets, setTargets] = useState<Record<ZikrKey, number>>(loadTargets);
  const [counts, setCounts] = useState<Record<string, Record<ZikrKey, number>>>(loadAll);
  const [active, setActive] = useState<ZikrKey>(loadActive);
  const [justFinished, setJustFinished] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ darood: 313, istighfar: 100 });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("zikr-targets", JSON.stringify(targets));
  }, [targets]);

  useEffect(() => {
    localStorage.setItem("zikr-counts", JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem("zikr-active", active);
  }, [active]);

  const nowCount = counts[todayKey()]?.[active] || 0;
  const target = targets[active] || DEFAULTS.find((z) => z.key === active)!.target;
  const progress = Math.min(1, nowCount / target);
  const isDone = nowCount >= target;

  const increment = useCallback(
    (n = 1) => {
      const key = todayKey();
      const current = counts[key]?.[active] || 0;
      const next = Math.min(MAX, current + n);
      setCounts((c) => ({ ...c, [key]: { ...c[key], [active]: next } }));
      if (next >= target) setJustFinished(true);
    },
    [counts, active, target]
  );

  const reset = useCallback(() => {
    setCounts((c) => {
      const key = todayKey();
      const copy = { ...c };
      const today = { ...copy[key] };
      delete today[active];
      copy[key] = today;
      return copy;
    });
    setJustFinished(false);
  }, [active]);

  const current = useMemo(() => DEFAULTS.find((z) => z.key === active)!, [active]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <h1 className="text-sm font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Daily Zikr
          </h1>
        </div>
        <button
          onClick={reset}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Reset
        </button>
      </header>

      <section className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
          {todayKey()}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-semibold tabular-nums tracking-tight">
            {nowCount.toLocaleString()}
          </span>
          <span className="text-2xl font-light text-zinc-400 dark:text-zinc-600">
            / {target.toLocaleString()}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(progress * 100).toFixed(2)}%` }}
          />
        </div>

        {isDone && (
          <p className="mt-1 text-sm font-medium text-emerald-500">
            {justFinished ? "Completed — ma sha Allah 🎉" : "Complete for today"}
          </p>
        )}
      </section>

      <nav className="grid grid-cols-2 gap-2">
        {DEFAULTS.map((z) => (
          <button
            key={z.key}
            onClick={() => setActive(z.key)}
            className={`rounded-2xl px-4 py-3 text-center transition ${
              active === z.key
                ? "bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="text-sm font-medium">{z.label}</div>
            <div className="text-xs opacity-60">
              {(counts[todayKey()]?.[z.key] || 0).toLocaleString()}
            </div>
          </button>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-center">
        <button
          onClick={() => increment()}
          disabled={isDone}
          className="relative flex h-56 w-56 select-none flex-col items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <span className="text-4xl font-semibold tabular-nums">
            {(target - nowCount).toLocaleString()}
          </span>
          <span className="text-sm font-light text-zinc-400">remaining</span>
          <span className="mt-2 text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Tap · {current.label}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 5, 10, 15, 20, 30, 31, 33, 50, 100, 133, 150, 200].map((n) => (
          <button
            key={n}
            onClick={() => increment(n)}
            disabled={isDone}
            className="h-11 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            +{n}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setEditing((e) => !e);
            setDraft(targets);
          }}
          className="rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Targets
        </button>
        <div className="flex items-center gap-2">
          <Link
            href="/steps"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Step Counter
          </Link>
          <Link
            href="/ideas"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ideas →
          </Link>
        </div>
      </div>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Built as a simple daily habit tracker for Darood & Istighfar — make your
          zikr easy to complete, one tap at a time.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Dev: <span className="font-medium text-zinc-500 dark:text-zinc-400">theikbhal</span>
        </p>
        <div className="flex items-center gap-3 text-xs">
          <a
            href="mailto:theikbhal@gmail.com"
            className="text-zinc-500 underline-offset-2 transition hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            theikbhal@gmail.com
          </a>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <a
            href="https://wa.me/919901014560"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 underline-offset-2 transition hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            WhatsApp +91 9901014560
          </a>
        </div>
      </footer>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">Set daily targets</h2>
            <div className="flex flex-col gap-4">
              {DEFAULTS.map((z) => (
                <label key={z.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {z.label}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={draft[z.key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [z.key]: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-32 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right text-sm tabular-nums focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-full bg-zinc-100 py-3 text-sm font-medium transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTargets({ ...draft });
                  setEditing(false);
                }}
                className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
