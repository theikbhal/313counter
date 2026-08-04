"use client";

import { useRef, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export type CounterNodeData = {
  label: string;
  goal: number;
  count: number;
  onIncrement: (id: string, n: number) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onGoal: (id: string, goal: number) => void;
  onLabel: (id: string, label: string) => void;
};

export type CounterNodeType = Node<CounterNodeData, "counter">;

export default function CounterNode({ id, data, selected }: NodeProps<CounterNodeType>) {
  const [editLabel, setEditLabel] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data.label);
  const [goalDraft, setGoalDraft] = useState(String(data.goal));
  const inputRef = useRef<HTMLInputElement>(null);

  const progress = Math.min(1, data.count / data.goal);

  const commitGoal = () => {
    const n = parseInt(goalDraft, 10);
    if (Number.isFinite(n) && n > 0) data.onGoal(id, Math.min(1000000, n));
    setEditGoal(false);
  };

  const commitLabel = () => {
    data.onLabel(id, labelDraft.trim() || "Node");
    setEditLabel(false);
  };

  return (
    <div
      className={`w-40 rounded-2xl border bg-white p-3 shadow-md transition dark:bg-zinc-900 ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-400/30"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !bg-zinc-400" />

      <div className="mb-2 flex items-start justify-between gap-1">
        {editLabel ? (
          <input
            ref={inputRef}
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel();
            }}
            className="w-full min-w-0 rounded-lg border border-zinc-200 px-1.5 py-0.5 text-xs font-semibold focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        ) : (
          <button
            onDoubleClick={() => {
              setLabelDraft(data.label);
              setEditLabel(true);
              setTimeout(() => inputRef.current?.select(), 0);
            }}
            onClick={() => {
              setLabelDraft(data.label);
              setEditLabel(true);
              setTimeout(() => inputRef.current?.select(), 0);
            }}
            className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200"
            title="Edit label"
          >
            {data.label}
          </button>
        )}

        <button
          onClick={() => data.onDelete(id)}
          className="-mt-0.5 -mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-zinc-300 transition hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-500/10"
          aria-label="Delete node"
        >
          ×
        </button>
      </div>

      <div className="flex items-baseline justify-center gap-0.5">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {data.count.toLocaleString()}
        </span>
        <span className="text-xs font-light text-zinc-400">/</span>
        {editGoal ? (
          <input
            value={goalDraft}
            onChange={(e) => setGoalDraft(e.target.value)}
            onBlur={commitGoal}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitGoal();
            }}
            className="w-14 rounded-lg border border-zinc-200 px-1 py-0.5 text-xs tabular-nums focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          />
        ) : (
          <button
            onClick={() => {
              setGoalDraft(String(data.goal));
              setEditGoal(true);
            }}
            className="rounded px-1 text-xs font-light text-zinc-400 underline-offset-2 hover:text-emerald-500 hover:underline dark:text-zinc-500"
            title="Edit goal"
          >
            {data.goal.toLocaleString()}
          </button>
        )}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <button
          onClick={() => data.onIncrement(id, 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white transition active:scale-90"
          aria-label="Add one"
        >
          +
        </button>
        <button
          onClick={() => data.onReset(id)}
          className="flex h-7 items-center justify-center rounded-full border border-zinc-200 px-2 text-[10px] text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Reset"
        >
          ↺
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !bg-emerald-400" />
    </div>
  );
}
