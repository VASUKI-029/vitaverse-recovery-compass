import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DimensionMeters } from "@/components/vitaverse/Indicators";
import { getModule } from "@/lib/modules";
import { Card, Eyebrow, Page, PrimaryButton, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { overallScore, useDB } from "@/lib/vitaverse-db";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/summary")({
  head: () => ({
    meta: [
      { title: "Your Baseline — Vitaverse AI" },
      { name: "description", content: "Your baseline results and VITAVERSE Recovery Indicators." },
      { property: "og:title", content: "Your Baseline — Vitaverse AI" },
      { property: "og:description", content: "Baseline results and recovery indicators." },
    ],
  }),
  component: Summary,
});

function Summary() {
  const navigate = useNavigate();
  const session = useVita();
  const record = useDB().records[session.patient?.id ?? ""] ?? null;
  const mod = getModule(record?.moduleId ?? session.patient?.moduleId);
  const overall = overallScore(record?.dimensions ?? {});

  if (!record || record.baseline.status !== "completed") {
    return (
      <Page max="max-w-md" className="flex min-h-[100dvh] items-center justify-center">
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Your baseline results appear after completing the assessment.</p>
          <div className="mt-6">
            <PrimaryButton onClick={() => navigate({ to: "/patient/assessment" })}>Baseline Assessment</PrimaryButton>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page max="max-w-2xl">
      <div className="vv-enter text-center">
        <Eyebrow>{mod.name} · Baseline Results</Eyebrow>
        <Title>Your Recovery Starting Point</Title>
        <Sub>Built entirely from your responses.</Sub>
      </div>

      <div className="mt-10 flex justify-center vv-enter">
        <Ring value={overall} />
      </div>

      <Card className="mt-10 space-y-6 vv-enter">
        <DimensionMeters values={record.dimensions} />
      </Card>

      <p className="mt-6 text-center text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
        VITAVERSE Recovery Indicators · prototype indicators, not medical diagnoses
      </p>

      <div className="mt-10 flex justify-center pb-6">
        <PrimaryButton
          onClick={() => {
            navigate({ to: "/patient/twin" });
          }}
        >
          Create My Digital Twin
        </PrimaryButton>
      </div>
    </Page>
  );
}
