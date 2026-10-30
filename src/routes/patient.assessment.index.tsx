import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getModule } from "@/lib/modules";
import { Card, Eyebrow, GhostLink, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { useDB } from "@/lib/vitaverse-db";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/assessment/")({
  head: () => ({
    meta: [
      { title: "Baseline Assessment — Vitaverse AI" },
      { name: "description", content: "Your recovery starting point: ten interactive baseline activities." },
      { property: "og:title", content: "Baseline Assessment — Vitaverse AI" },
      { property: "og:description", content: "Your recovery starting point." },
    ],
  }),
  component: BaselineIntro,
});

function BaselineIntro() {
  const navigate = useNavigate();
  const session = useVita();
  const record = useDB().records[session.patient?.id ?? ""] ?? null;
  const mod = getModule(record?.moduleId ?? session.patient?.moduleId);
  const total = mod.assessments.length;
  const answered = record ? Object.keys(record.baseline.answers).length : 0;
  const done = record?.baseline.status === "completed";

  const firstUnanswered = record
    ? mod.assessments.findIndex((a) => !record.baseline.answers[a.id])
    : 0;
  const resumeStep = done ? 1 : Math.max(1, firstUnanswered + 1);

  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col justify-center">
      <div className="vv-enter text-center">
        <Eyebrow>{mod.name}</Eyebrow>
        <Title>Your Recovery Starting Point</Title>
        <Sub>
          Before beginning your personalised recovery journey, let's understand where you are today. {total} short
          interactive activities — progress is saved on this device, so you can continue anytime.
        </Sub>
      </div>

      <Card className="mt-10 vv-enter">
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
            {done ? "Completed" : `Assessment ${Math.min(answered + 1, total)} of ${total}`}
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.24em] text-teal">10–15 minutes</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${(answered / total) * 100}%`, background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
          />
        </div>
        <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
          {answered} of {total} completed
        </p>
      </Card>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton
          disabled={done}
          onClick={() =>
            navigate({ to: "/patient/assessment/$step", params: { step: String(resumeStep) } })
          }
        >
          {done ? "Baseline Completed" : answered > 0 ? "Continue Baseline Assessment" : "Start Baseline Assessment"}
        </PrimaryButton>
        {done ? (
          <GhostLink to="/patient/summary">View Baseline Results</GhostLink>
        ) : (
          <GhostLink to="/patient/welcome">Back</GhostLink>
        )}
      </div>
    </Page>
  );
}
