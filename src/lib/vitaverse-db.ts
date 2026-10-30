import { useSyncExternalStore } from "react";
import { dimensionsForIndicator, getModule, type ModuleActivity } from "./modules";
import { DIMENSIONS, overallScore, type Dimension, type DimensionValues } from "./dimensions";

/* ------------------------------------------------------------------ types */

export type BaselineAnswer = {
  assessmentId: string;
  score: number;
  data: Record<string, number | string>;
  at: number;
};

export type ActivityEntry = {
  id: string;
  title: string;
  category: string;
  at: number;
  xp: number;
  score: number;
  source: "daily" | "library" | "doctor";
};

export type BaselineStatus = "not-started" | "in-progress" | "completed";

export type PatientRecord = {
  patientId: string;
  moduleId: string;
  diagnosis: string;
  doctor: string;
  assignedAt: number;
  baseline: {
    status: BaselineStatus;
    answers: Record<string, BaselineAnswer>;
    startedAt: number | null;
    completedAt: number | null;
  };
  /** Scores at baseline completion — the twin's starting snapshot. */
  baselineDimensions: DimensionValues;
  /** Current scores — updated continuously by daily activity performance. */
  dimensions: DimensionValues;
  twin: { createdAt: number | null; updatedAt: number | null };
  difficulty: 1 | 2 | 3;
  planApprovedAt: number | null;
  planNote: string;
  doctorAdded: string[];
  activities: ActivityEntry[];
  xp: number;
  achievements: string[];
  history: { day: string; value: number }[];
  dailyDone: Record<string, string[]>;
  lastUpdate: { dimension: Dimension; from: number; to: number } | null;
  lastAdaptation: { at: number; message: string } | null;
  reassessments: number;
};

export type Doctor = { id: string; name: string; verified: boolean };
export type Caregiver = { id: string; name: string; patientId: string | null };

export type DB = {
  records: Record<string, PatientRecord>;
  doctors: Doctor[];
  caregivers: Caregiver[];
  moduleStatus: Record<string, "live" | "planned">;
  enabledLanguages: string[];
};

/* ------------------------------------------------------------- achievements */

export const ACHIEVEMENTS = [
  { id: "first-step", name: "First Step", desc: "Complete your first activity." },
  { id: "consistency", name: "Consistency", desc: "Complete three activities." },
  { id: "baseline", name: "Baseline Set", desc: "Complete your baseline assessment." },
  { id: "focus-builder", name: "Focus Builder", desc: "Complete five cognitive or game activities." },
  { id: "high-scorer", name: "High Scorer", desc: "Score 80% or more in an activity." },
  { id: "reassessed", name: "Twin Updated", desc: "Complete a reassessment." },
];

/* --------------------------------------------------------------- persistence */

const KEY = "vitaverse.db.v1";

const listeners = new Set<() => void>();

let db: DB = createInitialDB();
let snapshot: DB = db;
let hydrated = false;

function createInitialDB(): DB {
  const records: Record<string, PatientRecord> = {};
  const seeds: { id: string; moduleId: string; diagnosis: string; doctor: string; ago: number }[] = [
    { id: "VT1001", moduleId: "pulmoverse", diagnosis: "Pulmonary rehabilitation — post-illness recovery", doctor: "Dr. Priya", ago: 9 },
    { id: "VT1002", moduleId: "neuroverse", diagnosis: "Neurological rehabilitation", doctor: "Dr. Priya", ago: 8 },
    { id: "VT1003", moduleId: "cardioverse", diagnosis: "Cardiac recovery — post-surgical", doctor: "Dr. Rahul", ago: 7 },
    { id: "VT1004", moduleId: "orthoverse", diagnosis: "Post-operative orthopaedic rehabilitation", doctor: "Dr. Rahul", ago: 6 },
    { id: "VT1005", moduleId: "oncoverse", diagnosis: "Oncology supportive recovery", doctor: "Dr. Priya", ago: 5 },
    { id: "VT1006", moduleId: "geriverse", diagnosis: "Geriatric functional recovery", doctor: "Dr. Rahul", ago: 4 },
    { id: "VT1007", moduleId: "pediaverse", diagnosis: "Paediatric recovery care", doctor: "Dr. Priya", ago: 3 },
  ];
  for (const s of seeds) records[s.id] = blankRecord(s.id, s.moduleId, s.diagnosis, s.doctor, s.ago);
  return {
    records,
    doctors: [
      { id: "DOC001", name: "Dr. Priya", verified: true },
      { id: "DOC002", name: "Dr. Rahul", verified: false },
    ],
    caregivers: [{ id: "CG001", name: "Meena Kumar", patientId: "VT1003" }],
    moduleStatus: {
      neuroverse: "live",
      pulmoverse: "live",
      cardioverse: "live",
      orthoverse: "live",
      oncoverse: "live",
      geriverse: "live",
      pediaverse: "live",
    },
    enabledLanguages: ["en", "hi", "ta", "te", "ml", "kn", "es", "fr", "de", "ar"],
  };
}

