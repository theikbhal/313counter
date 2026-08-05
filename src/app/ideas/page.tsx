import Link from "next/link";

const IDEAS = [
  {
    href: "/graph",
    title: "Graph",
    desc: "Each counter is a node, sub-counters are sub-nodes — connected like a graph.",
    emoji: "🕸️",
  },
  {
    href: "/rectangle",
    title: "Rectangle",
    desc: "Each target goal is a rectangle filled with grid cells to match.",
    emoji: "🧱",
  },
  {
    href: "/jar",
    title: "Jars",
    desc: "The target is a big jar; fill small jars and pour them into it.",
    emoji: "🫙",
  },
  {
    href: "/jar-v2",
    title: "Jars v2 · Cascade",
    desc: "Lowest jar fills, pours into the next, and empties itself.",
    emoji: "🌊",
  },
  {
    href: "/jar-v3",
    title: "Jars v3 · Drag",
    desc: "Drag a small jar onto the big jar; it resets back after pouring.",
    emoji: "🤏",
  },
  {
    href: "/node-graph",
    title: "Node Graph",
    desc: "Movable counter nodes with sub-nodes, zoom, pan, and export.",
    emoji: "🕸️",
  },
  {
    href: "/cards",
    title: "Cards",
    desc: "313 horizontal cards in 3 vertical lines — fill each one as you count.",
    emoji: "🃏",
  },
];

export default function IdeasPage() {
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
          Ideas
        </h1>
        <span className="w-14" />
      </header>

      <section className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Different ways to visualise reaching your daily zikr goal.
        </p>
        {IDEAS.map((idea) => (
          <Link
            key={idea.href}
            href={idea.href}
            className="flex items-center gap-4 rounded-3xl border border-zinc-100 p-4 transition hover:border-zinc-200 hover:shadow-sm dark:border-zinc-900 dark:hover:border-zinc-800"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-900">
              {idea.emoji}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{idea.title}</span>
              <span className="text-xs leading-4 text-zinc-400 dark:text-zinc-500">
                {idea.desc}
              </span>
            </div>
            <span className="ml-auto text-zinc-300 dark:text-zinc-700">→</span>
          </Link>
        ))}
      </section>

      <footer className="mt-2 flex flex-col items-center gap-2 border-t border-zinc-100 pt-6 text-center dark:border-zinc-900">
        <p className="max-w-xs text-xs leading-5 text-zinc-400 dark:text-zinc-500">
          More ideas coming soon.
        </p>
      </footer>
    </main>
  );
}
