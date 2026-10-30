import type { Dimension } from "./dimensions";

export type TaskSpec =
  | { type: "memory-recall"; items: string[]; distractors: string[]; showMs: number }
  | { type: "selective-attention"; targetLabel: string; seconds: number }
  | { type: "reaction"; rounds: number }
  | { type: "sequence"; start: number; palette?: string[] }
  | { type: "breathing"; cycles: number; pace: "normal" | "slow" | "varied" }
  | { type: "choice"; prompt: string; options: string[]; invert?: boolean }
  | { type: "slider"; prompt: string; lowLabel: string; highLabel: string; invert?: boolean }
  | { type: "mood"; prompt: string }
  | { type: "checkin"; prompt: string; fields: string[] }
  | { type: "drag-place"; rounds: number }
  | { type: "match-pairs"; pairs: number; symbols: string[] }
  | { type: "checklist"; prompt: string; items: string[] }
  | { type: "timed-taps"; prompt: string; seconds: number; rest?: boolean }
  | { type: "rating-cards"; prompt: string; items: string[] };

export type Indicator = { key: string; label: string; invert?: boolean };

export type ModuleAssessment = {
  id: string;
  title: string;
  instruction: string;
  indicator: Indicator;
  /** Universal VITAVERSE recovery dimensions this assessment feeds. */
  dimensions?: Dimension[];
  task: TaskSpec;
};

export type ModuleActivity = {
  id: string;
  title: string;
  category: string;
  minutes: number;
  instruction: string;
  indicatorKey: string;
  task: TaskSpec;
  isGame?: boolean;
};

export type ModuleDef = {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  purpose: string;
  welcome: string;
  indicators: Indicator[];
  assessments: ModuleAssessment[];
  activities: ModuleActivity[];
  accessible?: boolean;
};

const MOOD_TASK = (prompt: string): TaskSpec => ({ type: "mood", prompt });

/* ------------------------------------------------------------------ NEURO */

const neuro: ModuleDef = {
  id: "neuroverse",
  name: "NeuroVerse",
  prefix: "Neuro",
  suffix: "Verse",
  purpose: "Cognitive and neurological recovery support.",
  welcome: "Cognitive recovery, one focused step at a time.",
  indicators: [
    { key: "memory", label: "Memory" },
    { key: "attention", label: "Attention" },
    { key: "response", label: "Response Performance" },
    { key: "workingMemory", label: "Working Memory" },
    { key: "wellbeing", label: "Emotional Wellbeing" },
  ],
  assessments: [
    {
      id: "visual-memory",
      title: "Visual Memory",
      instruction: "Remember the objects.",
      indicator: { key: "memory", label: "Memory" },
      task: {
        type: "memory-recall",
        items: ["Apple", "Key", "Book", "Star", "Ball", "Leaf"],
        distractors: ["Cup", "Chair", "Cloud", "Shoe"],
        showMs: 8000,
      },
    },
    {
      id: "selective-attention",
      title: "Selective Attention",
      instruction: "Tap only the blue circles.",
      indicator: { key: "attention", label: "Attention" },
      task: { type: "selective-attention", targetLabel: "blue circles", seconds: 20 },
    },
    {
      id: "reaction-response",
      title: "Reaction Response",
      instruction: "Tap the moment the target appears.",
      indicator: { key: "response", label: "Response Performance" },
      task: { type: "reaction", rounds: 6 },
    },
    {
      id: "working-memory",
      title: "Working Memory",
      instruction: "Repeat the sequence.",
      indicator: { key: "workingMemory", label: "Working Memory" },
      task: { type: "sequence", start: 3 },
    },
    {
      id: "checkin",
      title: "Cognitive Check-In",
      instruction: "How are you today?",
      indicator: { key: "wellbeing", label: "Emotional Wellbeing" },
      task: { type: "checkin", prompt: "How are you feeling right now?", fields: ["Energy", "Motivation", "Focus"] },
    },
  ],
  activities: [
    {
      id: "memory-match",
      title: "Memory Match",
      category: "Games",
      minutes: 5,
      instruction: "Match the identical cards.",
      indicatorKey: "memory",
      isGame: true,
      task: { type: "match-pairs", pairs: 6, symbols: ["🍎", "🔑", "📘", "★", "🌿", "⚽"] },
    },
    {
      id: "focus-finder",
      title: "Focus Finder",
      category: "Games",
      minutes: 4,
      instruction: "Find the targets among distractors.",
      indicatorKey: "attention",
      isGame: true,
      task: { type: "selective-attention", targetLabel: "blue circles", seconds: 20 },
    },
    {
      id: "sequence-challenge",
      title: "Sequence Challenge",
      category: "Games",
      minutes: 5,
      instruction: "Reproduce the sequence.",
      indicatorKey: "workingMemory",
      isGame: true,
      task: { type: "sequence", start: 3 },
    },
    {
      id: "reaction-tap",
      title: "Reaction Tap",
      category: "Games",
      minutes: 3,
      instruction: "Tap targets as fast as you can.",
      indicatorKey: "response",
      isGame: true,
      task: { type: "reaction", rounds: 6 },
    },
    {
      id: "pattern-completion",
      title: "Pattern Completion",
      category: "Cognitive",
      minutes: 4,
      instruction: "Complete the pattern from memory.",
      indicatorKey: "memory",
      task: {
        type: "memory-recall",
        items: ["Star", "Leaf", "Key", "Ball"],
        distractors: ["Cup", "Book", "Cloud"],
        showMs: 6000,
      },
    },
    {
      id: "calm-mind",
      title: "Calm Mind",
      category: "Mental Wellness",
      minutes: 5,
      instruction: "Follow the circle and settle.",
      indicatorKey: "wellbeing",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "focus-flow",
      title: "Focus Flow",
      category: "Cognitive",
      minutes: 4,
      instruction: "Hold a steady tapping rhythm.",
      indicatorKey: "attention",
      task: { type: "timed-taps", prompt: "Tap in time with the pulse.", seconds: 20 },
    },
  ],
};

