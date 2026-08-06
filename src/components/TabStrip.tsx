"use client";

import { F_MARKER } from "@/lib/constants";
import type { Zone } from "@/lib/types";

const TABS: { id: Zone; label: string; tape: string }[] = [
  { id: "week", label: "THIS WEEK", tape: "#f2d98c" },
  { id: "donts", label: "DON'TS", tape: "#f4b9b1" },
  { id: "progress", label: "PROGRESS", tape: "#a9cfe8" },
  { id: "setup", label: "SETUP", tape: "#cfe3c2" },
];

export function TabStrip({ zone, onChange }: { zone: Zone; onChange: (z: Zone) => void }) {
  return (
    <div
      style={{
        width: 78,
        flex: "0 0 78px",
        borderRight: "2px solid #ddd5c2",
        paddingTop: 34,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        background: "rgba(255,253,246,.35)",
      }}
    >
      <div
        style={{
          fontFamily: F_MARKER,
          fontSize: 13,
          lineHeight: 1.1,
          textAlign: "center",
          color: "#6d6350",
          transform: "rotate(-3deg)",
          marginBottom: 10,
        }}
      >
        THE
        <br />
        SYSTEM
      </div>
      {TABS.map((tab) => {
        const active = tab.id === zone;
        return (
          <div
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "16px 6px",
              width: 52,
              display: "flex",
              justifyContent: "center",
              borderRadius: 3,
              border: "1px solid rgba(90,78,55,.18)",
              boxShadow: "0 1px 0 rgba(90,78,55,.12)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 3,
                opacity: 0.55,
                background: tab.tape,
              }}
            />
            {active && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 3,
                  background: tab.tape,
                  border: "2px solid rgba(59,53,39,.5)",
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontFamily: F_MARKER,
                fontSize: 14,
                letterSpacing: ".04em",
                color: "#3b3527",
              }}
            >
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
