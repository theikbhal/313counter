"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ZikrKey = "darood" | "istighfar";
export type Zikr = { key: ZikrKey; label: string; target: number };

export const DEFAULTS: Zikr[] = [
  { key: "darood", label: "Darood", target: 313 },
  { key: "istighfar", label: "Istighfar", target: 100 },
];

export const MAX = 1000000;

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCounts(): Record<string, Record<ZikrKey, number>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("zikr-counts") || "{}");
  } catch {
    return {};
  }
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

function loadActive(): ZikrKey {
  if (typeof window === "undefined") return "darood";
  const stored = localStorage.getItem("zikr-active");
  return stored === "istighfar" || stored === "darood" ? stored : "darood";
}

export function useZikr() {
  const [counts, setCounts] = useState<Record<string, Record<ZikrKey, number>>>(loadCounts);
  const [targets, setTargets] = useState<Record<ZikrKey, number>>(loadTargets);
  const [active, setActive] = useState<ZikrKey>(loadActive);

  useEffect(() => {
    localStorage.setItem("zikr-counts", JSON.stringify(counts));
  }, [counts]);
  useEffect(() => {
    localStorage.setItem("zikr-targets", JSON.stringify(targets));
  }, [targets]);
  useEffect(() => {
    localStorage.setItem("zikr-active", active);
  }, [active]);

  const today = todayKey();
  const count = counts[today]?.[active] || 0;
  const target = targets[active] || DEFAULTS.find((z) => z.key === active)!.target;
  const progress = Math.min(1, count / target);
  const isDone = count >= target;

  const increment = useCallback(
    (n = 1) => {
      const key = todayKey();
      setCounts((c) => ({
        ...c,
        [key]: { ...c[key], [active]: Math.min(MAX, (c[key]?.[active] || 0) + n) },
      }));
    },
    [active]
  );

  const reset = useCallback(() => {
    const key = todayKey();
    setCounts((c) => {
      const copy = { ...c };
      const today = { ...copy[key] };
      delete today[active];
      copy[key] = today;
      return copy;
    });
  }, [active]);

  return useMemo(
    () => ({
      active,
      setActive,
      count,
      target,
      progress,
      isDone,
      increment,
      reset,
      targets,
      setTargets,
      today,
      counts,
    }),
    [active, count, target, progress, isDone, increment, reset, targets, today, counts]
  );
}
