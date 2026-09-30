import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { TaskRunner, type TaskResult } from "@/components/vitaverse/tasks";
import { getModule } from "@/lib/modules";
import { clamp, finalizeAssessment, saveAssessmentResult, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/assessment/$step")({
  head: () => ({
    meta: [
      { title: "Interactive Assessment — Vitaverse AI" },
      { name: "description", content: "Guided, interactive recovery assessment for your assigned module." },
      { property: "og:title", content: "Interactive Assessment — Vitaverse AI" },
      { property: "og:description", content: "Guided interactive recovery assessment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssessmentStep,
});

function AssessmentStep() {
  const { step } = Route.useParams();
  const navigate = useNavigate();
  const state = useVita();
  const mod = getModule(state.patient?.moduleId);
  const total = mod.assessments.length;
  const index = clamp(parseInt(step, 10) || 1, 1, total);
  const assessment = mod.assessments[index - 1]!;
  const [result, setResult] = useState<{ step: number; r: TaskResult } | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const ready = result?.step === index;

  const next = () => {
    if (!result || result.step !== index) return;
    saveAssessmentResult({
      assessmentId: assessment.id,
      indicatorKey: assessment.indicator.key,
      score: result.r.score,
      data: result.r.data,
    });
    if (index < total) {
      navigate({ to: "/patient/assessment/$step", params: { step: String(index + 1) } });
    } else {
      finalizeAssessment();
      navigate({ to: "/patient/summary" });
    }
  };

  return (
    <Page max="max-w-xl" className={`flex min-h-[100dvh] flex-col ${mod.accessible ? "text-lg" : ""}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setConfirmLeave(true)}
          className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back
        </button>
        <span className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">
          Assessment {index} of {total}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${(index / total) * 100}%`, background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
        />
      </div>

      <div key={index} className="vv-enter mt-12 flex flex-1 flex-col items-center text-center">
        <h1 className="vv-display text-[clamp(1.6rem,5vw,2.4rem)] font-light text-foreground">{assessment.title}</h1>
        <p className="mt-3 text-sm font-light text-muted-foreground">{assessment.instruction}</p>

        <div className="mt-10 w-full">
          <TaskRunner
            key={`${mod.id}-${index}`}
            spec={assessment.task}
            accessible={mod.accessible}
            onResult={(r) => setResult({ step: index, r })}
          />
        </div>

        <div className="mt-12 pb-10">
          <PrimaryButton disabled={!ready} onClick={next}>
            {index < total ? "Continue" : "Complete"}
          </PrimaryButton>
        </div>
      </div>

      {confirmLeave ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/25 px-6 backdrop-blur-sm">
          <Card className="w-full max-w-sm text-center">
            <h2 className="vv-display text-2xl font-light text-foreground">Leave Assessment?</h2>
            <p className="mt-3 text-sm text-muted-foreground">Your progress on this step will not be saved.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <PrimaryButton onClick={() => setConfirmLeave(false)}>Stay</PrimaryButton>
              <button
                onClick={() =>
                  index > 1
                    ? navigate({ to: "/patient/assessment/$step", params: { step: String(index - 1) } })
                    : navigate({ to: "/patient/assessment" })
                }
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
