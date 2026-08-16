import { useSyncExternalStore } from "react";

export type Metrics = {
  breathing: number;
  pacing: number;
  comfort: number;
  fatigue: number;
  confidence: number;
};

export type ActivityLog = {
  id: string;
  title: string;
  category: string;
  at: number;
  xp: number;
};

export type VitaState = {
  language: string;
  role: "patient" | "doctor" | "caregiver" | "admin" | null;
  patient: { name: string; id: string; module: string } | null;
  assessments: Partial<Record<string, number>>;
  raw: {
    cyclesCompleted: number;
    cyclesMissed: number;
    timingConsistency: number;
    pacingCycles: number;
    pacingConsistency: number;
  };
  metrics: Metrics | null;
  twinCreated: boolean;
  activities: ActivityLog[];
  xp: number;
  achievements: string[];
  history: { day: string; value: number }[];
  lastUpdate: { metric: string; from: number; to: number } | null;
};

const KEY = "vitaverse.state.v1";

const initial: VitaState = {
  language: "en",
  role: null,
  patient: null,
  assessments: {},
  raw: {
    cyclesCompleted: 0,
    cyclesMissed: 0,
    timingConsistency: 0,
    pacingCycles: 0,
    pacingConsistency: 0,
  },
  metrics: null,
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

export const ACHIEVEMENTS = [
  { id: "first-step", name: "First Step", desc: "Complete your first activity." },
  { id: "consistency", name: "Consistency", desc: "Complete daily goals." },
  { id: "focus-builder", name: "Focus Builder", desc: "Complete 5 cognitive activities." },
  { id: "breathing-streak", name: "Breathing Streak", desc: "Complete breathing activities consistently." },
];

export function evaluateAchievements(s: VitaState): string[] {
  const unlocked = new Set(s.achievements);
  if (s.activities.length >= 1) unlocked.add("first-step");
  if (s.activities.length >= 3) unlocked.add("consistency");
  if (s.activities.filter((a) => a.category === "Cognitive").length >= 5) unlocked.add("focus-builder");
  if (s.activities.filter((a) => a.category === "Breathing").length >= 3) unlocked.add("breathing-streak");
  return [...unlocked];
}

export function computeMetrics(s: VitaState): Metrics {
  const r = s.raw;
  const totalCycles = r.cyclesCompleted + r.cyclesMissed || 1;
  const breathing = Math.round(
    clamp((r.cyclesCompleted / totalCycles) * 65 + r.timingConsistency * 35, 0, 100),
  );
  const pacing = Math.round(clamp((r.pacingCycles / 5) * 55 + r.pacingConsistency * 45, 0, 100));
  const comfort = Math.round(((s.assessments["comfort"] ?? 3) / 5) * 100);
  const fatigue = Math.round(s.assessments["fatigue"] ?? 50);
  const confidence = Math.round(s.assessments["confidence"] ?? 50);
  return { breathing, pacing, comfort, fatigue, confidence };
}

export function overallScore(m: Metrics): number {
  return Math.round(
    clamp(m.breathing * 0.25 + m.pacing * 0.2 + m.comfort * 0.2 + (100 - m.fatigue) * 0.15 + m.confidence * 0.2, 0, 100),
  );
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function finalizeAssessment() {
  setState((s) => {
    const metrics = computeMetrics(s);
    const overall = overallScore(metrics);
    const today = new Date().toLocaleDateString(undefined, { weekday: "short" });
    return {
      metrics,
      xp: s.xp + 20,
      history: [...s.history.filter((h) => h.day !== today), { day: today, value: overall }],
    };
  });
}

const METRIC_BY_CATEGORY: Record<string, keyof Metrics> = {
  Breathing: "breathing",
  Cognitive: "pacing",
  "Mental Wellness": "confidence",
  Functional: "comfort",
  Games: "pacing",
};

export function completeActivity(activity: { id: string; title: string; category: string }) {
  setState((s) => {
    const key = METRIC_BY_CATEGORY[activity.category] ?? "breathing";
    const metrics: Metrics = s.metrics ?? computeMetrics(s);
    const from = metrics[key];
    const to = Math.round(clamp(from + 4, 0, 100));
    const nextMetrics = { ...metrics, [key]: to } as Metrics;
    const activities = [
      ...s.activities,
      { ...activity, at: Date.now(), xp: 30 },
    ];
    const next: VitaState = {
      ...s,
      metrics: nextMetrics,
      activities,
      xp: s.xp + 30,
      lastUpdate: { metric: key, from, to },
    };
    const today = new Date().toLocaleDateString(undefined, { weekday: "short" });
    return {
      metrics: nextMetrics,
      activities,
      xp: next.xp,
      lastUpdate: next.lastUpdate,
      achievements: evaluateAchievements(next),
      history: [...s.history.filter((h) => h.day !== today), { day: today, value: overallScore(nextMetrics) }],
    };
  });
}

export function streakDays(s: VitaState) {
  return Math.min(6 + Math.floor(s.activities.length / 3), 30);
}

export function todaysProgress(s: VitaState) {
  const today = new Date().toDateString();
  const done = s.activities.filter((a) => new Date(a.at).toDateString() === today).length;
  return { done: Math.min(done, 3), total: 3 };
}

export function insightFor(s: VitaState): string {
  const m = s.metrics;
  if (!m) return "Complete your assessment to unlock personalised recovery insights.";
  const entries: [string, number][] = [
    ["breathing control", m.breathing],
    ["pacing", m.pacing],
    ["activity comfort", m.comfort],
    ["recovery confidence", m.confidence],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  const weakest = entries[0];
  const strongest = entries[entries.length - 1];
  if (m.fatigue > 65)
    return `Your fatigue reading is high today — shorter sessions with longer rest are recommended before focusing on ${weakest[0]}.`;
  return `Your ${strongest[0]} is your strongest signal at ${strongest[1]}%. Today's plan focuses on ${weakest[0]}, currently ${weakest[1]}%.`;
}

export function resetSession() {
  setState({ role: null, patient: null });
}
