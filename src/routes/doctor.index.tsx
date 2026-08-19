import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, Eyebrow, Meter, Page, Sub, Title } from "@/components/vitaverse/Shell";
import { computeMetrics, overallScore, resetSession, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Doctor Dashboard — Vitaverse AI" },
      { name: "description", content: "Monitor patient recovery, activity and adaptive recommendations." },
      { property: "og:title", content: "Doctor Dashboard — Vitaverse AI" },
      { property: "og:description", content: "Monitor patient recovery and activity." },
    ],
  }),
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const state = useVita();
  const navigate = useNavigate();
  const m = state.metrics ?? computeMetrics(state);
  const overall = overallScore(m);
  const assessed = Boolean(state.metrics);
  const attention = overall < 60 || m.fatigue > 65 ? 1 : 0;

  return (
    <Page max="max-w-5xl">
      <div className="vv-enter flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>DOC001 · Clinician</Eyebrow>
          <Title>Doctor Dashboard</Title>
          <Sub>Live data from your patients' Vitaverse journeys.</Sub>
        </div>
        <button
          onClick={() => {
            resetSession();
            navigate({ to: "/role" });
          }}
          className="rounded-full border border-border px-6 py-2.5 text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Logout
        </button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Patients", value: "1" },
          { label: "Active Patients", value: assessed ? "1" : "0" },
          { label: "Requiring Attention", value: String(attention) },
          { label: "Recent Activity", value: String(state.activities.length) },
        ].map((s) => (
          <Card key={s.label} className="vv-enter p-5">
            <p className="vv-display text-3xl text-foreground">{s.value}</p>
            <p className="mt-2 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Patients</p>
      <Link to="/doctor/patient/$patientId" params={{ patientId: "VT1001" }} className="mt-3 block">
        <Card interactive className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="vv-display text-2xl font-light text-foreground">{state.patient?.name ?? "Alex"}</h2>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              VT1001 · PulmoVerse
            </p>
          </div>
          <div className="w-full max-w-xs">
            <Meter label="Recovery Indicator" value={overall} />
          </div>
        </Card>
      </Link>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Recent Recovery Activity</p>
      <Card className="mt-3">
        {state.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {state.activities
              .slice()
              .reverse()
              .slice(0, 6)
              .map((a) => (
                <li key={`${a.id}-${a.at}`} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {new Date(a.at).toLocaleString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