/* ------------------------------------------------------------------ PULMO */

const pulmo: ModuleDef = {
  id: "pulmoverse",
  name: "PulmoVerse",
  prefix: "Pulmo",
  suffix: "Verse",
  purpose: "Respiratory recovery support.",
  welcome: "Your breathing recovery journey begins here.",
  indicators: [
    { key: "adherence", label: "Breathing Adherence" },
    { key: "pacing", label: "Breathing Pacing" },
    { key: "comfort", label: "Activity Comfort" },
    { key: "fatigue", label: "Fatigue", invert: true },
    { key: "confidence", label: "Recovery Confidence" },
  ],
  assessments: [
    {
      id: "guided-breathing",
      title: "Guided Breathing",
      instruction: "Follow the circle.",
      indicator: { key: "adherence", label: "Breathing Adherence" },
      task: { type: "breathing", cycles: 5, pace: "normal" },
    },
    {
      id: "breathing-pacing",
      title: "Breathing Pacing",
      instruction: "Match the changing rhythm.",
      indicator: { key: "pacing", label: "Breathing Pacing" },
      task: { type: "breathing", cycles: 4, pace: "varied" },
    },
    {
      id: "activity-comfort",
      title: "Activity Comfort",
      instruction: "Choose the closest match.",
      indicator: { key: "comfort", label: "Activity Comfort" },
      task: {
        type: "choice",
        prompt: "How comfortable does activity feel right now?",
        options: ["Very difficult", "Difficult", "Moderate", "Comfortable", "Very comfortable"],
      },
    },
    {
      id: "fatigue",
      title: "Fatigue",
      instruction: "Move the slider.",
      indicator: { key: "fatigue", label: "Fatigue", invert: true },
      task: { type: "slider", prompt: "How tired do you feel right now?", lowLabel: "No fatigue", highLabel: "Very tired", invert: true },
    },
    {
      id: "recovery-confidence",
      title: "Recovery Confidence",
      instruction: "Move the slider.",
      indicator: { key: "confidence", label: "Recovery Confidence" },
      task: {
        type: "slider",
        prompt: "How confident do you feel about completing today's recovery activities?",
        lowLabel: "Not confident",
        highLabel: "Very confident",
      },
    },
  ],
  activities: [
    {
      id: "guided-breathing",
      title: "Guided Breathing",
      category: "Breathing",
      minutes: 5,
      instruction: "Follow the circle.",
      indicatorKey: "adherence",
      task: { type: "breathing", cycles: 4, pace: "normal" },
    },
    {
      id: "breathing-rhythm",
      title: "Breathing Rhythm",
      category: "Games",
      minutes: 5,
      instruction: "Follow the changing rhythm.",
      indicatorKey: "pacing",
      isGame: true,
      task: { type: "breathing", cycles: 4, pace: "varied" },
    },
    {
      id: "calm-cloud",
      title: "Calm Cloud",
      category: "Games",
      minutes: 4,
      instruction: "Expand the cloud with each breath.",
      indicatorKey: "comfort",
      isGame: true,
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "calm-breathing",
      title: "Calm Breathing",
      category: "Breathing",
      minutes: 5,
      instruction: "A slower, gentler pace.",
      indicatorKey: "adherence",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "relaxation-journey",
      title: "Relaxation Journey",
      category: "Mental Wellness",
      minutes: 5,
      instruction: "Settle in and let the light expand.",
      indicatorKey: "confidence",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "energy-check",
      title: "Energy Check",
      category: "Functional",
      minutes: 2,
      instruction: "Rate your energy right now.",
      indicatorKey: "fatigue",
      task: { type: "slider", prompt: "How tired do you feel right now?", lowLabel: "No fatigue", highLabel: "Very tired", invert: true },
    },
    {
      id: "recovery-goal",
      title: "Recovery Goal",
      category: "Functional",
      minutes: 3,
      instruction: "Confirm what you can manage today.",
      indicatorKey: "confidence",
      task: {
        type: "checklist",
        prompt: "Which goals can you complete today?",
        items: ["Breathing session", "Short walk", "Sitting up", "Light daily task"],
      },
    },
  ],
};

