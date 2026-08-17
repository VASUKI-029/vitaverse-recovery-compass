import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { ACHIEVEMENTS, resetSession, streakDays, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Achievements — Vitaverse AI" },
      { name: "description", content: "Your XP, achievements and recovery streak." },
      { property: "og:title", content: "Profile & Achievements — Vitaverse AI" },
      { property: "og:description", content: "XP, achievements and recovery streak." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const state = useVita();
  const navigate = useNavigate();

  return (
    <Page max="max-w-xl" className="pb-28">
      <div className="vv-enter">
        <Eyebrow>{state.patient?.id ?? "VT1001"}</Eyebrow>
        <Title>{state.patient?.name ?? "Alex"}</Title>
        <Sub>PulmoVerse · {state.xp} XP · {streakDays(state)} day streak</Sub>
      </div>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">Achievements</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = state.achievements.includes(a.id);
          return (
            <Card key={a.id} className={unlocked ? "border-rose/60" : "opacity-60"}>
              <h2 className="vv-display text-lg font-light text-foreground">{a.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
              <p className="mt-3 text-[0.55rem] uppercase tracking-[0.24em] text-teal">
                {unlocked ? "Unlocked" : "Locked"}
              </p>
            </Card>
          );
        })}
      </div>

      <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">Completed Activities</p>
      <Card className="mt-3">
        {state.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activities completed yet.</p>
        ) : (
          <ul className="space-y-3">
            {state.activities
              .slice()
              .reverse()
              .map((a) => (
                <li key={`${a.id}-${a.at}`} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{a.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">+{a.xp} XP</span>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <div className="mt-10 flex justify-center">
        <PrimaryButton
          onClick={() => {
            resetSession();
            navigate({ to: "/role" });
          }}
        >
          Logout
        </PrimaryButton>
      </div>

      <BottomNav />
    </Page>
  );
}
