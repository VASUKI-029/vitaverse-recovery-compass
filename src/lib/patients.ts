export type DemoPatient = {
  name: string;
  id: string;
  moduleId: string;
  age: number;
  ward: string;
};

export const DEMO_PATIENTS: DemoPatient[] = [
  { name: "Alex", id: "VT1001", moduleId: "pulmoverse", age: 54, ward: "Respiratory 2A" },
  { name: "Maya", id: "VT1002", moduleId: "neuroverse", age: 41, ward: "Neuro 1B" },
  { name: "Arjun", id: "VT1003", moduleId: "cardioverse", age: 62, ward: "Cardiac 3C" },
  { name: "Sara", id: "VT1004", moduleId: "orthoverse", age: 37, ward: "Ortho 2D" },
  { name: "David", id: "VT1005", moduleId: "oncoverse", age: 58, ward: "Oncology 4A" },
  { name: "Meena", id: "VT1006", moduleId: "geriverse", age: 79, ward: "Geriatrics 1A" },
  { name: "Aanya", id: "VT1007", moduleId: "pediaverse", age: 9, ward: "Paediatrics 5B" },
];

export function findPatient(name: string, id: string) {
  const n = name.trim().toLowerCase();
  const pid = id.trim().toUpperCase();
  return DEMO_PATIENTS.find((p) => p.name.toLowerCase() === n && p.id === pid);
}

export function patientById(id: string) {
  return DEMO_PATIENTS.find((p) => p.id.toUpperCase() === id.toUpperCase());
}
