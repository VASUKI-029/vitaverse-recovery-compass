import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { getModule } from "@/lib/modules";
import { useVita } from "@/lib/vitaverse-store";

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


function RecoveryPlan() {
  const state = useVita();
  const mod = getModule(state.patient?.moduleId);
  // Prioritise activities that train the weakest recorded indicators.
  const strength = (key: string) => {
    const ind = mod.indicators.find((i) => i.key === key);
    const v = state.indicators[key] ?? 50;
    return ind?.invert ? 100 - v : v;
  };
  const items = [...mod.activities].sort((a, b) => strength(a.indicatorKey) - strength(b.indicatorKey)).slice(0, 4);

  return (
    <Page max="max-w-2xl" className="pb-28">
      <div className="vv-enter">
        <Eyebrow>{mod.name}</Eyebrow>
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