/* ----------------------------------------------------------------- CARDIO */

const cardio: ModuleDef = {
  id: "cardioverse",
  name: "CardioVerse",
  prefix: "Cardio",
  suffix: "Verse",
  purpose: "Functional cardiovascular recovery support.",
  welcome: "Building steady, well-paced activity tolerance.",
  indicators: [
    { key: "tolerance", label: "Activity Tolerance" },
    { key: "effort", label: "Perceived Effort", invert: true },
    { key: "fatigue", label: "Fatigue", invert: true },
    { key: "pacing", label: "Pacing Performance" },
    { key: "confidence", label: "Functional Confidence" },
  ],
  assessments: [
    {
      id: "activity-tolerance",
      title: "Activity Tolerance",
      instruction: "Keep a steady tapping pace.",
      indicator: { key: "tolerance", label: "Activity Tolerance" },
      task: { type: "timed-taps", prompt: "Tap in time with the pulse.", seconds: 25 },
    },
    {
      id: "perceived-effort",
      title: "Perceived Effort",
      instruction: "Move the slider.",
      indicator: { key: "effort", label: "Perceived Effort", invert: true },
      task: {
        type: "slider",
        prompt: "How much effort did that activity require?",
        lowLabel: "Very easy",
        highLabel: "Very difficult",
        invert: true,
      },
    },
    {
      id: "fatigue",
      title: "Fatigue",
      instruction: "Move the slider.",
      indicator: { key: "fatigue", label: "Fatigue", invert: true },
      task: { type: "slider", prompt: "How tired do you feel after the activity?", lowLabel: "No fatigue", highLabel: "Very tired", invert: true },
    },
    {
      id: "activity-rest-pacing",
      title: "Activity & Rest Pacing",
      instruction: "Activity, rest, then resume.",
      indicator: { key: "pacing", label: "Pacing Performance" },
      task: { type: "timed-taps", prompt: "Tap in time — you will pause for rest halfway.", seconds: 15, rest: true },
    },
    {
      id: "functional-confidence",
      title: "Functional Confidence",
      instruction: "Rate your confidence for each.",
      indicator: { key: "confidence", label: "Functional Confidence" },
      task: {
        type: "rating-cards",
        prompt: "How confident are you with these today?",
        items: ["Sitting up", "Eating", "Moving around", "Personal activities", "Light daily tasks"],
      },
    },
  ],
  activities: [
    {
      id: "pacing-rhythm",
      title: "Pacing Rhythm",
      category: "Games",
      minutes: 4,
      instruction: "Interact with the steady rhythm.",
      indicatorKey: "pacing",
      isGame: true,
      task: { type: "timed-taps", prompt: "Tap in time with the pulse.", seconds: 20 },
    },
    {
      id: "energy-balance",
      title: "Energy Balance",
      category: "Games",
      minutes: 4,
      instruction: "Build your activity and rest balance.",
      indicatorKey: "tolerance",
      isGame: true,
      task: {
        type: "checklist",
        prompt: "Select today's balanced activity plan.",
        items: ["Morning walk", "Midday rest", "Seated exercise", "Evening rest", "Light chores"],
      },
    },
    {
      id: "pacing-challenge",
      title: "Pacing Challenge",
      category: "Functional",
      minutes: 5,
      instruction: "Activity, rest, resume.",
      indicatorKey: "pacing",
      task: { type: "timed-taps", prompt: "Tap in time — rest halfway.", seconds: 15, rest: true },
    },
    {
      id: "activity-planner",
      title: "Activity Planner",
      category: "Functional",
      minutes: 3,
      instruction: "Plan what you'll attempt today.",
      indicatorKey: "confidence",
      task: {
        type: "checklist",
        prompt: "Which activities will you attempt today?",
        items: ["Sitting up", "Short walk", "Stretching", "Personal care"],
      },
    },
    {
      id: "recovery-rhythm",
      title: "Recovery Rhythm",
      category: "Breathing",
      minutes: 5,
      instruction: "Slow, paced breathing.",
      indicatorKey: "fatigue",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "goal-builder",
      title: "Goal Builder",
      category: "Functional",
      minutes: 3,
      instruction: "Rate your confidence for each goal.",
      indicatorKey: "confidence",
      task: { type: "rating-cards", prompt: "Confidence for today's goals", items: ["Walking", "Standing", "Daily tasks"] },
    },
    {
      id: "daily-progress",
      title: "Daily Progress",
      category: "Functional",
      minutes: 2,
      instruction: "Log how the day felt.",
      indicatorKey: "effort",
      task: { type: "slider", prompt: "How much effort did today require?", lowLabel: "Very easy", highLabel: "Very difficult", invert: true },
    },
  ],
};

