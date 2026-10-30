import { useSyncExternalStore } from "react";
import { getRecord } from "./vitaverse-db";

/**
 * Session state only (language, role, current patient). All patient recovery data
 * lives in the persistent per-patient records in `vitaverse-db.ts`.
 */
export type VitaRole = "patient" | "doctor" | "caregiver" | "admin";

export type VitaState = {
  language: string;
  role: VitaRole | null;
  patient: { name: string; id: string; moduleId: string } | null;
};

const KEY = "vitaverse.state.v2";

const initial: VitaState = { language: "en", role: null, patient: null };

let state: VitaState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VitaState;
      state = { ...initial, language: parsed.language ?? "en", role: parsed.role ?? null, patient: parsed.patient ?? null };
    }
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

export function setState(patch: Partial<VitaState>) {
  hydrate();
  state = { ...state, ...patch };
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

/** Patient sign-in: resolves the assigned module from the patient's stored record. */
export function loginPatient(name: string, id: string): boolean {
  const record = getRecord(id);
  if (!record) return false;
  setState({ role: "patient", patient: { name, id, moduleId: record.moduleId } });
  return true;
}

/** Keeps the patient's session module in sync with their assigned record. */
export function syncPatientModule() {
  const s = getState();
  if (s.role !== "patient" || !s.patient) return;
  const record = getRecord(s.patient.id);
  if (record && record.moduleId !== s.patient.moduleId) {
    setState({ patient: { ...s.patient, moduleId: record.moduleId } });
  }
}

export function resetSession() {
  setState({ role: null, patient: null });
}
