import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { getModule } from "@/lib/modules";
import { Card, Eyebrow, Meter, Page, Ring, Sub, Title } from "@/components/vitaverse/Shell";
import { overallScore, todaysProgress, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/recovery")({
  head: () => ({
    meta: [
      { title: "Recovery Progress — Vitaverse AI" },
      { name: "description", content: "Track your recovery trend, daily and weekly progress." },
      { property: "og:title", content: "Recovery Progress — Vitaverse AI" },
      { property: "og:description", content: "Recovery trend, daily and weekly progress." },
    ],
  }),
  component: RecoveryPage,
});

function RecoveryPage() {
  const state = useVita();
  const mod = getModule(state.patient?.moduleId);
  const overall = overallScore(mod, state.indicators);
  const progress = todaysProgress(state);
  const trend = state.history.length ? state.history.slice(-7) : [{ day: "Today", value: overall }];
  const weekly = Math.round((state.activities.length / 21) * 100);

  return (
    <Page max="max-w-2xl" className="pb-28">
      <div className="vv-enter">
        <Eyebrow>{mod.name}</Eyebrow>
        <Title>Recovery</Title>
        <Sub>Based on your assessments and completed activities.</Sub>
      </div>

      <div className="mt-8 flex justify-center">
        <Ring value={overall} />
      </div>

      <Card className="mt-8">
        <p className="text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground">Recovery Trend</p>
        <div className="mt-6 flex h-32 items-end gap-3">
          {trend.map((point) => (
            <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md transition-[height] duration-700"
                style={{
                  height: `${Math.max(6, point.value)}%`,
                  background: "linear-gradient(180deg,var(--rose),var(--teal))",
                }}
              />
              <span className="text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">{point.day}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Card className="space-y-6">
          <Meter label="Today's Progress" value={(progress.done / progress.total) * 100} />
          <Meter label="Weekly Progress" value={Math.min(100, weekly)} />
        </Card>
        <Card className="space-y-6">
          <Meter label={`Activities Completed (${mod.name})`} value={Math.min(100, (state.activities.length / mod.activities.length) * 100)} />
          <Meter label="Overall Recovery" value={overall} />
        </Card>
      </div>

      <BottomNav />
    </Page>
  );
}
