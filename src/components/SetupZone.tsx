"use client";

import { useState } from "react";
import { CA, CS, F_CAVEAT, F_MARKER, LIMITS, MEALS } from "@/lib/constants";
import { mealCell, weekDays } from "@/lib/logic";
import type { LimitId, SystemData, WhoLimit } from "@/lib/types";

export function SetupZone({
  data,
  mutate,
  resetAll,
  workoutGoal,
}: {
  data: SystemData;
  mutate: (fn: (draft: SystemData) => void) => void;
  resetAll: () => void;
  workoutGoal: number;
}) {
  const days = weekDays();
  const [newDont, setNewDont] = useState<{ name: string; limit: LimitId; who: WhoLimit }>({ name: "", limit: "1w", who: "both" });
  const [planDay, setPlanDay] = useState<string>(days.find((d) => d.isToday)?.iso || days[0].iso);
  const planIndex = days.findIndex((d) => d.iso === planDay);

  const updateDont = (id: string, patch: Partial<SystemData["donts"][number]>) =>
    mutate((d) => { Object.assign(d.donts.find((x) => x.id === id)!, patch); });
  const removeDont = (id: string) => mutate((d) => { d.donts = d.donts.filter((x) => x.id !== id); });
  const addDont = () => {
    if (!newDont.name.trim()) return;
    mutate((d) => { d.donts.push({ id: `d${Date.now()}`, name: newDont.name.trim(), limit: newDont.limit, who: newDont.who }); });
    setNewDont({ name: "", limit: "1w", who: "both" });
  };

  const setMealText = (day: string, slot: (typeof MEALS)[number]["slot"], person: "A" | "S", text: string) =>
    mutate((d) => {
      d.meals[day] = d.meals[day] || {};
      d.meals[day][slot] = d.meals[day][slot] || { A: { text: "", done: false }, S: { text: "", done: false } };
      d.meals[day][slot]![person].text = text;
    });

  const copyTo = (targets: string[]) =>
    mutate((d) => {
      const src = JSON.parse(JSON.stringify(d.meals[planDay] || {}));
      targets.forEach((t) => {
        d.meals[t] = d.meals[t] || {};
        MEALS.forEach((m) => {
          const s = src[m.slot] || { A: { text: "" }, S: { text: "" } };
          d.meals[t][m.slot] = d.meals[t][m.slot] || { A: { text: "", done: false }, S: { text: "", done: false } };
          d.meals[t][m.slot]!.A.text = s.A.text;
          d.meals[t][m.slot]!.S.text = s.S.text;
        });
      });
    });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 6 }}>
        <div style={{ fontFamily: F_MARKER, fontSize: 34, transform: "rotate(-.7deg)" }}>SETUP</div>
        <div style={{ fontFamily: F_CAVEAT, fontSize: 26, color: "#7a6f59" }}>the marker box · edit everything here</div>
      </div>
      <div style={{ height: 3, background: "#3b3527", opacity: 0.75, borderRadius: 2, marginBottom: 22 }} />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 520, border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "16px 18px 20px" }}>
          <div style={{ fontFamily: F_MARKER, fontSize: 18, marginBottom: 12 }}>DON&rsquo;TS</div>
          {data.donts.map((d) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 30px", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input value={d.name} onChange={(e) => updateDont(d.id, { name: e.target.value })} style={{ padding: "6px 8px", fontSize: 14, border: "1.5px solid #cfc6b1", background: "#fffdf4" }} />
              <select value={d.limit} onChange={(e) => updateDont(d.id, { limit: e.target.value as LimitId })} style={{ padding: 6, fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
                {LIMITS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <select value={d.who} onChange={(e) => updateDont(d.id, { who: e.target.value as WhoLimit })} style={{ padding: 6, fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
                <option value="both">Both</option>
                <option value="A">Aaryan</option>
                <option value="S">Sakshi</option>
              </select>
              <div onClick={() => removeDont(d.id)} style={{ cursor: "pointer", textAlign: "center", color: "#b5aa92", fontSize: 14 }}>✕</div>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 110px 30px", gap: 8, alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px dashed #cfc6b1" }}>
            <input value={newDont.name} onChange={(e) => setNewDont((n) => ({ ...n, name: e.target.value }))} placeholder="new don't…" style={{ padding: "6px 8px", fontSize: 14, border: "1.5px solid #cfc6b1", background: "#fffdf4" }} />
            <select value={newDont.limit} onChange={(e) => setNewDont((n) => ({ ...n, limit: e.target.value as LimitId }))} style={{ padding: 6, fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
              {LIMITS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <select value={newDont.who} onChange={(e) => setNewDont((n) => ({ ...n, who: e.target.value as WhoLimit }))} style={{ padding: 6, fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
              <option value="both">Both</option>
              <option value="A">Aaryan</option>
              <option value="S">Sakshi</option>
            </select>
            <div onClick={addDont} style={{ cursor: "pointer", textAlign: "center", fontFamily: F_MARKER, fontSize: 18 }}>+</div>
          </div>
        </div>

        <div style={{ flex: "0 0 330px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "16px 18px 20px" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 18, marginBottom: 12 }}>WEEKLY TARGETS</div>
            {([["A", "Aaryan", CA], ["S", "Sakshi", CS]] as const).map(([key, name, color]) => {
              const cur = data.weekly[data.weekly.length - 1] || { A: 0, S: 0 };
              return (
                <div key={key} style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: F_CAVEAT, fontSize: 22, fontWeight: 700, color }}>{name}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#8b8069" }}>START</div>
                      <input
                        value={data.targets[key].start}
                        onChange={(e) => { const v = parseFloat(e.target.value) || 0; mutate((d) => { d.targets[key].start = v; }); }}
                        style={{ width: "100%", padding: "5px 7px", fontSize: 14, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#8b8069" }}>NOW</div>
                      <input
                        value={cur[key]}
                        onChange={(e) => { const v = parseFloat(e.target.value) || 0; mutate((d) => { d.weekly[d.weekly.length - 1][key] = v; }); }}
                        style={{ width: "100%", padding: "5px 7px", fontSize: 14, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, letterSpacing: ".08em", color: "#8b8069" }}>TARGET</div>
                      <input
                        value={data.weekTarget[key]}
                        onChange={(e) => { const v = parseFloat(e.target.value) || 0; mutate((d) => { d.weekTarget[key] = v; }); }}
                        style={{ width: "100%", padding: "5px 7px", fontSize: 14, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ paddingTop: 12, borderTop: "1px dashed #cfc6b1", fontFamily: F_CAVEAT, fontSize: 21, color: "#7a6f59" }}>
              Workout target: <span style={{ color: "#3b3527", fontWeight: 700 }}>{workoutGoal}x / week</span> — fixed for both
            </div>
          </div>

          <div style={{ border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "14px 18px 18px" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 16, marginBottom: 8 }}>RESET</div>
            <div onClick={resetAll} style={{ cursor: "pointer", display: "inline-block", padding: "6px 12px", border: "1.5px solid #cfc6b1", fontFamily: F_CAVEAT, fontSize: 20, color: "#a63f37" }}>
              Wipe the board &amp; reload sample week
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26, border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", padding: "16px 18px 22px", maxWidth: 1020 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontFamily: F_MARKER, fontSize: 18 }}>PLAN MEALS</div>
          <div style={{ display: "flex", gap: 6 }}>
            {days.map((d) => {
              const on = d.iso === planDay;
              return (
                <div key={d.iso} onClick={() => setPlanDay(d.iso)} style={{ cursor: "pointer", padding: "4px 11px", fontFamily: F_CAVEAT, fontSize: 20, border: `1.5px solid ${on ? "#3b3527" : "#cfc6b1"}`, background: on ? "#fdf6c8" : "transparent", color: "#3b3527" }}>
                  {d.dow.slice(0, 3)} {d.dnum}
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div onClick={() => copyTo(days.slice(planIndex + 1).map((x) => x.iso))} style={{ cursor: "pointer", padding: "5px 10px", border: "1.5px solid #cfc6b1", fontFamily: F_CAVEAT, fontSize: 19 }}>Copy to rest of week</div>
          <div onClick={() => copyTo(days.filter((x) => x.iso !== planDay).map((x) => x.iso))} style={{ cursor: "pointer", padding: "5px 10px", border: "1.5px solid #cfc6b1", fontFamily: F_CAVEAT, fontSize: 19 }}>Copy to all 7 days</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: "10px 14px", alignItems: "center" }}>
          <div />
          <div style={{ fontFamily: F_MARKER, fontSize: 13, color: CA }}>AARYAN</div>
          <div style={{ fontFamily: F_MARKER, fontSize: 13, color: CS }}>SAKSHI</div>
          {MEALS.map((m) => {
            const c = mealCell(data, planDay, m.slot);
            return (
              <div key={m.slot} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 14, gridColumn: "1 / -1", alignItems: "center" }}>
                <div style={{ fontFamily: F_MARKER, fontSize: 14, color: "#4a4232" }}>{m.label}</div>
                <input value={c.A.text} onChange={(e) => setMealText(planDay, m.slot, "A", e.target.value)} placeholder="what's the plan…" style={{ padding: "7px 9px", fontFamily: F_CAVEAT, fontSize: 19, border: "1.5px solid #cfc6b1", background: "#fffdf4", color: CA }} />
                <input value={c.S.text} onChange={(e) => setMealText(planDay, m.slot, "S", e.target.value)} placeholder="what's the plan…" style={{ padding: "7px 9px", fontFamily: F_CAVEAT, fontSize: 19, border: "1.5px solid #cfc6b1", background: "#fffdf4", color: CS }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