function blankRecord(patientId: string, moduleId: string, diagnosis: string, doctor: string, daysAgo: number): PatientRecord {
  return {
    patientId,
    moduleId,
    diagnosis,
    doctor,
    assignedAt: Date.now() - daysAgo * 86400000,
    baseline: { status: "not-started", answers: {}, startedAt: null, completedAt: null },
    baselineDimensions: { physical: 0, cognitive: 0, emotional: 0, functional: 0, social: 0, engagement: 0 },
    dimensions: { physical: 0, cognitive: 0, emotional: 0, functional: 0, social: 0, engagement: 0 },
    twin: { createdAt: null, updatedAt: null },
    difficulty: 2,
    planApprovedAt: null,
    planNote: "",
    doctorAdded: [],
    activities: [],
    xp: 0,
    achievements: [],
    history: [],
    dailyDone: {},
    lastUpdate: null,
    lastAdaptation: null,
    reassessments: 0,
  };
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) db = { ...createInitialDB(), ...(JSON.parse(raw) as DB) };
  } catch {
    /* ignore */
  }
  snapshot = db;
}

function save() {
  snapshot = db;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return snapshot;
    },
    () => snapshot,
  );
}

export function getDB(): DB {
  hydrate();
  return db;
}

export function getRecord(patientId: string | null | undefined): PatientRecord | null {
  if (!patientId) return null;
  const d = getDB();
  return d.records[patientId] ?? null;
}

function mutate(patientId: string, fn: (r: PatientRecord) => void) {
  hydrate();
  const record = db.records[patientId];
  if (!record) return;
  const next: PatientRecord = structuredClone(record);
  fn(next);
  db = { ...db, records: { ...db.records, [patientId]: next } };
  save();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "short" });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* --------------------------------------------------- doctor / admin actions */

/** Doctor assigns (or re-assigns) the recovery module. A new module restarts the baseline. */
export function assignModule(patientId: string, moduleId: string, doctor: string) {
  mutate(patientId, (r) => {
    if (r.moduleId === moduleId) return;
    r.moduleId = moduleId;
    r.doctor = doctor || r.doctor;
    r.assignedAt = Date.now();
    r.baseline = { status: "not-started", answers: {}, startedAt: null, completedAt: null };
    r.baselineDimensions = { physical: 0, cognitive: 0, emotional: 0, functional: 0, social: 0, engagement: 0 };
    r.twin = { createdAt: null, updatedAt: null };
    r.activities = [];
    r.dailyDone = {};
    r.doctorAdded = [];
    r.lastUpdate = null;
    r.lastAdaptation = null;
  });
}

export function setDiagnosis(patientId: string, diagnosis: string) {
  mutate(patientId, (r) => {
    r.diagnosis = diagnosis;
  });
}

export function doctorApprovePlan(patientId: string, note: string) {
  mutate(patientId, (r) => {
    r.planApprovedAt = Date.now();
    if (note) r.planNote = note;
  });
}

