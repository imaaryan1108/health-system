export type Person = "A" | "S";
export type WhoLimit = "both" | "A" | "S";
export type LimitId = "never" | "1d" | "1w" | "2w" | "15d" | "1m";
export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";
export type Zone = "week" | "donts" | "progress" | "setup";

export interface Dont {
  id: string;
  name: string;
  limit: LimitId;
  who: WhoLimit;
}

export interface Relapse {
  id: string;
  dontId: string;
  person: Person;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  reason: string;
}

export interface MealEntry {
  text: string;
  done: boolean;
}

export interface MealSlotEntry {
  A: MealEntry;
  S: MealEntry;
}

export type DayMeals = Partial<Record<MealSlot, MealSlotEntry>>;

export interface WorkoutDay {
  A?: boolean;
  S?: boolean;
}

export interface WeeklyWeight {
  week: string; // monday iso date of that week
  A: number;
  S: number;
}

export interface SystemData {
  donts: Dont[];
  meals: Record<string, DayMeals>;
  workouts: Record<string, WorkoutDay>;
  relapses: Relapse[];
  weekly: WeeklyWeight[];
  targets: { A: { start: number; target: number }; S: { start: number; target: number } };
  weekTarget: { A: number; S: number };
}
