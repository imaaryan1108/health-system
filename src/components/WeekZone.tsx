"use client";

import { useState } from "react";
import { CA, CS, F_CAVEAT, F_MARKER, MEALS, REASONS } from "@/lib/constants";
import { fmtDay } from "@/lib/dates";
import { dontById, limitOf, mealCell, usedFor, weekDays } from "@/lib/logic";
import type { Person, SystemData, Zone } from "@/lib/types";

export function WeekZone({
  data,
  mutate,
  showStats,
  workoutGoal,
  goDonts,
}: {
  data: SystemData;
  mutate: (fn: (draft: SystemData) => void) => void;
  showStats: boolean;
  workoutGoal: number;
  goDonts: (z: Zone) => void;
}) {
  const days = weekDays();
  const weekLabel = `${fmtDay(days[0].date)} — ${fmtDay(days[6].date)}`;

  const [popover, setPopover] = useState<string | null>(null);
  const [pForm, setPForm] = useState<{ person: Person; dontId: string; reason: string; custom: string }>({
    person: "A",
    dontId: data.donts[0]?.id || "",
    reason: "craving",
    custom: "",
  });
  const [openTag, setOpenTag] = useState<string | null>(null);

  const toggleMeal = (day: string, slot: (typeof MEALS)[number]["slot"], person: Person) => {
    mutate((d) => {
      d.meals[day] = d.meals[day] || {};
      d.meals[day][slot] = d.meals[day][slot] || { A: { text: "", done: false }, S: { text: "", done: false } };
      d.meals[day][slot]![person].done = !d.meals[day][slot]![person].done;
    });
  };

  const toggleWorkout = (day: string, person: Person) => {
    mutate((d) => {
      d.workouts[day] = d.workouts[day] || {};
      d.workouts[day][person] = !d.workouts[day][person];
    });
  };

  let wa = 0, ws = 0;
  days.forEach((day) => {
    const w = data.workouts[day.iso] || {};
    if (w.A) wa++;
    if (w.S) ws++;
  });

  let planned = 0, done = 0, pa = 0, da = 0, ps = 0, ds = 0;
  days.forEach((day) => {
    const m = data.meals[day.iso];
    if (!m) return;
    MEALS.forEach((mm) => {
      const c = m[mm.slot];
      if (!c) return;
      if (c.A.text) { planned++; pa++; if (c.A.done) { done++; da++; } }
      if (c.S.text) { planned++; ps++; if (c.S.done) { done++; ds++; } }
    });
  });
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  const cur = data.weekly[data.weekly.length - 1] || { A: 0, S: 0 };
  const weightRows = ([["A", "Aaryan", CA], ["S", "Sakshi", CS]] as const).map(([key, name, color]) => {
    const st = data.targets[key].start, cw = cur[key], tw = data.weekTarget[key];
    const diff = Math.round((cw - st) * 10) / 10;
    return { name, color, start: st, current: cw, target: tw, delta: `${diff <= 0 ? diff : "+" + diff} kg so far` };
  });

  const overCount = data.donts.filter((r) => usedFor(data, r) > limitOf(r.limit).cap).length;

  const saveRelapse = () => {
    if (!popover) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const reason = pForm.reason === "custom" ? pForm.custom || "custom" : pForm.reason;
    const dontId = pForm.dontId || data.donts[0]?.id || "";
    mutate((d) => {
      d.relapses.push({ id: `r${Date.now()}`, date: popover, time, person: pForm.person, dontId, reason });
    });
    setPopover(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <div style={{ fontFamily: F_MARKER, fontSize: 34, letterSpacing: ".01em", transform: "rotate(-.7deg)" }}>THIS WEEK</div>
          <div style={{ fontFamily: F_CAVEAT, fontSize: 26, color: "#7a6f59" }}>{weekLabel}</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontFamily: F_CAVEAT, fontSize: 22 }}>
          <span style={{ color: CA }}>● Aaryan</span>
          <span style={{ color: CS }}>● Sakshi</span>
        </div>
      </div>
      <div style={{ height: 3, background: "#3b3527", opacity: 0.75, borderRadius: 2, marginBottom: 18 }} />

      <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 1040, border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", boxShadow: "0 2px 0 rgba(90,78,55,.1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "112px repeat(7, 1fr)", borderBottom: "2px solid #bdb39c" }}>
            <div style={{ padding: "10px 12px", borderRight: "2px solid #bdb39c" }} />
            {days.map((d) => (
              <div key={d.iso} style={{ position: "relative", padding: "10px 8px 12px", textAlign: "center", borderRight: "1px solid #e0d8c6" }}>
                {d.isToday && (
                  <div style={{ position: "absolute", left: "12%", right: "12%", top: 5, bottom: 4, border: "2.5px solid #e0a52e", borderRadius: "50%", transform: "rotate(-3deg)", opacity: 0.85 }} />
                )}
                <div style={{ position: "relative", fontFamily: F_MARKER, fontSize: 15, color: "#4a4232" }}>{d.dow}</div>
                <div style={{ position: "relative", fontFamily: F_CAVEAT, fontSize: 19, color: "#8b8069" }}>{d.dnum} {d.mon}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "rgba(224,165,46,.16)", borderBottom: "1px solid #e0d8c6" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 13, letterSpacing: ".06em", color: "#7a5c14" }}>MEALS</div>
            <div style={{ fontFamily: F_CAVEAT, fontSize: 18, color: "#8b8069" }}>tick it when it&rsquo;s eaten</div>
          </div>
          {MEALS.map((m) => (
            <div key={m.slot} style={{ display: "grid", gridTemplateColumns: "112px repeat(7, 1fr)", borderBottom: "1px solid #e0d8c6" }}>
              <div style={{ padding: 12, borderRight: "2px solid #bdb39c", fontFamily: F_MARKER, fontSize: 14, color: "#4a4232", display: "flex", alignItems: "flex-start" }}>{m.label}</div>
              {days.map((day) => {
                const c = mealCell(data, day.iso, m.slot);
                return (
                  <div key={day.iso} style={{ position: "relative", padding: "9px 8px", borderRight: "1px solid #e8e1d2", minHeight: 104 }}>
                    {day.isToday && <div style={{ position: "absolute", inset: 0, background: "rgba(224,165,46,.13)", pointerEvents: "none" }} />}
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div onClick={() => toggleMeal(day.iso, m.slot, "A")} style={{ display: "flex", gap: 7, cursor: "pointer", alignItems: "flex-start" }}>
                        <div style={{ position: "relative", flex: "0 0 20px", width: 20, height: 20, border: "2px solid " + CA, borderRadius: 3, transform: "rotate(-1.5deg)", marginTop: 2 }}>
                          {c.A.done && <div style={{ position: "absolute", left: 1, top: -9, fontFamily: F_CAVEAT, fontWeight: 700, fontSize: 27, color: CA, animation: "tickIn .16s ease-out", transform: "rotate(-6deg)" }}>✓</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, overflowWrap: "break-word", fontFamily: F_CAVEAT, fontSize: 19, lineHeight: 1.15, color: CA }}>{c.A.text || "—"}</div>
                      </div>
                      <div onClick={() => toggleMeal(day.iso, m.slot, "S")} style={{ display: "flex", gap: 7, cursor: "pointer", alignItems: "flex-start" }}>
                        <div style={{ position: "relative", flex: "0 0 20px", width: 20, height: 20, border: "2px solid " + CS, borderRadius: 3, transform: "rotate(1.5deg)", marginTop: 2 }}>
                          {c.S.done && <div style={{ position: "absolute", left: 1, top: -9, fontFamily: F_CAVEAT, fontWeight: 700, fontSize: 27, color: CS, animation: "tickIn .16s ease-out", transform: "rotate(-6deg)" }}>✓</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, overflowWrap: "break-word", fontFamily: F_CAVEAT, fontSize: 19, lineHeight: 1.15, color: CS }}>{c.S.text || "—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "rgba(47,107,191,.12)", borderBottom: "1px solid #e0d8c6", borderTop: "2px solid #bdb39c" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 13, letterSpacing: ".06em", color: "#1f4d8f" }}>WORKOUT</div>
            <div style={{ fontFamily: F_CAVEAT, fontSize: 18, color: "#8b8069" }}>A: {wa}/{workoutGoal} · S: {ws}/{workoutGoal}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "112px repeat(7, 1fr)", borderBottom: "1px solid #e0d8c6" }}>
            <div style={{ padding: 12, borderRight: "2px solid #bdb39c", fontFamily: F_MARKER, fontSize: 14, color: "#4a4232" }}>Gym / Run</div>
            {days.map((day) => {
              const w = data.workouts[day.iso] || {};
              return (
                <div key={day.iso} style={{ position: "relative", borderRight: "1px solid #e8e1d2", padding: "12px 8px", display: "flex", justifyContent: "center", gap: 14 }}>
                  {day.isToday && <div style={{ position: "absolute", inset: 0, background: "rgba(224,165,46,.13)", pointerEvents: "none" }} />}
                  <div onClick={() => toggleWorkout(day.iso, "A")} style={{ position: "relative", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontFamily: F_MARKER, fontSize: 12, color: CA }}>A</div>
                    <div style={{ position: "relative", width: 26, height: 26, border: "2px solid " + CA, borderRadius: 3, transform: "rotate(-2deg)" }}>
                      {w.A && <div style={{ position: "absolute", left: 3, top: -8, fontFamily: F_CAVEAT, fontWeight: 700, fontSize: 31, color: CA, animation: "tickIn .16s ease-out", transform: "rotate(-6deg)" }}>✓</div>}
                    </div>
                  </div>
                  <div onClick={() => toggleWorkout(day.iso, "S")} style={{ position: "relative", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontFamily: F_MARKER, fontSize: 12, color: CS }}>S</div>
                    <div style={{ position: "relative", width: 26, height: 26, border: "2px solid " + CS, borderRadius: 3, transform: "rotate(2deg)" }}>
                      {w.S && <div style={{ position: "absolute", left: 3, top: -8, fontFamily: F_CAVEAT, fontWeight: 700, fontSize: 31, color: CS, animation: "tickIn .16s ease-out", transform: "rotate(-6deg)" }}>✓</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", background: "rgba(217,95,86,.13)", borderBottom: "1px solid #e0d8c6", borderTop: "2px solid #bdb39c" }}>
            <div style={{ fontFamily: F_MARKER, fontSize: 13, letterSpacing: ".06em", color: "#a63f37" }}>RELAPSES</div>
            <div style={{ fontFamily: F_CAVEAT, fontSize: 18, color: "#8b8069" }}>empty cell = clean day</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "112px repeat(7, 1fr)" }}>
            <div style={{ padding: 12, borderRight: "2px solid #bdb39c", fontFamily: F_MARKER, fontSize: 14, color: "#4a4232" }}>Slips</div>
            {days.map((day) => {
              const dayRelapses = data.relapses.filter((r) => r.date === day.iso);
              const open = dayRelapses.find((r) => r.id === openTag);
              return (
                <div key={day.iso} style={{ position: "relative", borderRight: "1px solid #e8e1d2", padding: "8px 7px 26px", minHeight: 86 }}>
                  {day.isToday && <div style={{ position: "absolute", inset: 0, background: "rgba(224,165,46,.13)", pointerEvents: "none" }} />}
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 5 }}>
                    {dayRelapses.map((r) => {
                      const dn = dontById(data, r.dontId);
                      const color = r.person === "A" ? CA : CS;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setOpenTag(openTag === r.id ? null : r.id)}
                          title={`${r.person === "A" ? "Aaryan" : "Sakshi"} · ${r.time} · ${r.reason}`}
                          style={{ cursor: "pointer", fontFamily: F_CAVEAT, fontSize: 17, lineHeight: 1.05, padding: "3px 6px", border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, color, background: "rgba(255,255,255,.7)", transform: "rotate(-1deg)", boxShadow: "1px 1px 0 rgba(90,78,55,.15)" }}
                        >
                          {dn ? dn.name : "unknown"}
                        </div>
                      );
                    })}
                    {open && (
                      <div style={{ fontFamily: F_CAVEAT, fontSize: 17, color: "#7a6f59" }}>⏳ {open.reason} · {open.time}</div>
                    )}
                  </div>
                  <div
                    onClick={() => { setPopover(day.iso); setPForm({ person: "A", dontId: data.donts[0]?.id || "", reason: "craving", custom: "" }); }}
                    style={{ position: "absolute", left: 7, bottom: 6, cursor: "pointer", width: 22, height: 22, border: "1.5px dashed #a89c81", borderRadius: "50%", color: "#8b8069", fontFamily: F_MARKER, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    +
                  </div>

                  {popover === day.iso && (
                    <div style={{ position: "absolute", zIndex: 50, left: -6, bottom: 32, width: 246, padding: 12, background: "#fffdf4", border: "1.5px solid #cfc6b1", boxShadow: "3px 4px 0 rgba(90,78,55,.22)", transform: "rotate(-.6deg)", animation: "noteIn .14s ease-out" }}>
                      <div style={{ fontFamily: F_MARKER, fontSize: 12, letterSpacing: ".05em", color: "#a63f37", marginBottom: 8 }}>LOG A SLIP · {fmtDay(day.date)}</div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        {([["A", "Aaryan", CA], ["S", "Sakshi", CS]] as const).map(([key, label, color]) => {
                          const on = pForm.person === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setPForm((f) => ({ ...f, person: key }))}
                              style={{ cursor: "pointer", flex: 1, textAlign: "center", padding: "4px 0", fontFamily: F_CAVEAT, fontSize: 19, border: `1.5px solid ${color}`, background: on ? (key === "A" ? "rgba(47,107,191,.18)" : "rgba(217,95,86,.18)") : "transparent", color }}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                      <select
                        value={pForm.dontId || data.donts[0]?.id || ""}
                        onChange={(e) => setPForm((f) => ({ ...f, dontId: e.target.value }))}
                        style={{ width: "100%", marginBottom: 8, padding: "5px 6px", fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fff" }}
                      >
                        {data.donts.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                        {REASONS.map((r) => {
                          const on = pForm.reason === r;
                          return (
                            <div
                              key={r}
                              onClick={() => setPForm((f) => ({ ...f, reason: r }))}
                              style={{ cursor: "pointer", padding: "3px 8px", fontFamily: F_CAVEAT, fontSize: 17, border: `1.5px solid ${on ? "#3b3527" : "#cfc6b1"}`, background: on ? "#fdf6c8" : "transparent", color: "#3b3527" }}
                            >
                              {r}
                            </div>
                          );
                        })}
                      </div>
                      {pForm.reason === "custom" && (
                        <input
                          value={pForm.custom}
                          onChange={(e) => setPForm((f) => ({ ...f, custom: e.target.value }))}
                          placeholder="write the reason…"
                          style={{ width: "100%", marginBottom: 10, padding: "5px 6px", fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fff" }}
                        />
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <div onClick={saveRelapse} style={{ cursor: "pointer", flex: 1, textAlign: "center", padding: "6px 0", background: "#3b3527", color: "#fffdf4", fontFamily: F_MARKER, fontSize: 13 }}>LOG IT</div>
                        <div onClick={() => setPopover(null)} style={{ cursor: "pointer", padding: "6px 10px", border: "1.5px solid #cfc6b1", fontFamily: F_MARKER, fontSize: 13, color: "#8b8069" }}>✕</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showStats && (
          <div style={{ flex: "0 0 250px", display: "flex", flexDirection: "column", gap: 18, paddingTop: 4 }}>
            <div style={{ background: "#fdf6c8", border: "1px solid rgba(90,78,55,.2)", padding: "14px 15px 16px", boxShadow: "3px 4px 0 rgba(90,78,55,.16)", transform: "rotate(1.1deg)" }}>
              <div style={{ fontFamily: F_MARKER, fontSize: 14, marginBottom: 10, color: "#4a4232" }}>WEIGHT</div>
              {weightRows.map((w) => (
                <div key={w.name} style={{ marginBottom: 10, fontFamily: F_CAVEAT, fontSize: 20, color: w.color }}>
                  <div style={{ fontWeight: 700 }}>{w.name}</div>
                  <div>start {w.start} → now {w.current} kg</div>
                  <div style={{ color: "#7a6f59" }}>target this week {w.target} kg · {w.delta}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#d8ecdc", border: "1px solid rgba(90,78,55,.2)", padding: "14px 15px 16px", boxShadow: "3px 4px 0 rgba(90,78,55,.16)", transform: "rotate(-1.3deg)" }}>
              <div style={{ fontFamily: F_MARKER, fontSize: 14, marginBottom: 8, color: "#2c5738" }}>ADHERENCE</div>
              <div style={{ fontFamily: F_MARKER, fontSize: 38, lineHeight: 1.45, color: "#2c5738" }}>{pct(done, planned)}%</div>
              <div style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#3b5c42" }}>{done} of {planned} meals ticked</div>
              <div style={{ fontFamily: F_CAVEAT, fontSize: 19, marginTop: 6 }}>
                <span style={{ color: CA }}>A {pct(da, pa)}%</span> · <span style={{ color: CS }}>S {pct(ds, ps)}%</span>
              </div>
            </div>

            <div style={{ background: "#fbdcd6", border: "1px solid rgba(90,78,55,.2)", padding: "14px 15px 16px", boxShadow: "3px 4px 0 rgba(90,78,55,.16)", transform: "rotate(.8deg)" }}>
              <div style={{ fontFamily: F_MARKER, fontSize: 14, marginBottom: 8, color: "#a63f37" }}>DON&rsquo;TS STATUS</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: F_MARKER, fontSize: 38, lineHeight: 1.45, color: overCount ? "#c0392b" : "#3f8f52" }}>{overCount}</div>
                <div style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#7a6f59" }}>rules over limit</div>
              </div>
              <div style={{ fontFamily: F_CAVEAT, fontSize: 19, color: "#7a6f59", marginTop: 6 }}>{overCount ? "fix it before Sunday" : "all rules holding"}</div>
              <div onClick={() => goDonts("donts")} style={{ cursor: "pointer", marginTop: 10, fontFamily: F_MARKER, fontSize: 12, color: "#a63f37", borderBottom: "2px solid #a63f37", display: "inline-block" }}>SEE THE RULES →</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
