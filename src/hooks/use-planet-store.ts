import { useSyncExternalStore } from "react";

export type ResourceType = "juice" | "crust" | "pit";
export type GameStatus = "playing" | "won" | "lost-shatter" | "lost-collapse";

export interface Harvest {
  id: string;
  resource_type: ResourceType;
  amount: number;
  extracted_at: string;
}

export interface PlanetState {
  syrup_pressure: number;
  total_juice: number;
  total_crust: number;
  total_pit: number;
  refined: number;
  status: GameStatus;
  updated_at: string;
  harvests: Harvest[];
  streak: number;
  psi_history: number[];
  best_refined: number;
}

const KEY = "planetary-harvester:v3";
export const WIN_TARGET = 500;
export const MAX_PSI = 1000;
export const SAFE_LOW = 200;
export const SAFE_HIGH = 800;
export const STREAK_MAX = 8;

export function streakMultiplier(streak: number) {
  return 1 + Math.min(streak, STREAK_MAX) * 0.08;
}

const initial = (): PlanetState => ({
  syrup_pressure: 420,
  total_juice: 0,
  total_crust: 0,
  total_pit: 0,
  refined: 0,
  status: "playing",
  updated_at: new Date().toISOString(),
  harvests: [],
  streak: 0,
  psi_history: [420],
  best_refined: 0,
});

function load(): PlanetState {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw);
    return { ...initial(), ...parsed };
  } catch {
    return initial();
  }
}

let state: PlanetState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
function getSnapshot() { return state; }
function getServerSnapshot() { return initial(); }

// juice raises pressure (tapping syrup pushes core), crust mining vents pressure down,
// pit prying drops pressure hard (relief valve) but is risky to overuse.
export const DELTA = { juice: 2.2, crust: -1.4, pit: -3.2 } as const;

export const planetStore = {
  extract(resource_type: ResourceType, amount: number) {
    if (state.status !== "playing") return;
    const delta = DELTA[resource_type] * amount;
    const nextPsi = state.syrup_pressure + delta;
    const clamped = Math.max(0, Math.min(MAX_PSI, nextPsi));

    const inSafe = clamped >= SAFE_LOW && clamped <= SAFE_HIGH;
    const isStreakHit = resource_type === "juice" && inSafe;
    const nextStreak = isStreakHit ? Math.min(state.streak + 1, STREAK_MAX) : 0;
    const mult = isStreakHit ? streakMultiplier(nextStreak) : 1;
    const refinedGain = resource_type === "juice" && inSafe ? amount * mult : 0;
    const nextRefined = state.refined + refinedGain;

    let status: GameStatus = state.status;
    if (nextPsi >= MAX_PSI) status = "lost-shatter";
    else if (nextPsi <= 0) status = "lost-collapse";
    else if (nextRefined >= WIN_TARGET) status = "won";

    const nextHistory = [...state.psi_history, clamped].slice(-24);
    const nextBest = Math.max(state.best_refined, nextRefined);

    state = {
      ...state,
      syrup_pressure: clamped,
      total_juice: state.total_juice + (resource_type === "juice" ? amount : 0),
      total_crust: state.total_crust + (resource_type === "crust" ? amount : 0),
      total_pit: state.total_pit + (resource_type === "pit" ? amount : 0),
      refined: nextRefined,
      status,
      updated_at: new Date().toISOString(),
      harvests: [
        { id: crypto.randomUUID(), resource_type, amount, extracted_at: new Date().toISOString() },
        ...state.harvests,
      ].slice(0, 50),
      streak: nextStreak,
      psi_history: nextHistory,
      best_refined: nextBest,
    };
    persist();
  },
  reset() {
    const best = state.best_refined;
    state = { ...initial(), best_refined: best };
    persist();
  },
};

export function usePlanetStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
