import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IndicatorMeters } from "@/components/vitaverse/Indicators";
import { getModule } from "@/lib/modules";
import { Card, Eyebrow, Page, Sub, Title } from "@/components/vitaverse/Shell";
import { insightFor, overallScore, resetSession, streakDays, todaysProgress, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/caregiver")({
  head: () => ({
    meta: [
      { title: "Caregiver Dashboard — Vitaverse AI" },
      { name: "description", content: "Follow your loved one's recovery progress, activities and daily adherence." },
      { property: "og:title", content: "Caregiver Dashboard — Vitaverse AI" },
      { property: "og:description", content: "Follow recovery progress and daily adherence." },
    ],
  }),
  component: CaregiverDashboard,
});

function CaregiverDashboard() {
  const state = useVita();
  const navigate = useNavigate();
  const mod = getModule(state.patient?.moduleId);
  const overall = overallScore(mod, state.indicators);
  const progress = todaysProgress(state);

  return (
    <Page max="max-w-3xl">
      <div className="vv-enter flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>CG001 · Caregiver</Eyebrow>
          <Title>Caregiver Dashboard</Title>
          <Sub>Supporting {state.patient?.name ?? "Alex"} through {mod.name} recovery.</Sub>
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

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Recovery", value: `${overall}%` },
          { label: "Today", value: `${progress.done} / ${progress.total}` },
          { label: "Streak", value: `${streakDays(state)}d` },
        ].map((s) => (
          <Card key={s.label} className="vv-enter p-5 text-center">
            <p className="vv-display text-3xl text-foreground">{s.value}</p>
            <p className="mt-2 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 space-y-6">
        <IndicatorMeters mod={mod} values={state.indicators} />
      </Card>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Support Note</p>
      <Card className="mt-3">
        <p className="text-sm font-light leading-relaxed text-foreground">{insightFor(state)}</p>
      </Card>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Recent Activities</p>
      <Card className="mt-3">
        {state.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities completed yet today.</p>
        ) : (
          <ul className="space-y-3">
            {state.activities
              .slice()
              .reverse()
              .slice(0, 8)
              .map((a) => (
                <li key={`${a.id}-${a.at}`} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {new Date(a.at).toLocaleDateString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}
