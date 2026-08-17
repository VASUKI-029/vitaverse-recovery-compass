export type ActivityDef = {
  id: string;
  title: string;
  category: "Breathing" | "Cognitive" | "Mental Wellness" | "Functional" | "Games";
  minutes: number;
  instruction: string;
  kind: "breathing" | "focus" | "relax" | "goal";
};

export const ACTIVITIES: ActivityDef[] = [
  {
    id: "guided-breathing",
    title: "Guided Breathing",
    category: "Breathing",
    minutes: 5,
    instruction: "Follow the circle.",
    kind: "breathing",
  },
  {
    id: "pursed-lip",
    title: "Pursed-Lip Pacing",
    category: "Breathing",
    minutes: 5,
    instruction: "Follow the circle at a slower pace.",
    kind: "breathing",
  },
  {
    id: "relaxation",
    title: "Relaxation",
    category: "Mental Wellness",
    minutes: 5,
    instruction: "Settle in and let the light expand.",
    kind: "relax",
  },
  {
    id: "focus-challenge",
    title: "Focus Challenge",
    category: "Cognitive",
    minutes: 5,
    instruction: "Tap the highlighted tile.",
    kind: "focus",
  },
  {
    id: "memory-grid",
    title: "Memory Grid",
    category: "Games",
    minutes: 5,
    instruction: "Tap the highlighted tile.",
    kind: "focus",
  },
  {
    id: "sit-to-stand",
    title: "Sit to Stand",
    category: "Functional",
    minutes: 5,
    instruction: "Complete the movement, then confirm.",
    kind: "goal",
  },
  {
    id: "daily-goal",
    title: "Daily Goal",
    category: "Functional",
    minutes: 5,
    instruction: "Confirm today's recovery goal.",
    kind: "goal",
  },
];

export const CATEGORIES = ["Breathing", "Cognitive", "Mental Wellness", "Functional", "Games"] as const;

export function findActivity(id: string) {
  return ACTIVITIES.find((a) => a.id === id);
}
