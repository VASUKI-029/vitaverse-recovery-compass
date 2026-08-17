import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { ACTIVITIES } from "@/lib/activities";

export const Route = createFileRoute("/patient/plan")({
  head: () => ({
    meta: [
      { title: "Your Recovery Plan — Vitaverse AI" },
      { name: "description", content: "Personalized activities based on your current recovery profile." },
      { property: "og:title", content: "Your Recovery Plan — Vitaverse AI" },
      { property: "og:description", content: "Personalized recovery activities." },
    ],
  }),
  component: RecoveryPlan,
});

const PLAN_IDS = ["guided-breathing", "relaxation", "focus-challenge", "daily-goal"];

function RecoveryPlan() {
  const items = PLAN_IDS.map((id) => ACTIVITIES.find((a) => a.id === id)!).filter(Boolean);

  return (
    <Page max="max-w-2xl" className="pb-28">
      <div className="vv-enter">
        <Eyebrow>PulmoVerse</Eyebrow>
        <Title>Your Recovery Plan</Title>
        <Sub>Personalized activities based on your current recovery profile.</Sub>
      </div>

      <div className="mt-10 grid gap-4">
        {items.map((a, i) => (
          <Link
            key={a.id}
            to="/patient/activity/$activityId"
            params={{ activityId: a.id }}
            className="vv-enter"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Card interactive className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.26em] text-teal">{a.category}</p>
                <h2 className="vv-display mt-2 text-xl font-light text-foreground">{a.title}</h2>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{a.minutes} min</span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/patient/home">
          <PrimaryButton>Go to Home</PrimaryButton>
        </Link>
      </div>
      <BottomNav />
    </Page>
  );
}
