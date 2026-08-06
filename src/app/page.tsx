"use client";

import { useEffect, useState } from "react";
import { useSystemData } from "@/hooks/useSystemData";
import { TabStrip } from "@/components/TabStrip";
import { WeekZone } from "@/components/WeekZone";
import { DontsZone } from "@/components/DontsZone";
import { ProgressZone } from "@/components/ProgressZone";
import { SetupZone } from "@/components/SetupZone";
import type { Zone } from "@/lib/types";

const WORKOUT_GOAL = 5;
const SHOW_STATS = true;
const TEXTURE = true;

export default function Home() {
  const { data, mutate, resetAll } = useSystemData();
  const [zone, setZone] = useState<Zone>("week");

  useEffect(() => {
    document.body.classList.toggle("no-texture", !TEXTURE);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        background: "#f4efe2",
        backgroundImage:
          "linear-gradient(rgba(90,78,55,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(90,78,55,.055) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        color: "#3b3527",
      }}
    >
      <TabStrip zone={zone} onChange={setZone} />
      <div style={{ flex: 1, minWidth: 0, padding: "26px 30px 60px" }}>
        {zone === "week" && (
          <WeekZone data={data} mutate={mutate} showStats={SHOW_STATS} workoutGoal={WORKOUT_GOAL} goDonts={setZone} />
        )}
        {zone === "donts" && <DontsZone data={data} mutate={mutate} />}
        {zone === "progress" && <ProgressZone data={data} />}
        {zone === "setup" && (
          <SetupZone data={data} mutate={mutate} resetAll={resetAll} workoutGoal={WORKOUT_GOAL} />
        )}
      </div>
    </div>
  );
}
