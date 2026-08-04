"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import CounterNode, { type CounterNodeData, type CounterNodeType } from "@/components/graph/CounterNode";
import Onboarding from "@/components/graph/Onboarding";

const nodeTypes = { counter: CounterNode };

type CounterNodeModel = CounterNodeType;

const MAX = 1000000;
const STORAGE_KEY = "zikr-graph";

let idCounter = 0;
function makeId() {
  return `n${Date.now()}-${idCounter++}`;
}

function blankData(
  overrides: Partial<CounterNodeData> & Pick<CounterNodeData, "onIncrement" | "onReset" | "onDelete" | "onGoal" | "onLabel">
): CounterNodeData {
  return {
    label: "Node",
    goal: 313,
    count: 0,
    ...overrides,
  };
}

function defaultGraph(
  cbs: Pick<CounterNodeData, "onIncrement" | "onReset" | "onDelete" | "onGoal" | "onLabel">
): CounterNodeModel[] {
  return [
    {
      id: "root",
      type: "counter",
      position: { x: 220, y: 140 },
      data: blankData({ ...cbs, label: "Darood", goal: 313 }),
    },
    {
      id: "sub1",
      type: "counter",
      position: { x: 40, y: 380 },
      data: blankData({ ...cbs, label: "Sub 5", goal: 5 }),
    },
    {
      id: "sub2",
      type: "counter",
      position: { x: 200, y: 400 },
      data: blankData({ ...cbs, label: "Sub 10", goal: 10 }),
    },
    {
      id: "sub3",
      type: "counter",
      position: { x: 360, y: 380 },
      data: blankData({ ...cbs, label: "Sub 31", goal: 31 }),
    },
  ];
}

function defaultEdges(): Edge[] {
  return [
    { id: "e1", source: "sub1", target: "root", animated: true },
    { id: "e2", source: "sub2", target: "root", animated: true },
    { id: "e3", source: "sub3", target: "root", animated: true },
  ];
}

export default function NodeGraphPage() {
  return (
    <ReactFlowProvider>
      <NodeGraphInner />
    </ReactFlowProvider>
  );
}

