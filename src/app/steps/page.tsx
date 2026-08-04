"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CHUNKS = [5, 10, 15, 20, 30, 31, 33, 50, 100, 133, 150, 200];
const MAX = 1000000;

type Progress = { stepIndex: number; stepCount: number };

function load(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}

function loadProgress(key: string): Progress {
  if (typeof window === "undefined") return { stepIndex: 0, stepCount: 0 };
  try {
    const p = JSON.parse(localStorage.getItem(key) || "{}");
    return { stepIndex: p.stepIndex || 0, stepCount: p.stepCount || 0 };
  } catch {
    return { stepIndex: 0, stepCount: 0 };
  }
}

export default function Steps() {
  const [goal, setGoal] = useState(() => Number(load("zikr-steps-goal", "313")) || 313);
  const [steps, setSteps] = useState<number[]>(() => {
    try {
      return JSON.parse(load("zikr-steps-plan", "[]"));
    } catch {
      return [];
    }
  });
  const [progress, setProgress] = useState<Progress>(() =>
    loadProgress("zikr-steps-progress")
  );

  useEffect(() => {
    localStorage.setItem("zikr-steps-goal", String(goal));
  }, [goal]);
  useEffect(() => {
    localStorage.setItem("zikr-steps-plan", JSON.stringify(steps));
  }, [steps]);
  useEffect(() => {
    localStorage.setItem("zikr-steps-progress", JSON.stringify(progress));
  }, [progress]);

  const total = useMemo(() => steps.reduce((a, b) => a + b, 0), [steps]);
  const remaining = goal - total;
  const doneTotal = useMemo(
    () => steps.slice(0, progress.stepIndex).reduce((a, b) => a + b, 0) + progress.stepCount,
    [steps, progress]
  );
  const isDone = steps.length > 0 && doneTotal >= goal;
  const currentStep = steps[progress.stepIndex];

  const addChunk = (n: number) => {
    if (n > remaining) return;
    setSteps((s) => [...s, n]);
  };

  const autoFill = () => {
    let rest = remaining;
    const plan: number[] = [...steps];
    const sizes = [...CHUNKS].sort((a, b) => b - a);
    for (const size of sizes) {
      while (rest >= size) {
        plan.push(size);
        rest -= size;
      }
    }
    if (rest > 0 && rest <= MAX) plan.push(rest);
    setSteps(plan);
  };

  const removeStep = (i: number) => {
    setSteps((s) => s.filter((_, idx) => idx !== i));
    setProgress({ stepIndex: 0, stepCount: 0 });
  };

  const tap = (n = 1) => {
    if (isDone || steps.length === 0) return;
    setProgress((p) => {
      let idx = p.stepIndex;
      let count = p.stepCount + n;
      while (idx < steps.length && count >= steps[idx]) {
        count -= steps[idx];
        idx += 1;
      }
      return { stepIndex: idx, stepCount: count };
    });
  };

  const reset = () => {
    setSteps([]);
    setProgress({ stepIndex: 0, stepCount: 0 });
  };

  const overall = Math.min(1, doneTotal / goal);
  const stepTarget = currentStep || goal;
  const stepProgress = progress.stepCount;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          ← Zikr
        </Link>
        <h1 className="text-sm font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
          Step Counter
        </h1>
        <button
          onClick={reset}
          className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Reset
        </button>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Big goal
          </label>
          <input
            type="number"
            min={1}
            max={MAX}
            value={goal}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > 0 && v <= MAX) {
                setGoal(v);
                reset();
              }
            }}
            className="w-32 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right text-sm tabular-nums focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(overall * 100).toFixed(2)}%` }}
          />
        </div>

        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">
            {doneTotal.toLocaleString()}
          </span>
          <span className="text-xl font-light text-zinc-400 dark:text-zinc-600">
            / {goal.toLocaleString()}
          </span>
        </div>

        {isDone ? (
          <p className="text-center text-sm font-medium text-emerald-500">
            All steps done — ma sha Allah 🎉
          </p>
        ) : (
          steps.length > 0 && (
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Step {Math.min(progress.stepIndex + 1, steps.length)} of {steps.length}
              {currentStep ? ` · ${stepProgress.toLocaleString()}/${currentStep.toLocaleString()}` : ""}
            </p>
          )
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Your plan</h2>
          <span className={`text-xs font-medium ${remaining > 0 ? "text-zinc-400 dark:text-zinc-500" : "text-emerald-500"}`}>
            {remaining > 0 ? `${remaining.toLocaleString()} left` : "complete"}
          </span>
        </div>

        {steps.length === 0 ? (
          <p className="rounded-2xl bg-zinc-100 px-4 py-6 text-center text-sm text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
            Break {goal.toLocaleString()} into small steps — pick chunk sizes below.
          </p>
        ) : (
          <ol className="flex flex-wrap gap-2">
            {steps.map((s, i) => {
              const passed = i < progress.stepIndex || (i === progress.stepIndex && (progress.stepCount >= s || isDone));
              const current = i === progress.stepIndex && !passed;
              return (
                <li key={i}>
                  <button
                    onClick={() => removeStep(i)}
                    title="Remove step"
                    className={`h-9 min-w-14 rounded-full border px-3 text-sm font-medium tabular-nums transition ${
                      passed
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : current
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {s.toLocaleString()}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex flex-wrap gap-2">
          {CHUNKS.map((n) => (
            <button
              key={n}
              onClick={() => addChunk(n)}
              disabled={n > remaining || steps.length >= 24}
              className="h-9 rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-30 dark:border-zinc-800 dark:text-zinc-400"
            >
              +{n}
            </button>
          ))}
        </div>

        {remaining > 0 && (
          <button
            onClick={autoFill}
            className="rounded-full border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Auto split remaining ({remaining.toLocaleString()})
          </button>
        )}
      </section>

      <div className="flex flex-1 items-center justify-center">
        <button
          onClick={() => tap()}
          disabled={isDone || steps.length === 0}
          className="relative flex h-56 w-56 select-none flex-col items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <span className="text-4xl font-semibold tabular-nums">
            {currentStep
              ? (stepTarget - stepProgress).toLocaleString()
              : remaining.toLocaleString()}
          </span>
          <span className="text-sm font-light text-zinc-400">
            {currentStep ? `left in step ${progress.stepIndex + 1}` : "remaining"}
          </span>
          <span className="mt-2 text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
            Tap
          </span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 5, 10, 30].map((n) => (
          <button
            key={n}
            onClick={() => tap(n)}
            disabled={isDone || steps.length === 0}
            className="h-11 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 transition active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            +{n}
          </button>
        ))}
      </div>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Break a big goal like {goal.toLocaleString()} into easy sub-goals (5, 10, 15, 20, 30…)
          and complete them one at a time.
        </p>
      </footer>
    </main>
  );
}
