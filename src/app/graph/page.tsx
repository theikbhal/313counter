"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr, type ZikrKey } from "@/lib/zikr";

const GRAPH_CHUNKS = [5, 10, 15, 20, 30, 31, 33, 50];

export default function GraphPage() {
  const zikr = useZikr();
  const [subCounts, setSubCounts] = useState<Record<number, number>>({});

  const layout = useMemo(() => {
    const cx = 160;
    const cy = 150;
    const r = 120;
    return GRAPH_CHUNKS.map((n, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / GRAPH_CHUNKS.length;
      return { n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }, []);

  const tapSub = (n: number) => {
    setSubCounts((s) => ({ ...s, [n]: (s[n] || 0) + 1 }));
    zikr.increment(n);
  };

  const subTarget = Math.ceil(zikr.target / GRAPH_CHUNKS.length);
  const rootPct = (zikr.progress * 100).toFixed(1);

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
          Graph
        </h1>
        <button
          onClick={() => {
            zikr.reset();
            setSubCounts({});
          }}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Reset
        </button>
      </header>

      <div className="flex flex-col items-center gap-2">
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
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${rootPct}%` }}
          />
        </div>
        {zikr.isDone && (
          <p className="text-sm font-medium text-emerald-500">Goal reached — ma sha Allah 🎉</p>
        )}
      </div>

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
              {(zikr.counts[zikr.today]?.[z.key as ZikrKey] || 0).toLocaleString()}
            </div>
          </button>
        ))}
      </nav>

      <div className="rounded-3xl border border-zinc-100 p-2 dark:border-zinc-900">
        <svg viewBox="0 0 320 300" className="w-full">
          {layout.map((p) => (
            <line
              key={p.n}
              x1={160}
              y1={150}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              strokeWidth="1.5"
            />
          ))}

          <circle cx={160} cy={150} r="58" fill="none" stroke="currentColor" strokeWidth="10" className="text-zinc-100 dark:text-zinc-800" />
          <circle
            cx={160}
            cy={150}
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * 2 * 58 * zikr.progress} ${Math.PI * 2 * 58}`}
            transform="rotate(-90 160 150)"
            className="text-emerald-500 transition-all duration-300"
          />
          <text x={160} y={146} textAnchor="middle" className="fill-zinc-900 text-xl font-semibold dark:fill-white">
            {zikr.count.toLocaleString()}
          </text>
          <text x={160} y={166} textAnchor="middle" className="fill-zinc-400 text-[11px]">
            / {zikr.target.toLocaleString()}
          </text>

          {layout.map((p) => {
            const taps = subCounts[p.n] || 0;
            const frac = Math.min(1, taps / subTarget);
            const filled = taps > 0;
            return (
              <g
                key={p.n}
                onClick={() => tapSub(p.n)}
                className="cursor-pointer"
                role="button"
                aria-label={`Add ${p.n}`}
              >
                <circle cx={p.x} cy={p.y} r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-100 dark:text-zinc-800" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 2 * 26 * frac} ${Math.PI * 2 * 26}`}
                  transform={`rotate(-90 ${p.x} ${p.y})`}
                  className={filled ? "text-emerald-500 transition-all duration-300" : "text-zinc-300 dark:text-zinc-600"}
                />
                <circle cx={p.x} cy={p.y} r="22" className={filled ? "fill-white dark:fill-zinc-900" : "fill-white dark:fill-zinc-900"} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-zinc-700 text-sm font-semibold dark:fill-zinc-200">
                  +{p.n}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        Each sub-node is a small goal. Tap a node to add it and grow the root counter.
      </p>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Idea 1 — each counter is a node, sub-counters are sub-nodes connected like a graph.
        </p>
      </footer>
    </main>
  );
}
