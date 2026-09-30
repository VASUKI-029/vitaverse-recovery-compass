import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { TaskRunner, type TaskResult } from "@/components/vitaverse/tasks";
import { findModuleActivity, getModule } from "@/lib/modules";
import { ACHIEVEMENTS, completeActivity, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/activity/$activityId")({
  head: () => ({
    meta: [
      { title: "Recovery Activity — Vitaverse AI" },
      { name: "description", content: "Complete a guided Vitaverse AI recovery activity." },
      { property: "og:title", content: "Recovery Activity — Vitaverse AI" },
      { property: "og:description", content: "Complete a guided recovery activity." },
    ],
  }),
  component: ActivityScreen,
});

function ActivityScreen() {
  const { activityId } = Route.useParams();
  const navigate = useNavigate();
  const state = useVita();
  const mod = getModule(state.patient?.moduleId);
  const activity = findModuleActivity(mod, activityId);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [earned, setEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [xpBurst, setXpBurst] = useState(false);
  const [unlocked, setUnlocked] = useState<string | null>(null);

  useEffect(() => {
    if (!done) return;
    const before = state.achievements;
    setXpBurst(true);
    const t = setTimeout(() => setXpBurst(false), 1200);
    const fresh = ACHIEVEMENTS.find((a) => !before.includes(a.id));
    if (fresh) setUnlocked(fresh.name);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!activity) {
    return (
      <Page max="max-w-md" className="flex min-h-[100dvh] items-center justify-center">
        <Card className="text-center">
          <p className="text-sm text-muted-foreground">Activity not found.</p>
          <div className="mt-6">
            <PrimaryButton onClick={() => navigate({ to: "/patient/activities" })}>Back to Activities</PrimaryButton>
          </div>
        </Card>
      </Page>
    );
  }

  const finish = () => {
    if (done || !result) return;
    completeActivity({
      id: activity.id,
      title: activity.title,
      category: activity.category,
      indicatorKey: activity.indicatorKey,
      score: result.score,
    });
    setEarned(30 + Math.round(result.score / 5));
    setDone(true);
  };

  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/patient/activities" })}
          className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back
        </button>
        <span className="text-[0.62rem] uppercase tracking-[0.26em] text-muted-foreground">{activity.category}</span>
      </div>

      <div className="vv-enter mt-12 flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="vv-display text-[clamp(1.6rem,5vw,2.4rem)] font-light text-foreground">{activity.title}</h1>
        <p className="mt-3 text-sm font-light text-muted-foreground">{activity.instruction}</p>

        <div className="relative mt-10 w-full">
          {!done ? (
            <TaskRunner key={activity.id} spec={activity.task} accessible={mod.accessible} onResult={setResult} />
          ) : null}
          {xpBurst ? (
            <span
              className="vv-display absolute left-1/2 top-0 -translate-x-1/2 text-2xl text-rose"
              style={{ animation: "vv-pop 1200ms ease-out both" }}
            >
              +{earned} XP
            </span>
          ) : null}
        </div>

        {done ? (
          <Card className="mt-10 w-full text-center">
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-teal">Recovery Profile Updated</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your latest activity has been added to your recovery profile.
            </p>
            {unlocked ? (
              <p className="vv-display mt-4 text-lg text-rose">Achievement unlocked · {unlocked}</p>
            ) : null}
            <p className="mt-3 text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
              Total XP · {state.xp}
            </p>
          </Card>
        ) : null}

        <div className="mt-10 flex flex-wrap justify-center gap-3 pb-12">
          {done ? (
            <>
              <PrimaryButton onClick={() => navigate({ to: "/patient/twin" })}>View Digital Twin</PrimaryButton>
              <button
                onClick={() => navigate({ to: "/patient/home" })}
                className="rounded-full border border-border px-7 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Close
              </button>
            </>
          ) : (
            <PrimaryButton disabled={!result} onClick={finish}>
              Complete
            </PrimaryButton>
          )}
        </div>
      </div>
    </Page>
  );
}
