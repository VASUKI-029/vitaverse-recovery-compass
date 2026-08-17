import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { clamp, finalizeAssessment, setState } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/assessment/$step")({
  head: () => ({
    meta: [
      { title: "Interactive Assessment — Vitaverse AI" },
      { name: "description", content: "Guided, interactive PulmoVerse recovery assessment activities." },
      { property: "og:title", content: "Interactive Assessment — Vitaverse AI" },
      { property: "og:description", content: "Guided interactive recovery assessment." },
    ],
  }),
  component: AssessmentStep,
});

const TITLES = ["Guided Breathing", "Breathing Pacing", "Activity Comfort", "Fatigue", "Recovery Confidence"];

function AssessmentStep() {
  const { step } = Route.useParams();
  const navigate = useNavigate();
  const index = clamp(parseInt(step, 10) || 1, 1, 5);
  const [ready, setReady] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => setReady(false), [index]);

  const next = () => {
    if (index < 5) {
      navigate({ to: "/patient/assessment/$step", params: { step: String(index + 1) } });
    } else {
      finalizeAssessment();
      navigate({ to: "/patient/summary" });
    }
  };

  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setConfirmLeave(true)}
          className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back
        </button>
        <span className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">
          Assessment {index} of 5
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${(index / 5) * 100}%`, background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
        />
      </div>

      <div key={index} className="vv-enter mt-12 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="vv-display text-[clamp(1.6rem,5vw,2.4rem)] font-light text-foreground">{TITLES[index - 1]}</h1>

        {index === 1 ? <BreathingTask onReady={() => setReady(true)} pacing={false} /> : null}
        {index === 2 ? <BreathingTask onReady={() => setReady(true)} pacing /> : null}
        {index === 3 ? <ComfortTask onReady={() => setReady(true)} /> : null}
        {index === 4 ? (
          <SliderTask
            prompt="How tired do you feel right now?"
            storeKey="fatigue"
            onReady={() => setReady(true)}
          />
        ) : null}
        {index === 5 ? (
          <SliderTask
            prompt="How confident do you feel about your recovery today?"
            storeKey="confidence"
            onReady={() => setReady(true)}
          />
        ) : null}

        <div className="mt-12 pb-10">
          <PrimaryButton disabled={!ready} onClick={next}>
            Continue
          </PrimaryButton>
        </div>
      </div>

      {confirmLeave ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/25 px-6 backdrop-blur-sm">
          <Card className="w-full max-w-sm text-center">
            <h2 className="vv-display text-2xl font-light text-foreground">Leave Assessment?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your completed answers are kept.</p>
            <div className="mt-7 flex justify-center gap-3">
              <PrimaryButton onClick={() => setConfirmLeave(false)}>Stay</PrimaryButton>
              <button
                onClick={() => navigate({ to: "/patient/assessment" })}
                className="rounded-full border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Leave
              </button>
            </div>
          </Card>
        </div>
      ) : null}
    </Page>
  );
}

const PHASES: { label: string; ms: number; scale: number }[] = [
  { label: "Inhale", ms: 4000, scale: 1.35 },
  { label: "Hold", ms: 2000, scale: 1.35 },
  { label: "Exhale", ms: 4000, scale: 0.8 },
];

function BreathingTask({ onReady, pacing }: { onReady: () => void; pacing: boolean }) {
  const target = 3;
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const phaseStart = useRef(Date.now());

  useEffect(() => {
    if (!running) return;
    const p = PHASES[phase]!;
    phaseStart.current = Date.now();
    const t = setTimeout(() => {
      setPhase((prev) => {
        const nextPhase = (prev + 1) % PHASES.length;
        if (nextPhase === 0) setCycles((c) => c + 1);
        return nextPhase;
      });
    }, p.ms);
    return () => clearTimeout(t);
  }, [phase, running]);

  useEffect(() => {
    if (cycles < target) return;
    setRunning(false);
    const completed = cycles;
    const missed = Math.max(0, target * PHASES.length - taps.length);
    const consistency = taps.length
      ? clamp(1 - taps.reduce((a, b) => a + b, 0) / taps.length / 1200, 0.15, 1)
      : 0.4;
    setState((s) => ({
      raw: pacing
        ? { ...s.raw, pacingCycles: completed, pacingConsistency: consistency }
        : { ...s.raw, cyclesCompleted: completed, cyclesMissed: missed, timingConsistency: consistency },
    }));
    onReady();
  }, [cycles, taps, pacing, onReady]);

  const p = PHASES[phase]!;
  const done = cycles >= target;

  return (
    <div className="mt-8 flex flex-col items-center">
      <p className="text-sm font-light text-muted-foreground">
        {pacing ? "Match the rhythm — tap on every phase change." : "Follow the circle — tap as each phase changes."}
      </p>

      <button
        onClick={() => {
          if (!running && !done) {
            setRunning(true);
            return;
          }
          if (running) setTaps((t) => [...t, Math.abs(Date.now() - phaseStart.current - p.ms)]);
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

      <p className="mt-8 text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">
        Cycles {Math.min(cycles, target)} / {target}
      </p>
    </div>
  );
}

const COMFORT = ["Very difficult", "Difficult", "Moderate", "Comfortable", "Very comfortable"];

function ComfortTask({ onReady }: { onReady: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="mt-8 w-full">
      <p className="text-sm font-light text-muted-foreground">How comfortable do you feel during activity?</p>
      <div className="mt-8 grid gap-3">
        {COMFORT.map((label, i) => {
          const active = selected === i + 1;
          return (
            <button
              key={label}
              onClick={() => {
                setSelected(i + 1);
                setState((s) => ({ assessments: { ...s.assessments, comfort: i + 1 } }));
                onReady();
              }}
              className={`rounded-2xl border px-6 py-5 text-left text-sm transition-all duration-300 active:scale-[0.99] ${
                active ? "border-rose bg-card text-foreground" : "border-border bg-card/50 text-muted-foreground hover:border-rose/50"
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

function SliderTask({
  prompt,
  storeKey,
  onReady,
}: {
  prompt: string;
  storeKey: "fatigue" | "confidence";
  onReady: () => void;
}) {
  const [value, setValue] = useState(50);
  useEffect(() => {
    setState((s) => ({ assessments: { ...s.assessments, [storeKey]: value } }));
    onReady();
  }, [value, storeKey, onReady]);

  return (
    <div className="mt-8 w-full">
      <p className="text-sm font-light text-muted-foreground">{prompt}</p>
      <div className="vv-display mt-10 text-6xl font-light text-foreground">{value}</div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-8 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-teal"
        style={{ background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
        aria-label={prompt}
      />
      <div className="mt-3 flex justify-between text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
