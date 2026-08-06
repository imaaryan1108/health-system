import { LIMITS, MEALS } from "./constants";
import { addDays, iso, mondayOf } from "./dates";
import type { Dont, MealSlot, MealSlotEntry, Person, SystemData } from "./types";

export interface DayInfo {
  iso: string;
  date: Date;
  dow: string;
  dnum: string;
  mon: string;
  isToday: boolean;
}

export function weekDays(): DayInfo[] {
  const mon = mondayOf(new Date());
  const today = iso(new Date());
  const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const MON_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const out: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    out.push({
      iso: iso(d),
      date: d,
      dow: DOW[i],
      dnum: String(d.getDate()),
      mon: MON_NAMES[d.getMonth()],
      isToday: iso(d) === today,
    });
  }
  return out;
}

const EMPTY_MEAL: MealSlotEntry = { A: { text: "", done: false }, S: { text: "", done: false } };

export function mealCell(data: SystemData, day: string, slot: MealSlot): MealSlotEntry {
  return data.meals[day]?.[slot] ?? EMPTY_MEAL;
}

export function dontById(data: SystemData, id: string): Dont | undefined {
  return data.donts.find((d) => d.id === id);
}

export function limitOf(id: string) {
  return LIMITS.find((l) => l.id === id) || LIMITS[0];
}

export function windowStart(limitId: string): string {
  const now = new Date();
  if (limitId === "15d") return iso(addDays(now, -14));
  if (limitId === "1m") return iso(new Date(now.getFullYear(), now.getMonth(), 1));
  if (limitId === "1d") return iso(now);
  return iso(mondayOf(now));
}

export function usedFor(data: SystemData, rule: Dont): number {
  const from = windowStart(rule.limit);
  return data.relapses.filter(
    (r) => r.dontId === rule.id && r.date >= from && (rule.who === "both" || r.person === rule.who)
  ).length;
}

export function dayAdherence(data: SystemData, day: string, person: Person): number | null {
  const m = data.meals[day];
  if (!m) return null;
  let plan = 0;
  let done = 0;
  MEALS.forEach((mm) => {
    const c = m[mm.slot];
    if (!c) return;
    const p = c[person];
    if (p && p.text) {
      plan++;
      if (p.done) done++;
    }
  });
  return plan ? done / plan : null;
}

/** Lowest relapse count across every week the household has been tracked
 *  (weeks come from the weight log, so a clean week with zero relapses still counts). */
export function bestWeek(data: SystemData): { weekStart: string; count: number } | null {
  if (data.weekly.length === 0) return null;
  let best: { weekStart: string; count: number } | null = null;
  for (const w of data.weekly) {
    const start = w.week;
    const end = iso(addDays(mondayOf(new Date(start)), 6));
    const count = data.relapses.filter((r) => r.date >= start && r.date <= end).length;
    if (!best || count < best.count) best = { weekStart: start, count };
  }
  return best;
}
