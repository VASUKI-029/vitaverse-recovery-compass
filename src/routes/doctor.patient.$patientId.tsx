import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Eyebrow, Meter, Page, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { computeMetrics, insightFor, overallScore, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/doctor/patient/$patientId")({
  head: () => ({
    meta: [
      { title: "Patient Detail — Vitaverse AI" },
      { name: "description", content: "Clinician view of a patient's digital twin and recovery metrics." },
      { property: "og:title", content: "Patient Detail — Vitaverse AI" },
      { property: "og:description", content: "Digital twin and recovery metrics for one patient." },
    ],
  }),
  component: PatientDetail,
});

function PatientDetail() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const state = useVita();
  const m = state.metrics ?? computeMetrics(state);
  const overall = overallScore(m);

  return (
    <Page max="max-w-4xl">
      <button
        onClick={() => navigate({ to: "/doctor" })}
        className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to Dashboard
      </button>

      <div className="vv-enter mt-8">
        <Eyebrow>{patientId} · PulmoVerse</Eyebrow>
        <Title>{state.patient?.name ?? "Alex"}</Title>
        <Sub>Adaptive recovery profile generated from assessment and activity data.</Sub>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex justify-center">
          <Ring value={overall} />
        </div>
        <Card className="space-y-6">
          <Meter label="Breathing Control" value={m.breathing} />
          <Meter label="Activity Comfort" value={m.comfort} />
          <Meter label="Fatigue Load" value={m.fatigue} />
          <Meter label="Recovery Confidence" value={m.confidence} />
        </Card>
      </div>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Clinical Insight</p>
      <Card className="mt-3">
        <p className="text-sm font-light leading-relaxed text-foreground">{insightFor(state)}</p>
      </Card>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Activity Log</p>
      <Card className="mt-3">
        {state.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {state.activities
              .slice()
              .reverse()
              .map((a) => (
                <li key={`${a.id}-${a.at}`} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{a.category}</span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