export function doctorAddActivity(patientId: string, activityId: string) {
  mutate(patientId, (r) => {
    if (!r.doctorAdded.includes(activityId)) r.doctorAdded.push(activityId);
  });
}

export function doctorRemoveActivity(patientId: string, activityId: string) {
  mutate(patientId, (r) => {
    r.doctorAdded = r.doctorAdded.filter((id) => id !== activityId);
  });
}

export function doctorSetDifficulty(patientId: string, difficulty: 1 | 2 | 3) {
  mutate(patientId, (r) => {
    r.difficulty = difficulty;
  });
}

/** Doctor decides the patient should repeat the baseline (reassessment). */
export function requestReassessment(patientId: string) {
  mutate(patientId, (r) => {
    r.reassessments += 1;
    r.baseline = { status: "not-started", answers: {}, startedAt: null, completedAt: null };
    r.doctorAdded = [];
  });
}

export function verifyDoctor(doctorId: string) {
  hydrate();
  db = { ...db, doctors: db.doctors.map((d) => (d.id === doctorId ? { ...d, verified: true } : d)) };
  save();
}

export function linkCaregiver(caregiverId: string, patientId: string | null) {
  hydrate();
  db = { ...db, caregivers: db.caregivers.map((c) => (c.id === caregiverId ? { ...c, patientId } : c)) };
  save();
}

export function setModuleStatus(moduleId: string, status: "live" | "planned") {
  hydrate();
  db = { ...db, moduleStatus: { ...db.moduleStatus, [moduleId]: status } };
  save();
}

export function toggleLanguage(code: string) {
  hydrate();
  const has = db.enabledLanguages.includes(code);
  const next = has ? db.enabledLanguages.filter((l) => l !== code) : [...db.enabledLanguages, code];
  db = { ...db, enabledLanguages: next.length ? next : db.enabledLanguages };
  save();
}

/* ---------------------------------------------------------------- baseline */

/** Saves one baseline task result immediately, so progress is never lost. */
export function saveBaselineAnswer(
  patientId: string,
  assessmentId: string,
  score: number,
  data: Record<string, number | string>,
) {
  mutate(patientId, (r) => {
    r.baseline.answers[assessmentId] = { assessmentId, score: Math.round(score), data, at: Date.now() };
    if (r.baseline.status === "not-started") {
      r.baseline.status = "in-progress";
      r.baseline.startedAt = Date.now();
    }
  });
}

export function deleteBaselineAnswer(patientId: string, assessmentId: string) {
  mutate(patientId, (r) => {
    delete r.baseline.answers[assessmentId];
  });
}

function computeDimensions(record: PatientRecord): DimensionValues {
  const mod = getModule(record.moduleId);
  const totals: Record<Dimension, { sum: number; n: number }> = {
    physical: { sum: 0, n: 0 },
    cognitive: { sum: 0, n: 0 },
    emotional: { sum: 0, n: 0 },
    functional: { sum: 0, n: 0 },
    social: { sum: 0, n: 0 },
    engagement: { sum: 0, n: 0 },
  };
  for (const a of mod.assessments) {
    const answer = record.baseline.answers[a.id];
    if (!answer) continue;
    const inverted = a.indicator.invert === true || (a.task as { invert?: boolean }).invert === true;
    const score = inverted ? 100 - answer.score : answer.score;
    const dims = dimensionsForIndicator(a.indicator.key);
    for (const d of dims) {
      totals[d]!.sum += clamp(score, 0, 100);
      totals[d]!.n += 1;
    }
  }
  const out = {} as DimensionValues;
  for (const d of DIMENSIONS) out[d.key] = totals[d.key]!.n ? Math.round(totals[d.key]!.sum / totals[d.key]!.n) : 50;
  return out;
}

