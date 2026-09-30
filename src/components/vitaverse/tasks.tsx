import { useEffect, useMemo, useRef, useState } from "react";
import type { TaskSpec } from "@/lib/modules";
import { clamp } from "@/lib/vitaverse-store";

export type TaskResult = { score: number; data: Record<string, number | string> };

type TaskProps = { spec: TaskSpec; accessible?: boolean | undefined; onResult: (r: TaskResult) => void };

export function TaskRunner({ spec, accessible, onResult }: TaskProps) {
  switch (spec.type) {
    case "memory-recall":
      return <MemoryRecall spec={spec} accessible={accessible} onResult={onResult} />;
    case "selective-attention":
      return <SelectiveAttention spec={spec} accessible={accessible} onResult={onResult} />;
    case "reaction":
      return <ReactionTask spec={spec} accessible={accessible} onResult={onResult} />;
    case "sequence":
      return <SequenceTask spec={spec} accessible={accessible} onResult={onResult} />;
    case "breathing":
      return <BreathingTask spec={spec} onResult={onResult} />;
    case "choice":
      return <ChoiceTask spec={spec} accessible={accessible} onResult={onResult} />;
    case "slider":
      return <SliderTask spec={spec} onResult={onResult} />;
    case "mood":
      return <MoodTask spec={spec} onResult={onResult} />;
    case "checkin":
      return <CheckinTask spec={spec} onResult={onResult} />;
    case "drag-place":
      return <DragPlaceTask spec={spec} onResult={onResult} />;
    case "match-pairs":
      return <MatchPairsTask spec={spec} accessible={accessible} onResult={onResult} />;
    case "checklist":
      return <ChecklistTask spec={spec} accessible={accessible} onResult={onResult} />;
    case "timed-taps":
      return <TimedTapsTask spec={spec} onResult={onResult} />;
    case "rating-cards":
      return <RatingCardsTask spec={spec} onResult={onResult} />;
    default:
      return null;
  }
}

/* --------------------------------------------------------------- helpers */

function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-light text-muted-foreground">{children}</p>;
}

