import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Eyebrow, Meter, Page, PrimaryButton, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { computeMetrics, overallScore, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/summary")({
  head: () => ({
    meta: [
      { title: "Your Baseline — Vitaverse AI" },
      { name: "description", content: "Your assessment summary and baseline recovery indicator." },
      { property: "og:title", content: "Your Baseline — Vitaverse AI" },
      { property: "og:description", content: "Assessment summary and baseline recovery indicator." },
    ],
  }),
  component: Summary,
});

function Summary() {
  const state = useVita();
  const navigate = useNavigate();
  const m = state.metrics ?? computeMetrics(state);
  const overall = overallScore(m);

  return (
    <Page max="max-w-2xl">
      <div className="vv-enter text-center">
        <Eyebrow>Assessment Summary</Eyebrow>
        <Title>Your Baseline</Title>
        <Sub>Built entirely from your responses.</Sub>
      </div>

      <div className="mt-10 flex justify-center vv-enter">
        <Ring value={overall} />
      </div>

      <Card className="mt-10 space-y-6 vv-enter">
        <Meter label="Breathing" value={m.breathing} />
        <Meter label="Pacing" value={m.pacing} />
        <Meter label="Activity Comfort" value={m.comfort} />
        <Meter label="Fatigue" value={m.fatigue} />
        <Meter label="Recovery Confidence" value={m.confidence} />
      </Card>

      <div className="mt-10 flex justify-center pb-6">
        <PrimaryButton onClick={() => navigate({ to: "/patient/twin" })}>View My Digital Twin</PrimaryButton>
      </div>
    </Page>
  );
}
