/**
 * VITAVERSE RECOVERY INDICATORS — six universal recovery dimensions.
 * These are prototype recovery indicators, NOT medical diagnoses.
 */
export type Dimension = "physical" | "cognitive" | "emotional" | "functional" | "social" | "engagement";

export const DIMENSIONS: { key: Dimension; label: string; short: string }[] = [
  { key: "physical", label: "Physical Recovery", short: "Physical" },
  { key: "cognitive", label: "Cognitive Recovery", short: "Cognitive" },
  { key: "emotional", label: "Emotional Wellness", short: "Emotional" },
  { key: "functional", label: "Functional Independence", short: "Functional" },
  { key: "social", label: "Social Connection", short: "Social" },
  { key: "engagement", label: "Engagement", short: "Engagement" },
];

export type DimensionValues = Record<Dimension, number>;

export function emptyDimensions(): DimensionValues {
  return { physical: 0, cognitive: 0, emotional: 0, functional: 0, social: 0, engagement: 0 };
}

/** Maps a module's own indicator key to the universal recovery dimensions it feeds. */
const INDICATOR_DIMENSIONS: Record<string, Dimension[]> = {
  memory: ["cognitive"],
  attention: ["cognitive", "engagement"],
  response: ["cognitive", "physical"],
  workingMemory: ["cognitive"],
  pattern: ["cognitive"],
  recognition: ["cognitive"],
  coordination: ["physical", "functional"],
  wellbeing: ["emotional", "social"],
  adherence: ["physical"],
  pacing: ["physical", "functional"],
  comfort: ["physical", "functional"],
  movementComfort: ["physical", "functional"],
  fatigue: ["physical", "emotional"],
  confidence: ["emotional", "engagement"],
  tolerance: ["physical"],
  effort: ["physical", "emotional"],
  difficulty: ["physical"],
  functional: ["functional"],
  dailyFunction: ["functional", "physical"],
  mobilityConfidence: ["emotional", "engagement"],
  energy: ["physical", "emotional"],
  concentration: ["cognitive"],
  mood: ["emotional", "social"],
  participation: ["social", "engagement"],
  sequence: ["cognitive", "functional"],
  stress: ["emotional"],
  sleep: ["physical", "emotional"],
  social: ["social", "engagement"],
  motivation: ["emotional", "engagement"],
  loneliness: ["social"],
  communication: ["social", "cognitive"],
  independence: ["functional"],
  balance: ["physical", "functional"],
  strength: ["physical"],
  discomfort: ["physical"],
  dailyActivity: ["functional", "physical"],
  dailyMovement: ["functional", "physical"],
  mobility: ["physical", "functional"],
  motor: ["physical"],
  engagement: ["engagement"],
};

export function dimensionsForIndicator(key: string): Dimension[] {
  return INDICATOR_DIMENSIONS[key] ?? ["engagement"];
}

export function overallScore(values: Partial<DimensionValues>): number {
  const present = DIMENSIONS.map((d) => values[d.key]).filter((v): v is number => typeof v === "number");
  if (!present.length) return 0;
  return Math.round(present.reduce((a, b) => a + b, 0) / present.length);
}
