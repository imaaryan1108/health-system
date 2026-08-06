"use client";

import { CA, CS, F_CAVEAT, F_MARKER } from "@/lib/constants";
import { addDays, fmtDay, iso, mondayOf } from "@/lib/dates";
import { bestWeek, dayAdherence } from "@/lib/logic";
import { WeightChart } from "./WeightChart";
import type { SystemData } from "@/lib/types";

export function ProgressZone({ data }: { data: SystemData }) {
  const todayISO = iso(new Date());

  const streakFor = (person: "A" | "S") => {
    let n = 0;
    let cursor = new Date();
    for (let i = 0; i < 90; i++) {
      const key = iso(cursor);
      const w = data.workouts[key];
      if (w && w[person]) n++;
      else if (key !== todayISO) break;
      cursor = addDays(cursor, -1);
    }
    return n;
  };

  const monISO = iso(mondayOf(new Date()));
  const lastMon = iso(addDays(mondayOf(new Date()), -7));
  const thisWeekSlips = data.relapses.filter((r) => r.date >= monISO).length;
  const lastWeekSlips = data.relapses.filter((r) => r.date >= lastMon && r.date < monISO).length;
  const best = bestWeek(data);

  const heatmaps = ([["A", "AARYAN", CA], ["S", "SAKSHI", CS]] as const).map(([key, name, color]) => {
    const cells = [];
    const startMon = addDays(mondayOf(new Date()), -21);
    for (let i = 0; i < 28; i++) {
      const dd = addDays(startMon, i);
      const dkey = iso(dd);
      const a = dayAdherence(data, dkey, key);
      const bg = a === null ? "rgba(255,255,255,.55)" : a >= 0.75 ? "rgba(63,143,82,.55)" : a >= 0.4 ? "rgba(217,155,31,.5)" : "rgba(192,57,43,.42)";
      cells.push({ d: dd.getDate(), bg, title: fmtDay(dd) + (a === null ? " · nothing planned" : ` · ${Math.round(a * 100)}%`) });
    }
    return { name, color, cells };
  });

  const streaks = ([["A", "Aaryan", CA], ["S", "Sakshi", CS]] as const).map(([key, label, color]) => {
    const n = streakFor(key);
    return { days: n, color, label: `${label} · ${n === 1 ? "day" : "days"} workout streak` };
  });

  const counts = [
    { label: "Weeks on the system", value: data.weekly.length, color: "#3b3527" },
    { label: "Slips this week", value: thisWeekSlips, color: thisWeekSlips > lastWeekSlips ? "#c0392b" : "#3f8f52" },
    { label: "Slips last week", value: lastWeekSlips, color: "#7a6f59" },
    { label: "Best week (relapses)", value: best ? `${best.count}` : "—", color: "#3f8f52" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 6 }}>
        <div style={{ fontFamily: F_MARKER, fontSize: 34, transform: "rotate(-.7deg)" }}>PROGRESS</div>
        <div style={{ fontFamily: F_CAVEAT, fontSize: 26, color: "#7a6f59" }}>how far we&rsquo;ve come</div>
      </div>
      <div style={{ height: 3, background: "#3b3527", opacity: 0.75, borderRadius: 2, marginBottom: 20 }} />

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 620, border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "16px 18px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 18 }}>WEIGHT · kg / week</div>
            <div style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#8b8069" }}>dashed = target</div>
          </div>
          <div style={{ marginTop: 6 }}>
            <WeightChart weekly={data.weekly} targetA={data.targets.A.target} targetS={data.targets.S.target} />
          </div>
        </div>

        <div style={{ flex: "0 0 300px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#d8e6f7", border: "1px solid rgba(90,78,55,.2)", padding: "14px 16px", boxShadow: "3px 4px 0 rgba(90,78,55,.16)", transform: "rotate(-1deg)" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 14, color: "#1f4d8f", marginBottom: 8 }}>STREAKS</div>
            {streaks.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 4 }}>
                <div style={{ fontFamily: F_MARKER, fontSize: 28, lineHeight: 1.45, color: s.color }}>{s.days}</div>
                <div style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#4a4232" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fdf6c8", border: "1px solid rgba(90,78,55,.2)", padding: "14px 16px", boxShadow: "3px 4px 0 rgba(90,78,55,.16)", transform: "rotate(1deg)" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 14, color: "#4a4232", marginBottom: 8 }}>COUNTS</div>
            {counts.map((c) => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", fontFamily: F_CAVEAT, fontSize: 21, borderBottom: "1px dotted #cfc6b1", padding: "3px 0" }}>
                <span style={{ color: "#5c5442" }}>{c.label}</span>
                <span style={{ fontWeight: 700, color: c.color }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26, border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "16px 18px 20px", maxWidth: 1020 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontFamily: F_MARKER, fontSize: 18 }}>ADHERENCE · LAST 4 WEEKS</div>
          <div style={{ display: "flex", gap: 12, fontFamily: F_CAVEAT, fontSize: 19, color: "#7a6f59" }}>
            <span>● good</span><span>● patchy</span><span>● bad</span><span>▢ nothing planned</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 44 }}>
          {heatmaps.map((hm) => (
            <div key={hm.name}>
              <div style={{ fontFamily: F_MARKER, fontSize: 14, marginBottom: 8, color: hm.color }}>{hm.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 30px)", gap: 5 }}>
                {hm.cells.map((c, i) => (
                  <div key={i} title={c.title} style={{ width: 30, height: 30, border: "1px solid rgba(90,78,55,.22)", background: c.bg, fontFamily: F_CAVEAT, fontSize: 15, color: "#5c5442", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {c.d}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
