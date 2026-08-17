import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Meter, Page, PrimaryButton, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { computeMetrics, overallScore, setState, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — Vitaverse AI" },
      { name: "description", content: "Your recovery profile visualised from your assessment responses." },
      { property: "og:title", content: "Digital Twin — Vitaverse AI" },
      { property: "og:description", content: "Your recovery profile, visualised." },
    ],
  }),
  component: DigitalTwin,
});

function DigitalTwin() {
  const state = useVita();
  const navigate = useNavigate();
  const m = state.metrics ?? computeMetrics(state);
  const overall = overallScore(m);
  const [generating, setGenerating] = useState(!state.twinCreated);

  useEffect(() => {
    if (!generating) return;
    const t = setTimeout(() => {
      setGenerating(false);
      setState({ twinCreated: true });
    }, 1600);
    return () => clearTimeout(t);
  }, [generating]);

  return (
    <Page max="max-w-3xl" className="pb-28">
      <div className="vv-enter text-center">
        <Eyebrow>
          {state.patient?.name ?? "Alex"} · {state.patient?.module ?? "PulmoVerse"}
        </Eyebrow>
        <Title>{generating ? "Generating Digital Twin" : "Digital Twin Created"}</Title>
        <Sub>Your recovery profile has been created from your assessment responses.</Sub>
      </div>

      <div className="mt-10 flex justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ animation: generating ? "vv-rise 1600ms ease-in-out infinite alternate" : undefined }}
        >
          <svg viewBox="0 0 300 300" className="absolute h-[320px] w-[320px] text-rose opacity-45">
            <g fill="none" stroke="currentColor" strokeWidth="0.6">
              <circle cx="150" cy="150" r="120" />
              <ellipse cx="150" cy="150" rx="140" ry="80" transform="rotate(25 150 150)" />
              <ellipse cx="150" cy="150" rx="140" ry="80" transform="rotate(-25 150 150)" />
            </g>
          </svg>
          <Ring value={overall} size={200} />
        </div>
      </div>

      {state.lastUpdate ? (
        <Card className="mt-10 vv-enter text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.26em] text-teal">Recovery Profile Updated</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your latest activity has been added to your recovery profile ({state.lastUpdate.metric}{" "}
            {state.lastUpdate.from}% → {state.lastUpdate.to}%).
          </p>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="space-y-6">
          <Meter label="Breathing" value={m.breathing} />
          <Meter label="Pacing" value={m.pacing} />
          <Meter label="Activity Comfort" value={m.comfort} />
        </Card>
        <Card className="space-y-6">
          <Meter label="Fatigue" value={m.fatigue} />
          <Meter label="Recovery Confidence" value={m.confidence} />
          <Meter label="Overall Recovery Indicator" value={overall} />
        </Card>
      </div>

      <div className="mt-10 flex justify-center">
        <PrimaryButton onClick={() => navigate({ to: "/patient/plan" })}>View Recovery Plan</PrimaryButton>
      </div>
      <BottomNav />
    </Page>
  );
}
