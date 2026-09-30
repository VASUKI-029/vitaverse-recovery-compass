import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IndicatorMeters } from "@/components/vitaverse/Indicators";
import { getModule } from "@/lib/modules";
import { patientById } from "@/lib/patients";
import { Card, Eyebrow, Page, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { insightFor, overallScore, useVita } from "@/lib/vitaverse-store";

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
  const demo = patientById(patientId);
  const isActive = state.patient?.id === demo?.id;
  const mod = getModule(demo?.moduleId ?? state.patient?.moduleId);
  const values = isActive ? state.indicators : {};
  const overall = overallScore(mod, values);
  const activities = isActive ? state.activities : [];

  return (
    <Page max="max-w-4xl">
      <button
        onClick={() => navigate({ to: "/doctor" })}
        className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to Dashboard
      </button>

      <div className="vv-enter mt-8">
        <Eyebrow>{patientId} · {mod.name}</Eyebrow>
        <Title>{demo?.name ?? patientId}</Title>
        <Sub>Adaptive recovery profile generated from assessment and activity data.</Sub>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex justify-center">
          <Ring value={overall} />
        </div>
        <Card className="space-y-6">
          <IndicatorMeters mod={mod} values={values} />
        </Card>
      </div>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Clinical Insight</p>
      <Card className="mt-3">
        <p className="text-sm font-light leading-relaxed text-foreground">{isActive ? insightFor(state) : "No assessment data recorded for this patient yet."}</p>
      </Card>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Activity Log</p>
      <Card className="mt-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {activities
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
