import type { LimitId, MealSlot } from "./types";

export const CA = "#2f6bbf"; // Aaryan's marker color
export const CS = "#d95f56"; // Sakshi's marker color

export const F_MARKER = "var(--font-marker), cursive";
export const F_CAVEAT = "var(--font-caveat), cursive";
export const F_ARCHIVO = "var(--font-archivo), Helvetica, sans-serif";

export const MEALS: { slot: MealSlot; label: string }[] = [
  { slot: "breakfast", label: "Breakfast" },
  { slot: "lunch", label: "Lunch" },
  { slot: "snack", label: "Snack" },
  { slot: "dinner", label: "Dinner" },
];

export const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const MON = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const LIMITS: { id: LimitId; label: string; cap: number }[] = [
  { id: "never", label: "Strictly never", cap: 0 },
  { id: "1d", label: "1x / day", cap: 1 },
  { id: "1w", label: "1x / week", cap: 1 },
  { id: "2w", label: "2x / week", cap: 2 },
  { id: "15d", label: "1x / 15 days", cap: 1 },
  { id: "1m", label: "1x / month", cap: 1 },
];

export const REASONS = [
  "stress",
  "social",
  "no food ready",
  "craving",
  "tired",
  "celebration",
  "custom",
];