function NodeGraphInner() {
  const { getNodes } = useReactFlow();
  const [helpKey, setHelpKey] = useState(0);

  const [nodes, setNodes, onNodesChange] = useNodesState<CounterNodeModel>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onIncrement = useCallback((id: string, n: number) => {
    setNodes((nds) =>
      nds.map((nd) =>
        nd.id === id ? { ...nd, data: { ...nd.data, count: Math.min(MAX, nd.data.count + n) } } : nd
      )
    );
  }, [setNodes]);

  const onReset = useCallback((id: string) => {
    setNodes((nds) => nds.map((nd) => (nd.id === id ? { ...nd, data: { ...nd.data, count: 0 } } : nd)));
  }, [setNodes]);

  const onDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((nd) => nd.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const onGoal = useCallback((id: string, goal: number) => {
    setNodes((nds) => nds.map((nd) => (nd.id === id ? { ...nd, data: { ...nd.data, goal } } : nd)));
  }, [setNodes]);

  const onLabel = useCallback((id: string, label: string) => {
    setNodes((nds) => nds.map((nd) => (nd.id === id ? { ...nd, data: { ...nd.data, label } } : nd)));
  }, [setNodes]);

  useEffect(() => {
    const cbs = { onIncrement, onReset, onDelete, onGoal, onLabel };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setNodes(
            parsed.nodes.map((n: { id: string; position: { x: number; y: number }; data: CounterNodeData }) => ({
              ...n,
              type: "counter" as const,
              data: { ...n.data, ...cbs },
            }))
          );
          setEdges(parsed.edges);
          return;
        }
      }
    } catch {}
    setNodes(defaultGraph(cbs));
    setEdges(defaultEdges());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ nodes: nodes.map((n) => ({ ...n, data: { label: n.data.label, goal: n.data.goal, count: n.data.count } })), edges })
        );
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      const dup = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (dup) return;
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [edges, setEdges]
  );

  const addRoot = useCallback(() => {
    const id = makeId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "counter" as const,
        position: { x: 180 + Math.random() * 120, y: 80 + Math.random() * 80 },
        data: blankData({ ...{ onIncrement, onReset, onDelete, onGoal, onLabel }, label: `Node ${nds.length + 1}`, goal: 100 }),
      },
    ]);
  }, [onIncrement, onReset, onDelete, onGoal, onLabel, setNodes]);

  const addSub = useCallback(() => {
    const parent = getNodes().find((n) => n.selected);
    const id = makeId();
    setNodes((nds) => {
      const nds2 = [
        ...nds,
        {
          id,
          type: "counter" as const,
          position: { x: 180 + Math.random() * 120, y: 380 + Math.random() * 60 },
          data: blankData({ ...{ onIncrement, onReset, onDelete, onGoal, onLabel }, label: `Sub ${id.slice(-3)}`, goal: 10 }),
        },
      ];
      if (parent) {
        setEdges((eds) => [...eds, { id: makeId(), source: id, target: parent.id, animated: true }]);
      }
      return nds2;
    });
  }, [onIncrement, onReset, onDelete, onGoal, onLabel, setNodes, setEdges, getNodes]);

  const exportJson = useCallback(() => {
    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: { label: n.data.label, goal: n.data.goal, count: n.data.count },
      })),
      edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zikr-graph.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [nodes, edges]);

  const importJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.nodes)) return;
        setNodes(
          parsed.nodes.map((n: { id: string; position: { x: number; y: number }; data: CounterNodeData }) => ({
            ...n,
            type: "counter" as const,
            data: { ...n.data, onIncrement, onReset, onDelete, onGoal, onLabel },
          }))
        );
        setEdges(Array.isArray(parsed.edges) ? parsed.edges : []);
      } catch {}
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, onIncrement, onReset, onDelete, onGoal, onLabel]);

  const exportPng = useCallback(async () => {
    const container = document.querySelector(".react-flow") as HTMLElement | null;
    if (!container) return;
    try {
      const dataUrl = await toPng(container, {
        backgroundColor: "#fafafa",
        pixelRatio: 2,
        filter: (node) => !node.classList?.contains("react-flow__minimap"),
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "zikr-graph.png";
      a.click();
    } catch {}
  }, []);

  const selectedId = useMemo(() => nodes.find((n) => n.selected)?.id, [nodes]);

  const contributors = useMemo(() => {
    const map: Record<string, CounterNodeModel[]> = {};
    for (const e of edges) {
      const source = nodes.find((n) => n.id === e.source);
      const target = nodes.find((n) => n.id === e.target);
      if (source && target) {
        (map[target.id] ||= []).push(source);
      }
    }
    return map;
  }, [nodes, edges]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <Link
          href="/ideas"
          className="text-sm font-medium text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          ← Ideas
        </Link>
        <h1 className="text-sm font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
          Node Graph
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setHelpKey((k) => k + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="How to use"
          >
            ?
          </button>
          <button
            onClick={() => {
              setNodes([]);
              setEdges([]);
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            Clear
          </button>
          <label className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900">
            Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={addRoot}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + Node
          </button>
          <button
            onClick={addSub}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            + Sub
          </button>
          {selectedId && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              selected: {nodes.find((n) => n.id === selectedId)?.data.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPng}
            className="rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            PNG
          </button>
          <button
            onClick={exportJson}
            className="rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Export
          </button>
        </div>
      </div>

      <div className="h-[600px] overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2.5}
          deleteKeyCode={["Backspace", "Delete"]}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#e4e4e7" />
          <Controls showInteractive={false} className="!border-zinc-200 dark:!bg-zinc-900" />
          <MiniMap
            pannable
            zoomable
            className="!bg-white/60 dark:!bg-zinc-900/60"
            maskColor="rgba(9,9,11,0.08)"
            nodeColor="#10b981"
            nodeStrokeWidth={2}
          />
        </ReactFlow>
      </div>

      <section className="rounded-3xl border border-zinc-100 p-4 dark:border-zinc-900">
        <h2 className="mb-2 text-sm font-semibold">Sub-node contribution</h2>
        <p className="mb-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          An edge flows <span className="font-medium text-emerald-500">sub-node → parent</span>. Each
          sub-node&apos;s count is added to its parent&apos;s progress toward its goal. Drag from a
          node&apos;s bottom handle to another node&apos;s top handle to connect them.
        </p>
        <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto pr-1">
          {nodes.map((n) => {
            const subs = contributors[n.id] || [];
            const subCount = subs.reduce((a, s) => a + s.data.count, 0);
            const total = n.data.count + subCount;
            const goal = n.data.goal;
            const pct = Math.min(1, total / goal);
            return (
              <li key={n.id} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate font-medium text-zinc-600 dark:text-zinc-300">
                  {n.data.label}
                </span>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(pct * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="w-16 text-right tabular-nums text-zinc-400 dark:text-zinc-500">
                  {total.toLocaleString()}/{goal.toLocaleString()}
                </span>
                {subs.length > 0 && (
                  <span className="w-24 truncate text-right text-zinc-300 dark:text-zinc-600">
                    +{subCount.toLocaleString()} from {subs.length}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          Movable counter nodes with pan, zoom, sub-nodes, and export. Supports 30+ nodes.
        </p>
      </footer>

      <Onboarding key={helpKey} force={helpKey > 0} onDone={() => setHelpKey((k) => k)} />
    </main>
  );
}
