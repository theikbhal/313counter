"use client";

import { useState } from "react";

const STEPS = [
  {
    emoji: "🖱️",
    title: "Move & explore",
    body: "Drag the empty canvas to pan. Scroll / pinch to zoom. Drag any node to reposition it. Use the minimap to jump around — even with 30+ nodes.",
  },
  {
    emoji: "➕",
    title: "Add counters",
    body: "Press “+ Node” to add a counter. Click its label or goal number to edit. The + button counts up, ↺ resets, × deletes.",
  },
  {
    emoji: "🔗",
    title: "Connect sub-nodes",
    body: "Drag from a node's bottom handle (green dot) to another node's top handle. The sub-node's count then adds to its parent's goal progress.",
  },
  {
    emoji: "📤",
    title: "Save & export",
    body: "Your graph autosaves in this browser. Export as PNG or JSON any time, and import a JSON file to restore a graph.",
  },
];

export default function Onboarding({
  force = false,
  onDone,
}: {
  force?: boolean;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const shown = localStorage.getItem("zikr-graph-onboard");
    return force || !shown;
  });

  if (!visible) return null;

  const finish = () => {
    setVisible(false);
    localStorage.setItem("zikr-graph-onboard", "1");
    onDone();
  };

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <div className="mb-3 flex h-16 items-center justify-center text-4xl">{s.emoji}</div>
        <h2 className="mb-1 text-lg font-semibold">{s.title}</h2>
        <p className="mb-6 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{s.body}</p>

        <div className="flex gap-2">
          {step > 0 ? (
            <button
              onClick={() => setStep((v) => v - 1)}
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Back
            </button>
          ) : (
            <button
              onClick={finish}
              className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Skip
            </button>
          )}
          <button
            onClick={() => (step === STEPS.length - 1 ? finish() : setStep((v) => v + 1))}
            className="flex-1 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {step === STEPS.length - 1 ? "Let's go" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
