import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Page, PrimaryButton, Title } from "@/components/vitaverse/Shell";
import { ACTIVITIES } from "@/lib/activities";
import { computeMetrics, insightFor, overallScore, streakDays, todaysProgress, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/home")({
  head: () => ({
    meta: [
      { title: "Patient Home — Vitaverse AI" },
      { name: "description", content: "Your daily recovery snapshot, next activity and personalised insight." },
      { property: "og:title", content: "Patient Home — Vitaverse AI" },
      { property: "og:description", content: "Your daily recovery snapshot and next activity." },
    ],
  }),
  component: PatientHome,
});

function PatientHome() {
  const state = useVita();
  const navigate = useNavigate();
  const m = state.metrics ?? computeMetrics(state);
  const overall = overallScore(m);
  const progress = todaysProgress(state);
  const doneIds = new Set(state.activities.map((a) => a.id));
  const next = ACTIVITIES.find((a) => !doneIds.has(a.id)) ?? ACTIVITIES[0]!;

  return (
    <Page max="max-w-lg" className="pb-28">
      <div className="vv-enter flex items-start justify-between">
        <div>
          <Eyebrow>PulmoVerse</Eyebrow>
          <Title className="mt-2 text-3xl">Good morning, {state.patient?.name ?? "Alex"}</Title>
        </div>
        <span className="vv-display mt-2 rounded-full border border-border px-3 py-1 text-xs text-teal">
          {state.xp} XP
        </span>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "Recovery", value: `${overall}%` },
          { label: "Today", value: `${progress.done} / ${progress.total}` },
          { label: "Streak", value: `${streakDays(state)}d` },
        ].map((s, i) => (
          <Card key={s.label} className="vv-enter p-4 text-center" >
            <p className="vv-display text-2xl text-foreground" style={{ animationDelay: `${i * 60}ms` }}>{s.value}</p>
            <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">Next Activity</p>
      <Link to="/patient/activity/$activityId" params={{ activityId: next.id }}>
        <Card interactive className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.24em] text-teal">{next.category}</p>
            <h2 className="vv-display mt-2 text-2xl font-light text-foreground">{next.title}</h2>
          </div>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{next.minutes} min</span>
        </Card>
      </Link>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">Recovery Insight</p>
      <Card className="mt-3">
        <p className="text-sm font-light leading-relaxed text-foreground">{insightFor(state)}</p>
      </Card>

      <div className="mt-10 flex justify-center">
        <PrimaryButton onClick={() => navigate({ to: "/patient/plan" })}>View Recovery Plan</PrimaryButton>
      </div>

      <BottomNav />
    </Page>
  );
}
