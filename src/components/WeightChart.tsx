"use client";

import { CA, CS, F_CAVEAT, F_MARKER, MON } from "@/lib/constants";
import { parseIso } from "@/lib/dates";
import type { WeeklyWeight } from "@/lib/types";

export function WeightChart({
  weekly,
  targetA,
  targetS,
}: {
  weekly: WeeklyWeight[];
  targetA: number;
  targetS: number;
}) {
  const W = 760, H = 300, L = 52, R = 16, T = 14, B = 34;
  const all = weekly.flatMap((x) => [x.A, x.S]);
  all.push(targetA, targetS);
  const lo = Math.floor(Math.min(...all) - 2);
  const hi = Math.ceil(Math.max(...all) + 2);
  const X = (i: number) => L + (i * (W - L - R)) / Math.max(1, weekly.length - 1);
  const Y = (v: number) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const line = (key: "A" | "S") =>
    weekly.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p[key]).toFixed(1)}`).join(" ");

  const gridY: number[] = [];
  for (let v = lo; v <= hi; v += 4) gridY.push(v);

  const last = weekly[weekly.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      <g>
        {gridY.map((v) => (
          <g key={`y${v}`}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#5a4e37" strokeOpacity={0.14} />
            <text x={L - 10} y={Y(v) + 5} textAnchor="end" fontFamily={F_CAVEAT} fontSize={16} fill="#8b8069">
              {v}
            </text>
          </g>
        ))}
      </g>
      <g>
        {weekly.map((p, i) => {
          const d = parseIso(p.week);
          return (
            <text key={`x${i}`} x={X(i)} y={H - 10} textAnchor="middle" fontFamily={F_CAVEAT} fontSize={16} fill="#8b8069">
              {d.getDate()} {MON[d.getMonth()]}
            </text>
          );
        })}
      </g>
      <line x1={L} x2={W - R} y1={Y(targetA)} y2={Y(targetA)} stroke={CA} strokeWidth={2} strokeDasharray="9 7" opacity={0.6} />
      <line x1={L} x2={W - R} y1={Y(targetS)} y2={Y(targetS)} stroke={CS} strokeWidth={2} strokeDasharray="9 7" opacity={0.6} />
      <path d={line("A")} fill="none" stroke={CA} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line("S")} fill="none" stroke={CS} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <g>
        {weekly.map((p, i) => (
          <circle key={i} cx={X(i)} cy={Y(p.A)} r={4.5} fill="#fffdf4" stroke={CA} strokeWidth={2.5} />
        ))}
      </g>
      <g>
        {weekly.map((p, i) => (
          <circle key={i} cx={X(i)} cy={Y(p.S)} r={4.5} fill="#fffdf4" stroke={CS} strokeWidth={2.5} />
        ))}
      </g>
      {last && (
        <>
          <text x={X(weekly.length - 1) + 8} y={Y(last.A) - 8} fontFamily={F_MARKER} fontSize={14} fill={CA}>A</text>
          <text x={X(weekly.length - 1) + 8} y={Y(last.S) - 8} fontFamily={F_MARKER} fontSize={14} fill={CS}>S</text>
        </>
      )}
    </svg>
  );
}
