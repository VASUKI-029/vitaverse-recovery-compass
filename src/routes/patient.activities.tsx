import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/vitaverse/BottomNav";
import { Card, Eyebrow, Page, Sub, Title } from "@/components/vitaverse/Shell";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/activities")({
  head: () => ({
    meta: [
      { title: "Activities — Vitaverse AI" },
      { name: "description", content: "Breathing, cognitive, mental wellness, functional and game-based activities." },
      { property: "og:title", content: "Activities — Vitaverse AI" },
      { property: "og:description", content: "Your full library of recovery activities." },
    ],
  }),
  component: Activities;
});

function Activities() {
  const state = useVita();
  const done = new Set(state.activities.map((a) => a.id));

  return (
    <Page max="max-w-2xl" className="pb-28">
      <div className="vv-enter">
        <Eyebrow>PulmoVerse</Eyebrow>
        <Title>Activities</Title>
        <Sub>Choose an activity to begin.</Sub>
      </div>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="mt-10">
          <p className="text-[0.6rem] uppercase tracking-[0.28em] text-teal">{cat}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ACTIVITIES.filter((a) => a.category === cat).map((a) => (
              <Link key={a.id} to="/patient/activity/$activityId" params={{ activityId: a.id }}>
                <Card interactive className="flex h-full items-center justify-between p-5">
                  <div>
                    <h2 className="vv-display text-lg font-light text-foreground">{a.title}</h2>
                    <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {a.minutes} min {done.has(a.id) ? "· Completed" : ""}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <BottomNav />
    </Page>
  );
}