/* ------------------------------------------------------------------ ORTHO */

const ortho: ModuleDef = {
  id: "orthoverse",
  name: "OrthoVerse",
  prefix: "Ortho",
  suffix: "Verse",
  purpose: "Functional movement and mobility recovery support.",
  welcome: "Restoring confident, comfortable movement.",
  indicators: [
    { key: "movementComfort", label: "Movement Comfort" },
    { key: "functional", label: "Functional Performance" },
    { key: "difficulty", label: "Activity Difficulty", invert: true },
    { key: "mobilityConfidence", label: "Mobility Confidence" },
    { key: "dailyFunction", label: "Daily Function" },
  ],
  assessments: [
    {
      id: "movement-comfort",
      title: "Movement Comfort",
      instruction: "Choose the closest match.",
      indicator: { key: "movementComfort", label: "Movement Comfort" },
      task: {
        type: "choice",
        prompt: "How comfortable is this activity?",
        options: ["Very difficult", "Difficult", "Moderate", "Comfortable", "Very comfortable"],
      },
    },
    {
      id: "reach-and-place",
      title: "Reach & Place",
      instruction: "Drag the object to the target.",
      indicator: { key: "functional", label: "Functional Performance" },
      task: { type: "drag-place", rounds: 4 },
    },
    {
      id: "activity-difficulty",
      title: "Activity Difficulty",
      instruction: "Move the slider.",
      indicator: { key: "difficulty", label: "Activity Difficulty", invert: true },
      task: { type: "slider", prompt: "How difficult was the activity?", lowLabel: "Very easy", highLabel: "Very difficult", invert: true },
    },
    {
      id: "mobility-confidence",
      title: "Mobility Confidence",
      instruction: "Move the slider.",
      indicator: { key: "mobilityConfidence", label: "Mobility Confidence" },
      task: {
        type: "slider",
        prompt: "How confident do you feel performing your current movement activities?",
        lowLabel: "Low",
        highLabel: "High",
      },
    },
    {
      id: "daily-function",
      title: "Daily Function",
      instruction: "Rate each daily activity.",
      indicator: { key: "dailyFunction", label: "Daily Function" },
      task: {
        type: "rating-cards",
        prompt: "How independent are you with these?",
        items: ["Eating", "Writing", "Using phone", "Sitting", "Moving", "Personal activities"],
      },
    },
  ],
  activities: [
    {
      id: "object-placement",
      title: "Object Placement",
      category: "Games",
      minutes: 4,
      instruction: "Drag objects to target areas.",
      indicatorKey: "functional",
      isGame: true,
      task: { type: "drag-place", rounds: 4 },
    },
    {
      id: "movement-sequence",
      title: "Movement Sequence",
      category: "Games",
      minutes: 4,
      instruction: "Follow the sequence of actions.",
      indicatorKey: "functional",
      isGame: true,
      task: { type: "sequence", start: 3 },
    },
    {
      id: "functional-reach",
      title: "Functional Reach",
      category: "Functional",
      minutes: 5,
      instruction: "Reach and place, then return.",
      indicatorKey: "functional",
      task: { type: "drag-place", rounds: 3 },
    },
    {
      id: "daily-routine-builder",
      title: "Daily Routine Builder",
      category: "Functional",
      minutes: 3,
      instruction: "Build today's routine.",
      indicatorKey: "dailyFunction",
      task: {
        type: "checklist",
        prompt: "Which daily activities will you complete?",
        items: ["Eating", "Washing", "Walking", "Dressing", "Seated exercise"],
      },
    },
    {
      id: "mobility-goal",
      title: "Mobility Goal",
      category: "Functional",
      minutes: 3,
      instruction: "Set your movement confidence goal.",
      indicatorKey: "mobilityConfidence",
      task: { type: "slider", prompt: "How confident do you feel moving today?", lowLabel: "Low", highLabel: "High" },
    },
    {
      id: "functional-challenge",
      title: "Functional Challenge",
      category: "Functional",
      minutes: 5,
      instruction: "A longer reach and place challenge.",
      indicatorKey: "functional",
      task: { type: "drag-place", rounds: 5 },
    },
    {
      id: "movement-comfort-check",
      title: "Comfort Check",
      category: "Mental Wellness",
      minutes: 2,
      instruction: "Rate today's movement comfort.",
      indicatorKey: "movementComfort",
      task: {
        type: "choice",
        prompt: "How comfortable is movement today?",
        options: ["Very difficult", "Difficult", "Moderate", "Comfortable", "Very comfortable"],
      },
    },
  ],
};

