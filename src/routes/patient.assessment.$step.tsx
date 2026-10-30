import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { TaskRunner, type TaskResult } from "@/components/vitaverse/tasks";
import { dimensionsForAssessment, getModule } from "@/lib/modules";
import { completeBaseline, saveBaselineAnswer, useDB } from "@/lib/vitaverse-db";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/assessment/$step")({
  head: () => ({
    meta: [
      { title: "Baseline Assessment — Vitaverse AI" },
      { name: "description", content: "Guided, interactive baseline assessment for your assigned module." },
      { property: "og:title", content: "Baseline Assessment — Vitaverse AI" },
      { property: "og:description", content: "Guided interactive baseline assessment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssessmentStep,
});

function AssessmentStep() {
  const { step } = Route.useParams();
  const navigate = useNavigate();
  const session = useVita();
  const record = useDB().records[session.patient?.id ?? ""] ?? null;
  const mod = getModule(record?.moduleId ?? session.patient?.moduleId);
  const total = mod.assessments.length;
  const index = Math.min(Math.max(parseInt(step, 10) || 1, 1), total);
  const assessment = mod.assessments[index - 1]!;
  const answered = record?.baseline.answers[assessment.id] ?? null;
  const [ready, setReady] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const completedCount = record ? Object.keys(record.baseline.answers).length : 0;

  if (!record) {
    return (
      <Page max="max-w-md" className="flex min-h-[100dvh] items-center justify-center">
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Please sign in as a patient first.</p>
          <div className="mt-6">
            <PrimaryButton onClick={() => navigate({ to: "/role" })}>Choose Portal</PrimaryButton>
          </div>
        </Card>
      </Page>
    );
  }

  const dims = dimensionsForAssessment(assessment).join(" · ");

  const goNext = () => {
    if (!answered && !ready) return;
    if (index < total) {
      navigate({ to: "/patient/assessment/$step", params: { step: String(index + 1) } });
    } else {
      completeBaseline(record.patientId);
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
          style={{
            width: `${(completedCount / total) * 100}%`,
            background: "linear-gradient(90deg,var(--teal),var(--rose))",
          }}
        />
      </div>
      <p className="mt-2 text-right text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
        Saved on this device — continue anytime
      </p>

      <div key={index} className="vv-enter mt-10 flex flex-1 flex-col items-center text-center">
        <h1 className="vv-display text-[clamp(1.6rem,5vw,2.4rem)] font-light text-foreground">{assessment.title}</h1>
        <p className="mt-3 text-sm font-light text-muted-foreground">{assessment.instruction}</p>

        {answered ? (
          <div className="mt-10 w-full">
            <Card className="text-center">
              <p className="text-[0.62rem] uppercase tracking-[0.26em] text-teal">Already Completed</p>
              <p className="vv-display mt-3 text-4xl text-foreground">{answered.score}%</p>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{dims}</p>
            </Card>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PrimaryButton onClick={goNext}>{index < total ? "Keep Answer & Continue" : "Complete Baseline Assessment"}</PrimaryButton>
              <button
                onClick={() => navigate({ to: `/patient/assessment/${index}/redo` })}
                className="rounded-full border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Redo This Step
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10 w-full">
              <TaskRunner
                key={`${mod.id}-${index}`}
                spec={assessment.task}
                accessible={mod.accessible}
                onResult={(r) => {
                  setReady(true);
                  saveBaselineAnswer(record.patientId, assessment.id, r.score, r.data);
                }}
              />
            </div>
            <div className="mt-12 pb-10">
              <PrimaryButton disabled={!ready} onClick={goNext}>
                {index < total ? "Next" : "Complete Baseline Assessment"}
              </PrimaryButton>
            </div>
          </>
        )}
      </div>

      {confirmLeave ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/25 px-6 backdrop-blur-sm">
          <Card className="w-full max-w-sm text-center">
            <h2 className="vv-display text-2xl font-light text-foreground">Leave Assessment?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your completed answers are saved. You can continue anytime.
            </p>
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
