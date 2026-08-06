"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, mutateStore, resetStore, subscribe } from "@/lib/store";

export function useSystemData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { data, mutate: mutateStore, resetAll: resetStore };
}
