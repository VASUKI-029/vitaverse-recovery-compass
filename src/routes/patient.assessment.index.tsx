import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getModule } from "@/lib/modules";
import { useVita } from "@/lib/vitaverse-store";
import { Card, Eyebrow, GhostLink, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";

export const Route = createFileRoute("/patient/assessment/")({
  head: () => ({
    meta: [
      { title: "Assessment Introduction — Vitaverse AI" },
      { name: "description", content: "A few interactive activities to understand your current recovery profile." },
      { property: "og:title", content: "Assessment Introduction — Vitaverse AI" },
      { property: "og:description", content: "Interactive activities that shape your recovery profile." },
    ],
  }),
  component: AssessmentIntro,
});

function AssessmentIntro() {
  const navigate = useNavigate();
  const mod = getModule(useVita().patient?.moduleId);
  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col justify-center">
      <div className="vv-enter text-center">
        <Eyebrow>{mod.name}</Eyebrow>
        <Title>Let's understand your recovery</Title>
        <Sub>A few interactive activities will help us understand your current recovery profile.</Sub>
      </div>

      <Card className="mt-10 vv-enter">
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">Assessment 1 of {mod.assessments.length}</span>
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-teal">5–7 minutes</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/5 rounded-full" style={{ background: "linear-gradient(90deg,var(--teal),var(--rose))" }} />
        </div>
      </Card>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton onClick={() => navigate({ to: "/patient/assessment/$step", params: { step: "1" } })}>
          Begin
        </PrimaryButton>
        <GhostLink to="/patient/welcome">Back</GhostLink>
      </div>
    </Page>
  );
}