function Stat({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">{children}</p>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const tileBase =
  "rounded-2xl border px-5 py-4 text-sm uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98]";

/* ---------------------------------------------------------- memory recall */

function MemoryRecall({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "memory-recall" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const [phase, setPhase] = useState<"study" | "recall" | "done">("study");
  const [left, setLeft] = useState(Math.round(spec.showMs / 1000));
  const [picked, setPicked] = useState<string[]>([]);
  const start = useRef(0);
  const options = useMemo(() => shuffle([...spec.items, ...spec.distractors]), [spec]);

  useEffect(() => {
    if (phase !== "study") return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          start.current = Date.now();
          setPhase("recall");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const submit = () => {
    const correct = picked.filter((p) => spec.items.includes(p)).length;
    const incorrect = picked.length - correct;
    const accuracy = clamp(((correct - incorrect * 0.6) / spec.items.length) * 100, 0, 100);
    const seconds = Math.round((Date.now() - start.current) / 1000);
    setPhase("done");
    onResult({
      score: accuracy,
      data: {
        correct,
        incorrect,
        missed: spec.items.length - correct,
        accuracy: Math.round(accuracy),
        completionSeconds: seconds,
      },
    });
  };

  if (phase === "study") {
    return (
      <div className="mt-8 w-full">
        <Prompt>Remember these — {left}s</Prompt>
        <div className={`mt-8 grid gap-3 ${accessible ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
          {spec.items.map((item) => (
            <div
              key={item}
              className={`${tileBase} border-rose/40 bg-card text-foreground ${accessible ? "py-7 text-base" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <Prompt>{phase === "done" ? "Answers recorded." : "Tap the objects you saw."}</Prompt>
      <div className={`mt-8 grid gap-3 ${accessible ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {options.map((item) => {
          const active = picked.includes(item);
          return (
            <button
              key={item}
              disabled={phase === "done"}
              onClick={() => setPicked((p) => (p.includes(item) ? p.filter((x) => x !== item) : [...p, item]))}
              className={`${tileBase} ${accessible ? "py-7 text-base" : ""} ${
                active
                  ? "border-rose bg-card text-foreground"
                  : "border-border bg-card/50 text-muted-foreground hover:border-rose/50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      {phase === "recall" ? (
        <button
          onClick={submit}
          disabled={!picked.length}
          className="mt-8 rounded-full border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          Submit Answers
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------- selective attention */

type Blob = { id: number; x: number; y: number; target: boolean; shape: string; hue: string; delay: number };

function SelectiveAttention({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "selective-attention" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(spec.seconds);
  const [tapped, setTapped] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const last = useRef(0);
  const blobs = useMemo<Blob[]>(() => {
    const shapes = ["circle", "triangle", "square", "star"];
    return Array.from({ length: accessible ? 12 : 16 }, (_, i) => {
      const target = i % 3 === 0;
      return {
        id: i,
        x: 6 + Math.random() * 80,
        y: 6 + Math.random() * 78,
        target,
        shape: target ? "circle" : shapes[i % shapes.length]!,
        hue: target ? "var(--teal)" : i % 2 ? "var(--rose)" : "var(--gold)",
        delay: Math.random() * 2,
      };
    });
  }, [accessible]);
  const totalTargets = blobs.filter((b) => b.target).length;

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left]);

  const finish = () => {
    setRunning(false);
    const missed = totalTargets - correct;
    const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 1500;
    const accuracy = clamp(((correct - incorrect * 0.5) / totalTargets) * 100, 0, 100);
    const speed = clamp(100 - (avg - 400) / 18, 0, 100);
    onResult({
      score: clamp(accuracy * 0.75 + speed * 0.25, 0, 100),
      data: {
        correctTaps: correct,
        incorrectTaps: incorrect,
        missedTargets: missed,
        averageReactionMs: Math.round(avg),
        accuracy: Math.round(accuracy),
      },
    });
  };

  const tap = (b: Blob) => {
    if (!running || tapped.includes(b.id)) return;
    setTapped((t) => [...t, b.id]);
    const now = Date.now();
    setTimes((t) => [...t, now - (last.current || now - 900)]);
    last.current = now;
    if (b.target) setCorrect((c) => c + 1);
    else setIncorrect((c) => c + 1);
  };

  useEffect(() => {
    if (running && correct >= totalTargets) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct, running]);

  return (
    <div className="mt-8 w-full">
      <Prompt>Tap only the {spec.targetLabel}.</Prompt>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-3xl border border-border bg-card/50">
        {blobs.map((b) => {
          const gone = tapped.includes(b.id);
          const size = accessible ? 46 : 34;
          return (
            <button
              key={b.id}
              onClick={() => tap(b)}
              aria-label={b.target ? "blue circle" : b.shape}
              className="absolute transition-opacity duration-300"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: size,
                height: size,
                opacity: gone ? 0.15 : running ? 1 : 0.4,
                animation: running ? `vv-drift ${5 + b.delay}s ease-in-out ${b.delay}s infinite` : undefined,
              }}
            >
              <span
                className="block h-full w-full"
                style={{
                  background: b.hue,
                  borderRadius: b.shape === "circle" ? "999px" : b.shape === "square" ? "6px" : "2px",
                  clipPath:
                    b.shape === "triangle"
                      ? "polygon(50% 0%, 100% 100%, 0% 100%)"
                      : b.shape === "star"
                        ? "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)"
                        : undefined,
                }}
              />
            </button>
          );
        })}
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            className="absolute inset-0 flex items-center justify-center bg-background/50 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur-sm"
          >
            Start
          </button>
        ) : null}
      </div>
      <Stat>
        {running ? `${left}s left · ` : ""}
        Found {correct} / {totalTargets}
      </Stat>
    </div>
  );
}

/* --------------------------------------------------------------- reaction */

function ReactionTask({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "reaction" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const [round, setRound] = useState(0);
  const [state, setState] = useState<"idle" | "wait" | "go" | "done">("idle");
  const [times, setTimes] = useState<number[]>([]);
  const shown = useRef(0);

  useEffect(() => {
    if (state !== "wait") return;
    const t = setTimeout(
      () => {
        shown.current = Date.now();
        setState("go");
      },
      900 + Math.random() * 2200,
    );
    return () => clearTimeout(t);
  }, [state, round]);

  const tap = () => {
    if (state === "idle") {
      setState("wait");
      return;
    }
    if (state !== "go") return;
    const ms = Date.now() - shown.current;
    const next = [...times, ms];
    setTimes(next);
    if (round + 1 >= spec.rounds) {
      setState("done");
      const avg = next.reduce((a, b) => a + b, 0) / next.length;
      const spread = Math.max(...next) - Math.min(...next);
      const speed = clamp(100 - (avg - 220) / 6, 0, 100);
      const consistency = clamp(100 - spread / 10, 0, 100);
      onResult({
        score: clamp(speed * 0.7 + consistency * 0.3, 0, 100),
        data: {
          rounds: next.length,
          averageReactionMs: Math.round(avg),
          fastestMs: Math.min(...next),
          slowestMs: Math.max(...next),
          consistency: Math.round(consistency),
        },
      });
    } else {
      setRound((r) => r + 1);
      setState("wait");
    }
  };

  const label = state === "idle" ? "Start" : state === "wait" ? "Wait…" : state === "go" ? "Tap!" : "Done";

  return (
    <div className="mt-8 flex flex-col items-center">
      <Prompt>Tap the moment the target appears.</Prompt>
      <button
        onClick={tap}
        disabled={state === "done"}
        className={`vv-display mt-10 flex items-center justify-center rounded-full border text-2xl uppercase tracking-[0.24em] transition-all duration-300 active:scale-[0.97] ${
          accessible ? "h-72 w-72" : "h-60 w-60"
        }`}
        style={{
          borderColor: state === "go" ? "var(--teal)" : "color-mix(in oklab, var(--rose) 45%, transparent)",
          background:
            state === "go"
              ? "radial-gradient(circle, color-mix(in oklab, var(--teal) 28%, transparent), transparent 70%)"
              : "transparent",
        }}
      >
        {label}
      </button>
      <Stat>
        Round {Math.min(round + (state === "done" ? 1 : 0) + (state === "idle" ? 0 : 1), spec.rounds)} / {spec.rounds}
        {times.length ? ` · last ${times[times.length - 1]}ms` : ""}
      </Stat>
    </div>
  );
}

/* --------------------------------------------------------------- sequence */

function SequenceTask({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "sequence" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const palette = spec.palette;
  const pool = palette ?? ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const [len, setLen] = useState(spec.start);
  const [sequence, setSequence] = useState<string[]>([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [input, setInput] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "done">("idle");
  const [attempts, setAttempts] = useState(0);
  const [correctRuns, setCorrectRuns] = useState(0);
  const [longest, setLongest] = useState(0);
  const misses = useRef(0);

  const startRound = (length: number) => {
    const seq = Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]!);
    setSequence(seq);
    setInput([]);
    setPhase("show");
    setShowIndex(0);
  };

  useEffect(() => {
    if (phase !== "show") return;
    if (showIndex >= sequence.length) {
      const t = setTimeout(() => setPhase("input"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowIndex((i) => i + 1), 850);
    return () => clearTimeout(t);
  }, [phase, showIndex, sequence.length]);

  const finish = (finalLongest: number, finalAttempts: number, runs: number) => {
    setPhase("done");
    const reached = finalLongest;
    const score = clamp(((reached - spec.start + 1) / 5) * 100, 5, 100);
    onResult({
      score,
      data: {
        longestSequence: reached,
        correctSequences: runs,
        attempts: finalAttempts,
        difficultyReached: reached,
      },
    });
  };

  const press = (value: string) => {
    if (phase !== "input") return;
    const next = [...input, value];
    setInput(next);
    const idx = next.length - 1;
    if (sequence[idx] !== value) {
      const a = attempts + 1;
      setAttempts(a);
      misses.current += 1;
      if (misses.current >= 2) finish(longest, a, correctRuns);
      else startRound(len);
      return;
    }
    if (next.length === sequence.length) {
      const a = attempts + 1;
      const runs = correctRuns + 1;
      const best = Math.max(longest, sequence.length);
      setAttempts(a);
      setCorrectRuns(runs);
      setLongest(best);
      if (sequence.length >= spec.start + 3) finish(best, a, runs);
      else {
        setLen(sequence.length + 1);
        setTimeout(() => startRound(sequence.length + 1), 600);
      }
    }
  };

  return (
    <div className="mt-8 w-full">
      <Prompt>
        {phase === "idle"
          ? "Watch the sequence, then repeat it."
          : phase === "show"
            ? "Watch closely…"
            : phase === "input"
              ? "Now repeat the sequence."
              : "Sequence recorded."}
      </Prompt>

      <div className="mt-8 flex h-24 items-center justify-center">
        <span className="vv-display text-4xl uppercase tracking-[0.2em] text-foreground">
          {phase === "show" && showIndex < sequence.length ? sequence[showIndex] : phase === "input" ? "?" : "—"}
        </span>
      </div>

      {phase === "idle" ? (
        <button
          onClick={() => startRound(len)}
          className="rounded-full border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Start
        </button>
      ) : (
        <div className={`grid gap-3 ${palette ? "grid-cols-2" : "grid-cols-3"}`}>
          {pool.map((value) => (
            <button
              key={value}
              onClick={() => press(value)}
              disabled={phase !== "input"}
              className={`${tileBase} border-border bg-card/50 text-foreground hover:border-rose/50 disabled:opacity-40 ${
                accessible || palette ? "py-7 text-base" : ""
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <Stat>
        Longest {longest} · Attempts {attempts}
      </Stat>
    </div>
  );
}

/* -------------------------------------------------------------- breathing */

function phasesFor(pace: "normal" | "slow" | "varied", cycle: number) {
  if (pace === "slow")
    return [
      { label: "Inhale", ms: 5000, scale: 1.35 },
      { label: "Hold", ms: 3000, scale: 1.35 },
      { label: "Exhale", ms: 6000, scale: 0.8 },
    ];
  if (pace === "varied") {
    const f = cycle % 2 === 0 ? 1 : 1.4;
    return [
      { label: "Inhale", ms: 3500 * f, scale: 1.35 },
      { label: "Hold", ms: 1500 * f, scale: 1.35 },
      { label: "Exhale", ms: 4000 * f, scale: 0.8 },
    ];
  }
  return [
    { label: "Inhale", ms: 4000, scale: 1.35 },
    { label: "Hold", ms: 2000, scale: 1.35 },
    { label: "Exhale", ms: 4000, scale: 0.8 },
  ];
}

function BreathingTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "breathing" }>;
  onResult: (r: TaskResult) => void;
}) {
  const target = spec.cycles;
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [offsets, setOffsets] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const phaseStart = useRef(Date.now());
  const phases = phasesFor(spec.pace, cycles);
  const p = phases[phase]!;
  const done = cycles >= target;

  useEffect(() => {
    if (!running || done) return;
    phaseStart.current = Date.now();
    const t = setTimeout(() => {
      setPhase((prev) => {
        const nextPhase = (prev + 1) % 3;
        if (nextPhase === 0) setCycles((c) => c + 1);
        return nextPhase;
      });
    }, p.ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, running, cycles]);

  useEffect(() => {
    if (!done) return;
    setRunning(false);
    const expected = target * 3;
    const taps = offsets.length;
    const missed = Math.max(0, expected - taps);
    const avgOffset = taps ? offsets.reduce((a, b) => a + b, 0) / taps : 1500;
    const timing = clamp(100 - avgOffset / 14, 0, 100);
    const adherence = clamp((taps / expected) * 100, 0, 100);
    onResult({
      score: clamp(adherence * 0.55 + timing * 0.45, 0, 100),
      data: {
        completedCycles: target,
        missedPhases: missed,
        phaseTaps: taps,
        averageTimingOffsetMs: Math.round(avgOffset),
        timingAccuracy: Math.round(timing),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="mt-8 flex flex-col items-center">
      <Prompt>
        {spec.pace === "varied"
          ? "Match the rhythm — tap on every phase change."
          : "Follow the circle — tap as each phase changes."}
      </Prompt>

      <button
        onClick={() => {
          if (!running && !done) {
            setRunning(true);
            phaseStart.current = Date.now();
            return;
          }
          if (running) setOffsets((t) => [...t, Math.abs(Date.now() - phaseStart.current - p.ms)]);
        }}
        className="relative mt-10 flex h-64 w-64 items-center justify-center rounded-full sm:h-72 sm:w-72"
        aria-label="Breathing circle"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--teal) 18%, transparent), transparent 68%)",
            transform: `scale(${running ? p.scale : 1})`,
            transition: `transform ${running ? p.ms : 800}ms cubic-bezier(0.37,0,0.63,1)`,
          }}
        />
        <span
          className="absolute inset-8 rounded-full border"
          style={{
            borderColor: "color-mix(in oklab, var(--rose) 55%, transparent)",
            transform: `scale(${running ? p.scale * 0.85 : 1})`,
            transition: `transform ${running ? p.ms : 800}ms cubic-bezier(0.37,0,0.63,1)`,
          }}
        />
        <span className="vv-display relative text-2xl uppercase tracking-[0.3em] text-foreground">
          {done ? "Done" : running ? p.label : "Start"}
        </span>
      </button>

      <Stat>
        Cycles {Math.min(cycles, target)} / {target}
      </Stat>
    </div>
  );
}

/* ----------------------------------------------------------------- choice */

function ChoiceTask({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "choice" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="mt-8 grid gap-3">
        {spec.options.map((label, i) => {
          const active = selected === i;
          const value = (i / (spec.options.length - 1)) * 100;
          return (
            <button
              key={label}
              onClick={() => {
                setSelected(i);
                onResult({ score: value, data: { selection: label, selectionIndex: i + 1, value: Math.round(value) } });
              }}
              className={`rounded-2xl border px-6 text-left text-sm transition-all duration-300 active:scale-[0.99] ${
                accessible ? "py-7 text-base" : "py-5"
              } ${
                active
                  ? "border-rose bg-card text-foreground"
                  : "border-border bg-card/50 text-muted-foreground hover:border-rose/50"
              }`}
            >
              <span className="uppercase tracking-[0.18em]">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- slider */

function SliderTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "slider" }>;
  onResult: (r: TaskResult) => void;
}) {
  const [value, setValue] = useState(50);
  useEffect(() => {
    onResult({ score: value, data: { value, prompt: spec.prompt } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="vv-display mt-10 text-6xl font-light text-foreground">{value}</div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-8 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-teal"
        style={{ background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
        aria-label={spec.prompt}
      />
      <div className="mt-3 flex justify-between text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground">
        <span>{spec.lowLabel}</span>
        <span>{spec.highLabel}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- mood */

const FACES = ["😣", "😔", "😐", "🙂", "😊"];

function MoodTask({ spec, onResult }: { spec: Extract<TaskSpec, { type: "mood" }>; onResult: (r: TaskResult) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="mt-10 flex items-center justify-center gap-3">
        {FACES.map((face, i) => (
          <button
            key={face}
            onClick={() => {
              setSelected(i);
              onResult({ score: (i / 4) * 100, data: { mood: i + 1, face } });
            }}
            className={`flex h-16 w-16 items-center justify-center rounded-full border text-3xl transition-all duration-300 active:scale-95 ${
              selected === i ? "border-rose bg-card" : "border-border bg-card/40 opacity-70 hover:opacity-100"
            }`}
            aria-label={`Mood ${i + 1} of 5`}
          >
            {face}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- checkin */

function CheckinTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "checkin" }>;
  onResult: (r: TaskResult) => void;
}) {
  const [mood, setMood] = useState<number | null>(null);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(spec.fields.map((f) => [f, 50])),
  );

  useEffect(() => {
    if (mood === null) return;
    const parts = [((mood - 1) / 4) * 100, ...spec.fields.map((f) => values[f] ?? 50)];
    onResult({
      score: parts.reduce((a, b) => a + b, 0) / parts.length,
      data: { mood, ...values },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, values]);

  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="mt-8 flex items-center justify-center gap-3">
        {FACES.map((face, i) => (
          <button
            key={face}
            onClick={() => setMood(i + 1)}
            className={`flex h-14 w-14 items-center justify-center rounded-full border text-2xl transition-all duration-300 active:scale-95 ${
              mood === i + 1 ? "border-rose bg-card" : "border-border bg-card/40 opacity-70 hover:opacity-100"
            }`}
            aria-label={`Mood ${i + 1} of 5`}
          >
            {face}
          </button>
        ))}
      </div>
      <div className="mt-10 space-y-7">
        {spec.fields.map((field) => (
          <label key={field} className="block text-left">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">{field}</span>
              <span className="vv-display text-lg text-foreground">{values[field]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={values[field]}
              onChange={(e) => setValues((v) => ({ ...v, [field]: Number(e.target.value) }))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-teal"
              style={{ background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
              aria-label={field}
            />
            <div className="mt-2 flex justify-between text-[0.55rem] uppercase tracking-[0.26em] text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </label>
        ))}
      </div>
      {mood === null ? (
        <p className="mt-8 text-[0.6rem] uppercase tracking-[0.24em] text-teal">Choose a face to continue</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- drag place */

function DragPlaceTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "drag-place" }>;
  onResult: (r: TaskResult) => void;
}) {
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [retries, setRetries] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const area = useRef<HTMLDivElement | null>(null);
  const startedAt = useRef(Date.now());
  const targetPos = useMemo(() => ({ x: 55 + (round % 2) * 20, y: 12 + (round % 3) * 26 }), [round]);

  const complete = (nextTimes: number[], nextRetries: number) => {
    setDone(true);
    const avg = nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length;
    const speed = clamp(100 - (avg - 1200) / 60, 0, 100);
    const accuracy = clamp(100 - nextRetries * 12, 0, 100);
    onResult({
      score: clamp(accuracy * 0.6 + speed * 0.4, 0, 100),
      data: {
        rounds: nextTimes.length,
        retries: nextRetries,
        averagePlacementMs: Math.round(avg),
        accuracy: Math.round(accuracy),
      },
    });
  };

  const onPointerDown = () => {
    if (done) return;
    setDragging(true);
    startedAt.current = startedAt.current || Date.now();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !area.current) return;
    const rect = area.current.getBoundingClientRect();
    setPos({
      x: clamp(((e.clientX - rect.left) / rect.width) * 100 - 6, 0, 88),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100 - 8, 0, 84),
    });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const hit = Math.abs(pos.x - targetPos.x) < 12 && Math.abs(pos.y - targetPos.y) < 16;
    if (!hit) {
      setRetries((r) => r + 1);
      return;
    }
    const elapsed = Date.now() - startedAt.current;
    const nextTimes = [...times, elapsed];
    setTimes(nextTimes);
    startedAt.current = Date.now();
    setPos({ x: 0, y: 0 });
    if (round + 1 >= spec.rounds) complete(nextTimes, retries);
    else setRound((r) => r + 1);
  };

  return (
    <div className="mt-8 w-full">
      <Prompt>Drag the block onto the target circle.</Prompt>
      <div
        ref={area}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="relative mt-8 h-72 w-full touch-none overflow-hidden rounded-3xl border border-border bg-card/50"
      >
        <span
          className="absolute h-14 w-14 rounded-full border-2 border-dashed"
          style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, borderColor: "var(--rose)" }}
        />
        <button
          onPointerDown={onPointerDown}
          className="absolute h-12 w-12 rounded-xl"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            background: "linear-gradient(135deg,var(--teal),var(--rose))",
            transition: dragging ? "none" : "left 250ms ease, top 250ms ease",
            opacity: done ? 0.4 : 1,
          }}
          aria-label="Draggable object"
        />
      </div>
      <Stat>
        Placed {times.length} / {spec.rounds} · Retries {retries}
      </Stat>
    </div>
  );
}

/* ------------------------------------------------------------ match pairs */

function MatchPairsTask({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "match-pairs" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const deck = useMemo(() => {
    const symbols = spec.symbols.slice(0, spec.pairs);
    return shuffle([...symbols, ...symbols].map((s, i) => ({ id: i, symbol: s })));
  }, [spec]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const startedAt = useRef(Date.now());
  const finished = useRef(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const cardA = deck.find((c) => c.id === a)!;
    const cardB = deck.find((c) => c.id === b)!;
    setMoves((m) => m + 1);
    if (cardA.symbol === cardB.symbol) {
      setMatched((m) => [...m, a!, b!]);
      setFlipped([]);
    } else {
      const t = setTimeout(() => setFlipped([]), 750);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [flipped, deck]);

  useEffect(() => {
    if (finished.current || matched.length < deck.length) return;
    finished.current = true;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const efficiency = clamp((spec.pairs / Math.max(1, moves)) * 100, 0, 100);
    const speed = clamp(100 - (seconds - spec.pairs * 5) * 2, 0, 100);
    onResult({
      score: clamp(efficiency * 0.65 + speed * 0.35, 0, 100),
      data: { pairs: spec.pairs, moves, completionSeconds: seconds, efficiency: Math.round(efficiency) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  return (
    <div className="mt-8 w-full">
      <Prompt>Match every pair.</Prompt>
      <div className={`mt-8 grid gap-3 ${accessible ? "grid-cols-2" : "grid-cols-4"}`}>
        {deck.map((card) => {
          const open = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => {
                if (open || flipped.length === 2) return;
                setFlipped((f) => [...f, card.id]);
              }}
              className={`flex items-center justify-center rounded-2xl border transition-all duration-300 active:scale-[0.97] ${
                accessible ? "h-24 text-4xl" : "h-20 text-3xl"
              } ${open ? "border-rose bg-card" : "border-border bg-card/40"}`}
              aria-label={open ? card.symbol : "Hidden card"}
            >
              {open ? card.symbol : ""}
            </button>
          );
        })}
      </div>
      <Stat>
        Pairs {matched.length / 2} / {spec.pairs} · Moves {moves}
      </Stat>
    </div>
  );
}

/* -------------------------------------------------------------- checklist */

function ChecklistTask({
  spec,
  accessible,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "checklist" }>;
  accessible?: boolean | undefined;
  onResult: (r: TaskResult) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="mt-8 grid gap-3">
        {spec.items.map((item) => {
          const active = picked.includes(item);
          return (
            <button
              key={item}
              onClick={() => {
                const next = active ? picked.filter((p) => p !== item) : [...picked, item];
                setPicked(next);
                onResult({
                  score: (next.length / spec.items.length) * 100,
                  data: { selected: next.length, total: spec.items.length, items: next.join(", ") },
                });
              }}
              className={`flex items-center justify-between rounded-2xl border px-6 text-left transition-all duration-300 active:scale-[0.99] ${
                accessible ? "py-7 text-base" : "py-5 text-sm"
              } ${
                active
                  ? "border-teal bg-card text-foreground"
                  : "border-border bg-card/50 text-muted-foreground hover:border-teal/50"
              }`}
            >
              <span className="uppercase tracking-[0.18em]">{item}</span>
              <span className="text-xs text-teal">{active ? "Selected" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- timed taps */

function TimedTapsTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "timed-taps" }>;
  onResult: (r: TaskResult) => void;
}) {
  const [phase, setPhase] = useState<"idle" | "active" | "rest" | "resume" | "done">("idle");
  const [left, setLeft] = useState(spec.seconds);
  const [pulse, setPulse] = useState(false);
  const [offsets, setOffsets] = useState<number[]>([]);
  const [restOffsets, setRestOffsets] = useState<number[]>([]);
  const lastPulse = useRef(Date.now());
  const running = phase === "active" || phase === "resume";

  useEffect(() => {
    if (!running) return;
    const beat = setInterval(() => {
      lastPulse.current = Date.now();
      setPulse((p) => !p);
    }, 1000);
    return () => clearInterval(beat);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      if (spec.rest && phase === "active") {
        setPhase("rest");
        setLeft(spec.seconds);
        return;
      }
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left, phase]);

  const finish = () => {
    const all = [...offsets, ...restOffsets];
    const avg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 500;
    const timing = clamp(100 - avg / 5, 0, 100);
    const expected = spec.seconds * (spec.rest ? 2 : 1);
    const adherence = clamp((all.length / expected) * 100, 0, 100);
    const drift =
      offsets.length && restOffsets.length
        ? Math.abs(
            offsets.reduce((a, b) => a + b, 0) / offsets.length -
              restOffsets.reduce((a, b) => a + b, 0) / restOffsets.length,
          )
        : 0;
    setPhase("done");
    onResult({
      score: clamp(timing * 0.55 + adherence * 0.45, 0, 100),
      data: {
        taps: all.length,
        expectedTaps: expected,
        averageOffsetMs: Math.round(avg),
        timingAccuracy: Math.round(timing),
        consistencyDriftMs: Math.round(drift),
        completedRest: spec.rest ? "yes" : "n/a",
      },
    });
  };

  const tap = () => {
    if (!running) return;
    const off = Math.min(Math.abs(Date.now() - lastPulse.current), 500);
    if (phase === "resume") setRestOffsets((o) => [...o, off]);
    else setOffsets((o) => [...o, off]);
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <Prompt>{spec.prompt}</Prompt>
      <button
        onClick={() => {
          if (phase === "idle") {
            setPhase("active");
            lastPulse.current = Date.now();
            return;
          }
          if (phase === "rest") {
            setPhase("resume");
            lastPulse.current = Date.now();
            return;
          }
          tap();
        }}
        disabled={phase === "done"}
        className="vv-display relative mt-10 flex h-60 w-60 items-center justify-center rounded-full border text-xl uppercase tracking-[0.24em] text-foreground transition-transform duration-300 active:scale-95"
        style={{ borderColor: "color-mix(in oklab, var(--rose) 45%, transparent)" }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--teal) 20%, transparent), transparent 70%)",
            transform: `scale(${running && pulse ? 1.12 : 0.94})`,
            transition: "transform 420ms ease-out",
          }}
        />
        <span className="relative">
          {phase === "idle"
            ? "Start"
            : phase === "rest"
              ? "Rest · Resume"
              : phase === "done"
                ? "Done"
                : `Tap · ${left}s`}
        </span>
      </button>
      <Stat>Taps {offsets.length + restOffsets.length}</Stat>
    </div>
  );
}

/* ----------------------------------------------------------- rating cards */

const RATING_OPTIONS = ["Currently unable", "Need assistance", "With difficulty", "Independently"];

function RatingCardsTask({
  spec,
  onResult,
}: {
  spec: Extract<TaskSpec, { type: "rating-cards" }>;
  onResult: (r: TaskResult) => void;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const update = (item: string, index: number) => {
    const next = { ...ratings, [item]: index };
    setRatings(next);
    const values = spec.items.map((i) => next[i]).filter((v): v is number => v !== undefined);
    if (values.length < spec.items.length) return;
    const score = (values.reduce((a, b) => a + b, 0) / (spec.items.length * 3)) * 100;
    onResult({
      score,
      data: Object.fromEntries(spec.items.map((i) => [i, RATING_OPTIONS[next[i]!]!])),
    });
  };

  const rated = Object.keys(ratings).length;

  return (
    <div className="mt-8 w-full">
      <Prompt>{spec.prompt}</Prompt>
      <div className="mt-8 space-y-4">
        {spec.items.map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-card/50 p-4 text-left">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-foreground">{item}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RATING_OPTIONS.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => update(item, i)}
                  className={`rounded-xl border px-3 py-2.5 text-[0.55rem] uppercase tracking-[0.14em] transition-all duration-300 ${
                    ratings[item] === i
                      ? "border-rose bg-card text-foreground"
                      : "border-border text-muted-foreground hover:border-rose/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Stat>
        Rated {rated} / {spec.items.length}
      </Stat>
    </div>
  );
}
