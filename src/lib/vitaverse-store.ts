import { useSyncExternalStore } from "react";
import { getModule, type ModuleDef } from "./modules";

export type IndicatorValues = Record<string, number>;

export type AssessmentRecord = {
  assessmentId: string;
  indicatorKey: string;
  score: number;
  data: Record<string, number | string>;
  at: number;
};

export type ActivityLog = {
  id: string;
  title: string;
  category: string;
  at: number;
  xp: number;
  score: number;
};

export type VitaState = {
  language: string;
  role: "patient" | "doctor" | "caregiver" | "admin" | null;
  patient: { name: string; id: string; moduleId: string } | null;
  indicators: IndicatorValues;
  results: Record<string, AssessmentRecord>;
  baselineDone: boolean;
  reassessments: number;
  twinCreated: boolean;
  activities: ActivityLog[];
  xp: number;
  achievements: string[];
  history: { day: string; value: number }[];
  lastUpdate: { metric: string; from: number; to: number } | null;
};

const KEY = "vitaverse.state.v2";

const initial: VitaState = {
  language: "en",
  role: null,
  patient: null,
  indicators: {},
  results: {},
  baselineDone: false,
  reassessments: 0,
  twinCreated: false,
  activities: [],
  xp: 0,
  achievements: [],
  history: [],
  lastUpdate: null,
};

let state: VitaState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...(JSON.parse(raw) as VitaState) };
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setState(patch: Partial<VitaState> | ((s: VitaState) => Partial<VitaState>)) {
  hydrate();
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useVita(): VitaState {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return state;
    },
    () => initial,
  );
}

export function getState() {
  hydrate();
  return state;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const ACHIEVEMENTS = [
  { id: "first-step", name: "First Step", desc: "Complete your first activity." },
  { id: "consistency", name: "Consistency", desc: "Complete three activities." },
  { id: "baseline", name: "Baseline Set", desc: "Finish all five assessments." },
  { id: "focus-builder", name: "Focus Builder", desc: "Complete five cognitive or game activities." },
  { id: "high-scorer", name: "High Scorer", desc: "Score 80% or more in an activity." },
  { id: "reassessed", name: "Twin Updated", desc: "Complete a reassessment." },
];

export function evaluateAchievements(s: VitaState): string[] {
  const unlocked = new Set(s.achievements);
  if (s.activities.length >= 1) unlocked.add("first-step");
  if (s.activities.length >= 3) unlocked.add("consistency");
  if (s.baselineDone) unlocked.add("baseline");
  if (s.activities.filter((a) => a.category === "Cognitive" || a.category === "Games").length >= 5)
    unlocked.add("focus-builder");
  if (s.activities.some((a) => a.score >= 80)) unlocked.add("high-scorer");
  if (s.reassessments >= 1) unlocked.add("reassessed");
  return [...unlocked];
}

/** Records one completed assessment task and its derived recovery indicator. */
export function saveAssessmentResult(record: Omit<AssessmentRecord, "at">) {
  setState((s) => ({
    results: { ...s.results, [record.assessmentId]: { ...record, at: Date.now() } },
    indicators: { ...s.indicators, [record.indicatorKey]: Math.round(clamp(record.score, 0, 100)) },
  }));
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "short" });
}

export function overallScore(mod: ModuleDef, indicators: IndicatorValues): number {
  const values = mod.indicators.map((ind) => {
    const raw = indicators[ind.key];
    if (raw === undefined) return null;
    return ind.invert ? 100 - raw : raw;
  });
  const present = values.filter((v): v is number => v !== null);
  if (!present.length) return 0;
  return Math.round(present.reduce((a, b) => a + b, 0) / present.length);
}

export function finalizeAssessment() {
  setState((s) => {
    const mod = getModule(s.patient?.moduleId);
    const overall = overallScore(mod, s.indicators);
    const isReassessment = s.baselineDone;
    const next: VitaState = {
      ...s,
      baselineDone: true,
      reassessments: isReassessment ? s.reassessments + 1 : s.reassessments,
      xp: s.xp + 20,
      history: [...s.history.filter((h) => h.day !== todayLabel()), { day: todayLabel(), value: overall }],
    };
    return { ...next, achievements: evaluateAchievements(next) };
  });
}

export function completeActivity(activity: {
  id: string;
  title: string;
  category: string;
  indicatorKey: string;
  score: number;
}) {
  setState((s) => {
    const mod = getModule(s.patient?.moduleId);
    const ind = mod.indicators.find((i) => i.key === activity.indicatorKey);
    const from = s.indicators[activity.indicatorKey] ?? activity.score;
    // A strong performance nudges the indicator toward that performance level.
    const delta = Math.round((activity.score - 50) / 12);
    const to = Math.round(clamp(ind?.invert ? from - delta : from + delta, 0, 100));
    const indicators = { ...s.indicators, [activity.indicatorKey]: to };
    const xpGain = 30 + Math.round(activity.score / 5);
    const activities = [
      ...s.activities,
      {
        id: activity.id,
        title: activity.title,
        category: activity.category,
        at: Date.now(),
        xp: xpGain,
        score: Math.round(activity.score),
      },
    ];
    const next: VitaState = {
      ...s,
      indicators,
      activities,
      xp: s.xp + xpGain,
      lastUpdate: { metric: ind?.label ?? activity.indicatorKey, from, to },
    };
    return {
      indicators,
      activities,
      xp: next.xp,
      lastUpdate: next.lastUpdate,
      achievements: evaluateAchievements(next),
      history: [
        ...s.history.filter((h) => h.day !== todayLabel()),
        { day: todayLabel(), value: overallScore(mod, indicators) },
      ],
    };
  });
}

export function lastActivityXp(s: VitaState) {
  return s.activities[s.activities.length - 1]?.xp ?? 30;
}

export function streakDays(s: VitaState) {
  return Math.min(1 + Math.floor(s.activities.length / 2), 30);
}

export function todaysProgress(s: VitaState) {
  const today = new Date().toDateString();
  const done = s.activities.filter((a) => new Date(a.at).toDateString() === today).length;
  return { done: Math.min(done, 3), total: 3 };
}

export function insightFor(s: VitaState): string {
  const mod = getModule(s.patient?.moduleId);
  const entries = mod.indicators
    .filter((i) => s.indicators[i.key] !== undefined)
    .map((i) => ({ label: i.label, value: i.invert ? 100 - s.indicators[i.key]! : s.indicators[i.key]! }));
  if (!entries.length) return `Complete your ${mod.name} assessment to unlock personalised recovery insights.`;
  entries.sort((a, b) => a.value - b.value);
  const weakest = entries[0]!;
  const strongest = entries[entries.length - 1]!;
  return `${strongest.label} is your strongest signal at ${strongest.value}%. Today's ${mod.name} plan focuses on ${weakest.label.toLowerCase()}, currently ${weakest.value}%.`;
}

export function resetSession() {
  setState({ role: null, patient: null });
}