/** Completes the baseline: calculates the VITAVERSE Recovery Indicators and starts the twin snapshot. */
export function completeBaseline(patientId: string) {
  mutate(patientId, (r) => {
    const dims = computeDimensions(r);
    const isFirst = r.baseline.status !== "completed";
    r.baselineDimensions = dims;
    r.dimensions = { ...dims };
    r.baseline.status = "completed";
    r.baseline.completedAt = Date.now();
    r.xp += isFirst ? modXp(r) : 0;
    r.achievements = evaluate({ ...r });
  });
}

function modXp(r: PatientRecord) {
  return getModule(r.moduleId).assessments.length * 10;
}

/** Creates the Digital Twin from the baseline results. */
export function createTwin(patientId: string) {
  mutate(patientId, (r) => {
    if (r.baseline.status !== "completed") return;
    if (!r.twin.createdAt) r.twin.createdAt = Date.now();
    r.twin.updatedAt = Date.now();
  });
}

/* ------------------------------------------------------------ daily engine */

/** The AI adaptive plan: 4–5 activities chosen from the weakest current dimensions, varying by day. */
export function dailyPlan(record: PatientRecord, dateKey = todayKey()): ModuleActivity[] {
  if (record.baseline.status !== "completed") return [];
  const mod = getModule(record.moduleId);
  const done = new Set(record.dailyDone[dateKey] ?? []);
  const added = record.doctorAdded
    .map((id) => mod.activities.find((a) => a.id === id))
    .filter((a): a is ModuleActivity => !!a && !done.has(a.id));
  const pool = mod.activities.filter((a) => !done.has(a.id) && !record.doctorAdded.includes(a.id));
  const seed = [...(dateKey + record.patientId)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const ranked = pool
    .map((a) => {
      const dims = dimensionsForIndicator(a.indicatorKey);
      const weakness = 100 - Math.min(...dims.map((d) => record.dimensions[d] ?? 55));
      return { a, rank: weakness + (a.isGame ? 10 : 0) + ((seed + a.id.length * 7) % 19) };
    })
    .sort((x, y) => y.rank - x.rank)
    .map((r) => r.a);
  return [...added, ...ranked].slice(0, 5);
}

export function todaysProgress(record: PatientRecord): { done: number; total: number } {
  const plan = dailyPlan(record);
  if (!plan.length) return { done: 0, total: 0 };
  const done = new Set(record.dailyDone[todayKey()] ?? []);
  return { done: plan.filter((a) => done.has(a.id)).length, total: plan.length };
}

/**
 * Records a completed activity, updates the recovery indicators and the Digital Twin,
 * then adapts the difficulty of upcoming days.
 */
export function recordActivity(
  patientId: string,
  activity: { id: string; title: string; category: string; indicatorKey: string; score: number; source?: ActivityEntry["source"] },
) {
  mutate(patientId, (r) => {
    const score = clamp(Math.round(activity.score), 0, 100);
    const dims = dimensionsForIndicator(activity.indicatorKey);
    const delta = Math.round((score - 50) / 10);
    let firstFrom = r.dimensions[dims[0]!] ?? 50;
    let firstTo = firstFrom;
    for (const d of dims) {
      const from = r.dimensions[d] ?? 50;
      const to = clamp(from + delta, 0, 100);
      r.dimensions[d] = to;
      if (d === dims[0]) {
        firstFrom = from;
        firstTo = to;
      }
    }
    const xpGain = 30 + Math.round(score / 5);
    const entry: ActivityEntry = {
      id: activity.id,
      title: activity.title,
      category: activity.category,
      at: Date.now(),
      xp: xpGain,
      score,
      source: activity.source ?? "library",
    };
    const activities = [...r.activities, entry];
    r.dimensions = { ...r.dimensions };
    r.twin.updatedAt = r.twin.createdAt ? Date.now() : r.twin.updatedAt;
    r.xp += xpGain;
    r.lastUpdate = { dimension: dims[0]!, from: firstFrom, to: firstTo };
    r.history = [...r.history.filter((h) => h.day !== dayLabel()), { day: dayLabel(), value: overallScore(r.dimensions) }];
    const key = todayKey();
    r.dailyDone[key] = [...new Set([...(r.dailyDone[key] ?? []), activity.id])];

    // Adaptive difficulty from the most recent performances.
    const recent = activities.slice(-3);
    const avg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
    if (avg >= 78 && r.difficulty < 3) {
      r.difficulty = (r.difficulty + 1) as 1 | 2 | 3;
      r.lastAdaptation = { at: Date.now(), message: "Difficulty increased — your recent performance is strong." };
    } else if (avg < 45 && r.difficulty > 1) {
      r.difficulty = (r.difficulty - 1) as 1 | 2 | 3;
      r.lastAdaptation = { at: Date.now(), message: "Difficulty eased — the plan has been adjusted to a gentler pace." };
    }
    r.activities = activities;
    r.achievements = evaluate({ ...r, activities });
  });
}

export function evaluate(r: {
  activities: ActivityEntry[];
  baseline: { status: BaselineStatus };
  reassessments: number;
}): string[] {
  const unlocked = new Set<string>();
  if (r.activities.length >= 1) unlocked.add("first-step");
  if (r.activities.length >= 3) unlocked.add("consistency");
  if (r.baseline.status === "completed") unlocked.add("baseline");
  if (r.activities.filter((a) => a.category === "Cognitive" || a.category === "Games").length >= 5) unlocked.add("focus-builder");
  if (r.activities.some((a) => a.score >= 80)) unlocked.add("high-scorer");
  if (r.reassessments >= 1) unlocked.add("reassessed");
  return [...unlocked];
}

/* ---------------------------------------------------------------- insights */

export function streakDays(record: PatientRecord): number {
  return Math.min(1 + Math.floor(record.activities.length / 2), 30);
}

export function insightFor(record: PatientRecord): string {
  if (record.baseline.status !== "completed") {
    return `Complete your ${getModule(record.moduleId).name} baseline assessment to unlock personalised recovery insights.`;
  }
  const entries = DIMENSIONS.map((d) => ({ label: d.label, value: record.dimensions[d.key] }));
  entries.sort((a, b) => a.value - b.value);
  const weakest = entries[0]!;
  const strongest = entries[entries.length - 1]!;
  return `${strongest.label} is your strongest signal at ${strongest.value}%. Today's plan focuses on ${weakest.label.toLowerCase()}, currently ${weakest.value}%.`;
}

/** AI-generated clinical insights for the doctor (decision support, not decisions). */
export function aiInsights(record: PatientRecord): string[] {
  if (record.baseline.status !== "completed") return ["Baseline assessment not completed yet — no adaptive data available."];
  const out: string[] = [];
  const last7 = record.activities.filter((a) => Date.now() - a.at < 7 * 86400000);
  const avg = last7.length ? Math.round(last7.reduce((a, b) => a + b.score, 0) / last7.length) : null;
  const deltas = DIMENSIONS.map((d) => ({ label: d.label, delta: record.dimensions[d.key] - record.baselineDimensions[d.key] }));
  const best = deltas.reduce((a, b) => (b.delta > a.delta ? b : a));
  const worst = deltas.reduce((a, b) => (b.delta < a.delta ? b : a));
  if (best.delta > 0) out.push(`${best.label} improved by ${best.delta}% since baseline.`);
  if (worst.delta < 0) out.push(`${worst.label} declined by ${Math.abs(worst.delta)}% — consider reviewing the plan.`);
  if (avg !== null) out.push(`Average activity performance this week: ${avg}%.`);
  if (last7.length < 3) out.push("Patient engagement decreased — only a few activities completed this week.");
  if (record.difficulty < 3 && avg !== null && avg >= 78) out.push("Activity difficulty may be increased.");
  if (record.difficulty > 1 && avg !== null && avg < 45) out.push("Activity difficulty may be reduced.");
  if (!out.length) out.push("Recovery indicators are stable — continue the current plan.");
  return out;
}

export { overallScore } from "./dimensions";
export type { Dimension, DimensionValues } from "./dimensions";
export { DIMENSIONS } from "./dimensions";
