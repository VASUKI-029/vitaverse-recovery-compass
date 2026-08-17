import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { findActivity } from "@/lib/activities";
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
  const activity = findActivity(activityId);
  const [progress, setProgress] = useState(0);
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
    if (done) return;
    completeActivity({ id: activity.id, title: activity.title, category: activity.category });
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

        <div className="relative mt-12 flex h-60 w-60 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, color-mix(in oklab, var(--teal) 16%, transparent), transparent 68%)",
              transform: `scale(${0.85 + progress / 200})`,
              transition: "transform 900ms cubic-bezier(0.37,0,0.63,1)",
            }}
          />
          <button
            onClick={() => setProgress((p) => Math.min(100, p + 25))}
            disabled={done}
            className="vv-display relative h-40 w-40 rounded-full border border-rose/50 text-lg uppercase tracking-[0.24em] text-foreground transition-transform duration-300 active:scale-95 disabled:opacity-60"
          >
            {done ? "Complete" : progress >= 100 ? "Ready" : "Tap"}
          </button>
          {xpBurst ? (
            <span
              className="vv-display absolute -top-4 text-2xl text-rose"
              style={{ animation: "vv-pop 1200ms ease-out both" }}
            >
              +30 XP
            </span>
          ) : null}
        </div>

        <div className="mt-10 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,var(--teal),var(--rose))" }}
          />
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
            <PrimaryButton disabled={progress < 100} onClick={finish}>
              Complete
            </PrimaryButton>
          )}
        </div>
      </div>
    </Page>
  );
}
