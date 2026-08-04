"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DEFAULTS, useZikr } from "@/lib/zikr";

const SOURCES = [5, 10, 20, 30, 50, 100];

type Drag = { id: number; x: number; y: number };

export default function JarV3Page() {
  const zikr = useZikr();
  const bigRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [overBig, setOverBig] = useState(false);

  const onPointerDown = (id: number, e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY });
    setStart({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    const rect = bigRef.current?.getBoundingClientRect();
    if (rect) {
      setOverBig(
        e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
      );
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const rect = bigRef.current?.getBoundingClientRect();
    const inside =
      !!rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (inside) {
      zikr.increment(drag.id);
    }
    setDrag(null);
    setStart(null);
    setOverBig(false);
  };

  const offset = (start && drag ? { x: drag.x - start.x, y: drag.y - start.y } : null);

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
          Jars v3 · Drag
        </h1>
        <button
          onClick={() => {
            zikr.reset();
            setDrag(null);
          }}
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

      <section className="flex flex-col items-center gap-8 rounded-3xl border border-zinc-100 p-6 dark:border-zinc-900">
        <div
          ref={bigRef}
          className={`relative flex h-44 w-32 flex-col items-center justify-end overflow-hidden rounded-b-2xl rounded-t-sm border-2 transition ${
            overBig
              ? "border-sky-500 bg-sky-50 dark:bg-sky-950"
              : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
          }`}
          aria-label="Big jar"
        >
          <div
            className="absolute bottom-0 w-full bg-sky-400/80 transition-all duration-300"
            style={{ height: `${(zikr.progress * 100).toFixed(2)}%` }}
          />
          <span className="relative z-10 pb-1 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {zikr.count.toLocaleString()}
          </span>
        </div>
        <p className="-mt-5 text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Drag a small jar onto the big jar to pour it. On drop it resets back to its original
          place.
        </p>

        <div className="flex items-end gap-4">
          {SOURCES.map((n) => {
            const isDragging = drag?.id === n;
            return (
              <button
                key={n}
                onPointerDown={(e) => onPointerDown(n, e)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className={`flex cursor-grab touch-none flex-col items-center gap-1 active:cursor-grabbing ${
                  isDragging ? "z-20" : ""
                }`}
                style={
                  isDragging && offset
                    ? {
                        transform: `translate(${offset.x}px, ${offset.y}px) rotate(-6deg) scale(1.1)`,
                        transition: "none",
                      }
                    : { transition: "transform 0.25s ease" }
                }
              >
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                  {n.toLocaleString()}
                </span>
                <span
                  className={`relative flex h-16 w-10 items-end justify-center overflow-hidden rounded-b-lg rounded-t-sm border-2 transition ${
                    isDragging
                      ? "border-sky-500 bg-sky-100 shadow-lg dark:bg-sky-900"
                      : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
                  }`}
                >
                  <span className="h-full w-full bg-sky-400/80" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Variation — drag and drop jars to fill one into the other; dropped jars reset back.
        </p>
      </footer>
    </main>
  );
}
