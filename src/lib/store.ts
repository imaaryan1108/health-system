import { MEALS } from "./constants";
import { addDays, iso, mondayOf } from "./dates";
import type { SystemData } from "./types";

// All persistence goes through this file. Today it's localStorage; swapping to
// a backend later means changing loadData/saveData here, not the components.
const KEY = "the-system-v1";

const MEAL_PLAN: [string, string][] = [
  ["3 eggs, brown bread, black coffee", "oats + banana, milk"],
  ["dal, 2 roti, salad", "curd rice, cucumber"],
  ["peanuts + green tea", "roasted chana"],
  ["grilled chicken, veggies", "paneer bhurji, 1 roti"],
];
const MEAL_PLAN_ALT: [string, string][] = [
  ["omelette (4 whites), avocado toast", "poha + sprouts"],
  ["rajma, rice, salad", "dal khichdi, curd"],
  ["banana + almonds", "buttermilk + makhana"],
  ["fish curry, sauteed beans", "tofu stir fry, salad"],
];

export function seedData(): SystemData {
  const mon = mondayOf(new Date());
  const today = iso(new Date());

  const donts: SystemData["donts"] = [
    { id: "d1", name: "Ordering unhealthy food", limit: "never", who: "both" },
    { id: "d2", name: "Ordering healthy food", limit: "1w", who: "both" },
    { id: "d3", name: "Sugar", limit: "never", who: "both" },
    { id: "d4", name: "Alcohol", limit: "1m", who: "A" },
    { id: "d5", name: "Maida", limit: "never", who: "both" },
    { id: "d6", name: "Fried food", limit: "1w", who: "both" },
    { id: "d7", name: "Packaged snacks", limit: "1w", who: "both" },
  ];

  const meals: SystemData["meals"] = {};
  const workouts: SystemData["workouts"] = {};
  for (let i = 0; i < 7; i++) {
    const day = iso(addDays(mon, i));
    const src = i % 2 ? MEAL_PLAN_ALT : MEAL_PLAN;
    const past = day < today;
    const isToday = day === today;
    meals[day] = {};
    MEALS.forEach((m, j) => {
      meals[day][m.slot] = {
        A: { text: src[j][0], done: past || (isToday && j < 2) },
        S: { text: src[j][1], done: (past && !(i === 2 && j === 3)) || (isToday && j < 1) },
      };
    });
    workouts[day] = { A: past && i !== 1, S: past && i !== 2 };
  }

  const relapses: SystemData["relapses"] = [
    { id: "r1", date: iso(addDays(mon, 1)), time: "21:40", person: "S", dontId: "d3", reason: "craving" },
    { id: "r2", date: iso(addDays(mon, 2)), time: "22:10", person: "A", dontId: "d6", reason: "social" },
    { id: "r3", date: iso(addDays(mon, 2)), time: "22:15", person: "S", dontId: "d2", reason: "no food ready" },
  ];

  const weekly: SystemData["weekly"] = [];
  for (let w = 7; w >= 0; w--) {
    const ws = iso(addDays(mon, -7 * w));
    weekly.push({
      week: ws,
      A: Math.round((82.4 - (7 - w) * 0.75) * 10) / 10,
      S: Math.round((63.8 - (7 - w) * 0.45) * 10) / 10,
    });
  }

  return {
    donts,
    meals,
    workouts,
    relapses,
    weekly,
    targets: { A: { start: 84.5, target: 76.0 }, S: { start: 65.0, target: 58.0 } },
    weekTarget: { A: 76.2, S: 60.2 },
  };
}

export function loadData(): SystemData {
  if (typeof window === "undefined") return seedData();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.donts) return d as SystemData;
    }
  } catch {
    // ignore corrupt storage, fall through to seed
  }
  return seedData();
}

export function saveData(data: SystemData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full/unavailable — data still lives in memory for this session
  }
}

// useSyncExternalStore-compatible store: localStorage has no built-in
// change events for same-tab writes, so we notify listeners ourselves.
let cache: SystemData | null = null;
const listeners = new Set<() => void>();

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSnapshot(): SystemData {
  if (!cache) cache = loadData();
  return cache;
}

// Used only during server render / hydration, where localStorage isn't
// available — seed data keeps the first paint deterministic. Cached so
// React's reference-equality check on the snapshot doesn't loop forever.
let serverSnapshot: SystemData | null = null;
export function getServerSnapshot(): SystemData {
  if (!serverSnapshot) serverSnapshot = seedData();
  return serverSnapshot;
}

export function mutateStore(fn: (draft: SystemData) => void): void {
  const draft = structuredClone(getSnapshot());
  fn(draft);
  cache = draft;
  saveData(draft);
  listeners.forEach((l) => l());
}

export function resetStore(): void {
  cache = seedData();
  saveData(cache);
  listeners.forEach((l) => l());
}
