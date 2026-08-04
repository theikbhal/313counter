"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (editLabel || editGoal) inputRef.current?.select();
  }, [editLabel, editGoal]);

  const progress = Math.min(1, data.count / data.goal);
  const isDone = data.count >= data.goal;

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
      className={`w-28 rounded-xl border bg-white shadow-sm transition dark:bg-zinc-900 ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-400/30"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-zinc-400" />

      <div className="px-2 pt-1.5">
        <div className="flex items-center justify-between gap-1">
          {editLabel ? (
            <input
              ref={inputRef}
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
              }}
              className="w-full min-w-0 rounded-md border border-zinc-300 px-1 py-0.5 text-[11px] font-semibold text-zinc-900 focus:border-emerald-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          ) : (
            <button
              onDoubleClick={() => {
                setLabelDraft(data.label);
                setEditLabel(true);
              }}
              onClick={() => {
                setLabelDraft(data.label);
                setEditLabel(true);
              }}
              className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold text-zinc-800 dark:text-zinc-100"
              title="Edit label"
            >
              {data.label}
            </button>
          )}
          <button
            onClick={() => data.onDelete(id)}
            className="-mr-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            aria-label="Delete node"
          >
            ×
          </button>
        </div>

        <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
          <span className={`text-lg font-bold tabular-nums tracking-tight ${isDone ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-white"}`}>
            {data.count.toLocaleString()}
          </span>
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">/</span>
          {editGoal ? (
            <input
              ref={inputRef}
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              onBlur={commitGoal}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitGoal();
              }}
              className="w-12 rounded-md border border-zinc-300 px-1 py-0.5 text-[11px] font-medium tabular-nums text-zinc-900 focus:border-emerald-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          ) : (
            <button
              onClick={() => {
                setGoalDraft(String(data.goal));
                setEditGoal(true);
              }}
              className="rounded px-0.5 text-[11px] font-medium text-zinc-500 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
              title="Edit goal"
            >
              {data.goal.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      <div className="mx-2 mt-1 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isDone ? "bg-emerald-500" : "bg-emerald-500"}`}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-1 px-2 py-1.5">
        <button
          onClick={() => data.onIncrement(id, 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-90"
          aria-label="Add one"
        >
          +
        </button>
        <button
          onClick={() => data.onReset(id)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-[11px] leading-none text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Reset"
        >
          ↺
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-emerald-400" />
    </div>
  );
}