/* ------------------------------------------------------------------- ONCO */

const onco: ModuleDef = {
  id: "oncoverse",
  name: "OncoVerse",
  prefix: "Onco",
  suffix: "Verse",
  purpose: "Recovery participation, energy, concentration and emotional wellbeing.",
  welcome: "Gentle participation, at your own pace.",
  indicators: [
    { key: "energy", label: "Energy" },
    { key: "fatigue", label: "Fatigue Burden", invert: true },
    { key: "concentration", label: "Concentration" },
    { key: "mood", label: "Emotional Wellbeing" },
    { key: "participation", label: "Participation" },
  ],
  assessments: [
    {
      id: "energy",
      title: "Energy Level",
      instruction: "Move the meter.",
      indicator: { key: "energy", label: "Energy" },
      task: { type: "slider", prompt: "How is your energy right now?", lowLabel: "Low", highLabel: "High" },
    },
    {
      id: "fatigue",
      title: "Fatigue",
      instruction: "Move the meter.",
      indicator: { key: "fatigue", label: "Fatigue Burden", invert: true },
      task: { type: "slider", prompt: "How much fatigue are you carrying?", lowLabel: "Low", highLabel: "High", invert: true },
    },
    {
      id: "concentration",
      title: "Concentration",
      instruction: "Match the pairs.",
      indicator: { key: "concentration", label: "Concentration" },
      task: { type: "match-pairs", pairs: 5, symbols: ["🌸", "🍋", "🌿", "☀️", "🐚"] },
    },
    {
      id: "mood",
      title: "Mood",
      instruction: "Choose how you feel.",
      indicator: { key: "mood", label: "Emotional Wellbeing" },
      task: MOOD_TASK("How are you feeling right now?"),
    },
    {
      id: "participation",
      title: "Participation",
      instruction: "Choose the closest match.",
      indicator: { key: "participation", label: "Participation" },
      task: {
        type: "choice",
        prompt: "How much were you able to participate in today's activities?",
        options: ["Not participating", "Low", "Moderate", "High"],
      },
    },
  ],
  activities: [
    {
      id: "focus-garden",
      title: "Focus Garden",
      category: "Games",
      minutes: 4,
      instruction: "Find the matching objects.",
      indicatorKey: "concentration",
      isGame: true,
      task: { type: "match-pairs", pairs: 5, symbols: ["🌸", "🍋", "🌿", "☀️", "🐚"] },
    },
    {
      id: "memory-match",
      title: "Memory Match",
      category: "Games",
      minutes: 5,
      instruction: "Progressive visual memory.",
      indicatorKey: "concentration",
      isGame: true,
      task: { type: "match-pairs", pairs: 6, symbols: ["🍎", "🔑", "📘", "★", "🌿", "⚽"] },
    },
    {
      id: "relaxation-journey",
      title: "Relaxation Journey",
      category: "Mental Wellness",
      minutes: 5,
      instruction: "Slow guided breathing.",
      indicatorKey: "mood",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "energy-planner",
      title: "Energy Planner",
      category: "Functional",
      minutes: 3,
      instruction: "Plan around your energy.",
      indicatorKey: "energy",
      task: {
        type: "checklist",
        prompt: "What feels possible today?",
        items: ["Short walk", "Reading", "Visiting", "Seated exercise", "Rest block"],
      },
    },
    {
      id: "mood-check",
      title: "Mood Check",
      category: "Mental Wellness",
      minutes: 2,
      instruction: "Choose how you feel.",
      indicatorKey: "mood",
      task: MOOD_TASK("How are you feeling right now?"),
    },
    {
      id: "daily-goal",
      title: "Daily Goal",
      category: "Functional",
      minutes: 2,
      instruction: "Confirm today's goal.",
      indicatorKey: "participation",
      task: {
        type: "choice",
        prompt: "How much will you participate today?",
        options: ["Not participating", "Low", "Moderate", "High"],
      },
    },
    {
      id: "calm-breathing",
      title: "Calm Breathing",
      category: "Breathing",
      minutes: 5,
      instruction: "Follow the circle.",
      indicatorKey: "fatigue",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
  ],
};

/* ------------------------------------------------------------------- GERI */

const geri: ModuleDef = {
  id: "geriverse",
  name: "GeriVerse",
  prefix: "Geri",
  suffix: "Verse",
  purpose: "Accessible cognitive and functional recovery support.",
  welcome: "Simple, comfortable steps each day.",
  accessible: true,
  indicators: [
    { key: "memory", label: "Memory" },
    { key: "sequence", label: "Sequence" },
    { key: "attention", label: "Attention" },
    { key: "participation", label: "Functional Participation" },
    { key: "wellbeing", label: "Energy & Wellbeing" },
  ],
  assessments: [
    {
      id: "object-memory",
      title: "Object Memory",
      instruction: "Remember these objects.",
      indicator: { key: "memory", label: "Memory" },
      task: {
        type: "memory-recall",
        items: ["Apple", "Key", "Book", "Cup", "Flower"],
        distractors: ["Chair", "Shoe", "Clock"],
        showMs: 10000,
      },
    },
    {
      id: "simple-sequence",
      title: "Simple Sequence",
      instruction: "Repeat the colours.",
      indicator: { key: "sequence", label: "Sequence" },
      task: { type: "sequence", start: 2, palette: ["Red", "Blue", "Green", "Yellow"] },
    },
    {
      id: "attention",
      title: "Attention",
      instruction: "Tap only the blue circles.",
      indicator: { key: "attention", label: "Attention" },
      task: { type: "selective-attention", targetLabel: "blue circles", seconds: 25 },
    },
    {
      id: "daily-participation",
      title: "Daily Participation",
      instruction: "Rate each daily activity.",
      indicator: { key: "participation", label: "Functional Participation" },
      task: {
        type: "rating-cards",
        prompt: "How are you managing these?",
        items: ["Eating", "Walking", "Washing", "Talking with family"],
      },
    },
    {
      id: "wellbeing",
      title: "Energy & Mood",
      instruction: "How are you today?",
      indicator: { key: "wellbeing", label: "Energy & Wellbeing" },
      task: { type: "checkin", prompt: "How are you feeling today?", fields: ["Energy", "Comfort"] },
    },
  ],
  activities: [
    {
      id: "object-match",
      title: "Object Match",
      category: "Games",
      minutes: 5,
      instruction: "Match the objects.",
      indicatorKey: "memory",
      isGame: true,
      task: { type: "match-pairs", pairs: 4, symbols: ["🍎", "🔑", "📘", "🌸"] },
    },
    {
      id: "colour-sequence",
      title: "Colour Sequence",
      category: "Games",
      minutes: 4,
      instruction: "Repeat the colours.",
      indicatorKey: "sequence",
      isGame: true,
      task: { type: "sequence", start: 2, palette: ["Red", "Blue", "Green", "Yellow"] },
    },
    {
      id: "gentle-attention",
      title: "Gentle Attention",
      category: "Cognitive",
      minutes: 4,
      instruction: "Tap only the blue circles.",
      indicatorKey: "attention",
      task: { type: "selective-attention", targetLabel: "blue circles", seconds: 25 },
    },
    {
      id: "daily-routine",
      title: "Daily Routine",
      category: "Functional",
      minutes: 3,
      instruction: "Confirm today's routine.",
      indicatorKey: "participation",
      task: {
        type: "checklist",
        prompt: "What will you do today?",
        items: ["Eat well", "Short walk", "Talk with family", "Rest"],
      },
    },
    {
      id: "calm-breathing",
      title: "Calm Breathing",
      category: "Breathing",
      minutes: 5,
      instruction: "Follow the circle slowly.",
      indicatorKey: "wellbeing",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "memory-recall",
      title: "Memory Recall",
      category: "Cognitive",
      minutes: 4,
      instruction: "Remember the objects.",
      indicatorKey: "memory",
      task: {
        type: "memory-recall",
        items: ["Cup", "Flower", "Key", "Book"],
        distractors: ["Shoe", "Clock", "Apple"],
        showMs: 10000,
      },
    },
    {
      id: "mood-check",
      title: "Mood Check",
      category: "Mental Wellness",
      minutes: 2,
      instruction: "Choose how you feel.",
      indicatorKey: "wellbeing",
      task: MOOD_TASK("How are you feeling today?"),
    },
  ],
};

/* ------------------------------------------------------------------ PEDIA */

const pedia: ModuleDef = {
  id: "pediaverse",
  name: "PediaVerse",
  prefix: "Pedia",
  suffix: "Verse",
  purpose: "Playful recovery engagement for younger patients.",
  welcome: "Let's play our way through recovery.",
  indicators: [
    { key: "memory", label: "Memory" },
    { key: "response", label: "Response Performance" },
    { key: "sequence", label: "Sequence" },
    { key: "mood", label: "Emotional Wellbeing" },
    { key: "participation", label: "Participation" },
  ],
  assessments: [
    {
      id: "picture-memory",
      title: "Picture Memory",
      instruction: "Remember the pictures.",
      indicator: { key: "memory", label: "Memory" },
      task: {
        type: "memory-recall",
        items: ["Star", "Ball", "Kite", "Bear"],
        distractors: ["Boat", "Drum", "Cloud"],
        showMs: 8000,
      },
    },
    {
      id: "quick-tap",
      title: "Quick Tap",
      instruction: "Tap when the star appears.",
      indicator: { key: "response", label: "Response Performance" },
      task: { type: "reaction", rounds: 5 },
    },
    {
      id: "copy-sequence",
      title: "Copy the Sequence",
      instruction: "Repeat what you see.",
      indicator: { key: "sequence", label: "Sequence" },
      task: { type: "sequence", start: 2, palette: ["Red", "Blue", "Green", "Yellow"] },
    },
    {
      id: "mood",
      title: "How Do You Feel?",
      instruction: "Pick a face.",
      indicator: { key: "mood", label: "Emotional Wellbeing" },
      task: MOOD_TASK("How do you feel today?"),
    },
    {
      id: "participation",
      title: "Playtime",
      instruction: "Choose the closest match.",
      indicator: { key: "participation", label: "Participation" },
      task: {
        type: "choice",
        prompt: "How much did you join in today?",
        options: ["Not at all", "A little", "Quite a lot", "Lots"],
      },
    },
  ],
  activities: [
    {
      id: "star-match",
      title: "Star Match",
      category: "Games",
      minutes: 4,
      instruction: "Match the pairs.",
      indicatorKey: "memory",
      isGame: true,
      task: { type: "match-pairs", pairs: 5, symbols: ["⭐", "🎈", "🐻", "🚀", "🐬"] },
    },
    {
      id: "quick-tap-game",
      title: "Quick Tap",
      category: "Games",
      minutes: 3,
      instruction: "Tap the star fast!",
      indicatorKey: "response",
      isGame: true,
      task: { type: "reaction", rounds: 5 },
    },
    {
      id: "sequence-play",
      title: "Sequence Play",
      category: "Games",
      minutes: 4,
      instruction: "Repeat the colours.",
      indicatorKey: "sequence",
      isGame: true,
      task: { type: "sequence", start: 2, palette: ["Red", "Blue", "Green", "Yellow"] },
    },
    {
      id: "bubble-breathing",
      title: "Bubble Breathing",
      category: "Breathing",
      minutes: 4,
      instruction: "Grow the bubble with your breath.",
      indicatorKey: "mood",
      task: { type: "breathing", cycles: 3, pace: "slow" },
    },
    {
      id: "feelings-check",
      title: "Feelings Check",
      category: "Mental Wellness",
      minutes: 2,
      instruction: "Pick a face.",
      indicatorKey: "mood",
      task: MOOD_TASK("How do you feel right now?"),
    },
    {
      id: "helper-tasks",
      title: "Helper Tasks",
      category: "Functional",
      minutes: 3,
      instruction: "Choose today's helper tasks.",
      indicatorKey: "participation",
      task: {
        type: "checklist",
        prompt: "What will you do today?",
        items: ["Drink water", "Sit up", "Play a game", "Talk with family"],
      },
    },
    {
      id: "focus-fun",
      title: "Focus Fun",
      category: "Cognitive",
      minutes: 4,
      instruction: "Tap only the blue circles.",
      indicatorKey: "response",
      task: { type: "selective-attention", targetLabel: "blue circles", seconds: 20 },
    },
  ],
};

export const MODULES: ModuleDef[] = [neuro, pulmo, cardio, ortho, onco, geri, pedia];

export function getModule(id: string | null | undefined): ModuleDef {
  return MODULES.find((m) => m.id === id) ?? pulmo;
}

export function moduleCategories(m: ModuleDef): string[] {
  return [...new Set(m.activities.map((a) => a.category))];
}

export function findModuleActivity(m: ModuleDef, id: string) {
  return m.activities.find((a) => a.id === id);
}
