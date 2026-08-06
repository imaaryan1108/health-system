"use client";

import { useState } from "react";
import { CA, CS, F_CAVEAT, F_MARKER } from "@/lib/constants";
import { fmtDay } from "@/lib/dates";
import { dontById, limitOf, usedFor, weekDays } from "@/lib/logic";
import { parseIso } from "@/lib/dates";
import type { SystemData } from "@/lib/types";

const RULE_HEADERS = ["Don't", "Limit", "Who", "Used", "Left", "Status"];
const COLS = "2.2fr 1.1fr .9fr .9fr .9fr 1.4fr";

export function DontsZone({
  data,
  mutate,
}: {
  data: SystemData;
  mutate: (fn: (draft: SystemData) => void) => void;
}) {
  const days = weekDays();
  const weekLabel = `${fmtDay(days[0].date)} — ${fmtDay(days[6].date)}`;
  const [filterPerson, setFilterPerson] = useState<"all" | "A" | "S">("all");
  const [filterDont, setFilterDont] = useState<string>("all");

  const rules = data.donts.map((r) => {
    const lim = limitOf(r.limit);
    const used = usedFor(data, r);
    const over = used > lim.cap;
    const at = !over && used === lim.cap && lim.cap > 0;
    const dot = over ? "#c0392b" : at ? "#d99b1f" : "#3f8f52";
    return {
      id: r.id,
      name: r.name,
      limitLabel: lim.label,
      whoLabel: r.who === "both" ? "Both" : r.who === "A" ? "Aaryan" : "Sakshi",
      whoColor: r.who === "A" ? CA : r.who === "S" ? CS : "#5c5442",
      used,
      remaining: r.limit === "never" ? "—" : Math.max(0, lim.cap - used),
      remainColor: over ? "#c0392b" : "#3b3527",
      dot,
      statusLabel: over ? "OVER LIMIT" : at ? "at limit" : "within budget",
    };
  });

  const logRows = data.relapses
    .slice()
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .filter((r) => (filterPerson === "all" || r.person === filterPerson) && (filterDont === "all" || r.dontId === filterDont))
    .map((r) => {
      const dn = dontById(data, r.dontId);
      return {
        id: r.id,
        date: fmtDay(parseIso(r.date)),
        time: r.time,
        person: r.person === "A" ? "Aaryan" : "Sakshi",
        color: r.person === "A" ? CA : CS,
        dont: dn ? dn.name : "unknown",
        reason: r.reason,
      };
    });

  const remove = (id: string) => mutate((d) => { d.relapses = d.relapses.filter((x) => x.id !== id); });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 6 }}>
        <div style={{ fontFamily: F_MARKER, fontSize: 34, transform: "rotate(-.7deg)" }}>THE DON&rsquo;TS</div>
        <div style={{ fontFamily: F_CAVEAT, fontSize: 26, color: "#7a6f59" }}>house rules · week of {weekLabel}</div>
      </div>
      <div style={{ height: 3, background: "#3b3527", opacity: 0.75, borderRadius: 2, marginBottom: 20 }} />

      <div style={{ border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", boxShadow: "0 2px 0 rgba(90,78,55,.1)", marginBottom: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: COLS, borderBottom: "2px solid #bdb39c", background: "rgba(224,165,46,.14)" }}>
          {RULE_HEADERS.map((h) => (
            <div key={h} style={{ padding: "9px 12px", fontFamily: F_MARKER, fontSize: 12, letterSpacing: ".05em", color: "#6d5a20", borderRight: "1px solid #e0d8c6" }}>{h}</div>
          ))}
        </div>
        {rules.map((r) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: COLS, borderBottom: "1px solid #e6dfcf", alignItems: "center" }}>
            <div style={{ padding: "11px 12px", fontFamily: F_CAVEAT, fontSize: 23, borderRight: "1px solid #f0ebde", display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: r.dot }} />
              <span>{r.name}</span>
            </div>
            <div style={{ padding: "11px 12px", fontFamily: F_CAVEAT, fontSize: 21, color: "#7a6f59", borderRight: "1px solid #f0ebde" }}>{r.limitLabel}</div>
            <div style={{ padding: "11px 12px", fontFamily: F_CAVEAT, fontSize: 21, borderRight: "1px solid #f0ebde", color: r.whoColor }}>{r.whoLabel}</div>
            <div style={{ padding: "11px 12px", fontFamily: F_MARKER, fontSize: 17, borderRight: "1px solid #f0ebde" }}>{r.used}</div>
            <div style={{ padding: "11px 12px", fontFamily: F_MARKER, fontSize: 17, borderRight: "1px solid #f0ebde", color: r.remainColor }}>{r.remaining}</div>
            <div style={{ padding: "11px 12px", fontFamily: F_CAVEAT, fontSize: 20, color: r.dot }}>{r.statusLabel}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 10 }}>
        <div style={{ fontFamily: F_MARKER, fontSize: 22 }}>RELAPSE LOG</div>
        <div style={{ fontFamily: F_CAVEAT, fontSize: 21, color: "#8b8069" }}>{data.relapses.length} logged all time</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#8b8069" }}>who</span>
          <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value as "all" | "A" | "S")} style={{ padding: "4px 6px", fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
            <option value="all">Both</option>
            <option value="A">Aaryan</option>
            <option value="S">Sakshi</option>
          </select>
          <span style={{ fontFamily: F_CAVEAT, fontSize: 20, color: "#8b8069", marginLeft: 8 }}>what</span>
          <select value={filterDont} onChange={(e) => setFilterDont(e.target.value)} style={{ padding: "4px 6px", fontSize: 13, border: "1.5px solid #cfc6b1", background: "#fffdf4" }}>
            <option value="all">All don&rsquo;ts</option>
            {data.donts.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ border: "2px solid #cfc6b1", background: "rgba(255,253,247,.62)", maxWidth: 1020 }}>
        {logRows.map((l) => (
          <div key={l.id} style={{ display: "grid", gridTemplateColumns: "150px 90px 130px 1.2fr 1.4fr 40px", alignItems: "center", borderBottom: "1px solid #ece5d6", padding: "9px 12px", fontFamily: F_CAVEAT, fontSize: 21 }}>
            <div style={{ color: "#7a6f59" }}>{l.date}</div>
            <div style={{ color: "#9b9078" }}>{l.time}</div>
            <div style={{ fontWeight: 700, color: l.color }}>{l.person}</div>
            <div>{l.dont}</div>
            <div><span style={{ border: "1px solid #cfc6b1", padding: "1px 8px", background: "#fff8e0", fontSize: 18 }}>{l.reason}</span></div>
            <div onClick={() => remove(l.id)} style={{ cursor: "pointer", textAlign: "right", color: "#b5aa92", fontFamily: "var(--font-archivo), sans-serif", fontSize: 13 }}>✕</div>
          </div>
        ))}
        {logRows.length === 0 && (
          <div style={{ padding: 22, fontFamily: F_CAVEAT, fontSize: 23, color: "#8b8069" }}>Nothing logged here. Clean board. …</div>
        )}
      </div>
    </div>
  );
}
