import { DOW, MON } from "./constants";

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function mondayOf(d: Date): Date {
  const x = new Date(d);
  const dw = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dw);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function fmtDay(d: Date): string {
  return `${DOW[(d.getDay() + 6) % 7].slice(0, 3)} ${d.getDate()} ${MON[d.getMonth()]}`;
}
