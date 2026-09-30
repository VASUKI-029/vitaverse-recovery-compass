import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, Eyebrow, Meter, Page, Sub, Title } from "@/components/vitaverse/Shell";
import { CATEGORIES } from "@/lib/activities";
import { getModule, MODULES } from "@/lib/modules";
import { DEMO_PATIENTS } from "@/lib/patients";
import { overallScore, resetSession, useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Vitaverse AI" },
      { name: "description", content: "Platform overview: users, modules, engagement and system status." },
      { property: "og:title", content: "Admin Dashboard — Vitaverse AI" },
      { property: "og:description", content: "Platform overview: users, modules and engagement." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const state = useVita();
  const navigate = useNavigate();
  const mod = getModule(state.patient?.moduleId);
  const engagement = Math.min(100, state.activities.length * 12);

  return (
    <Page max="max-w-5xl">
      <div className="vv-enter flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>ADMIN001 · Platform</Eyebrow>
          <Title>Admin Dashboard</Title>
          <Sub>Vitaverse AI system overview.</Sub>
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
          { label: "Patients", value: String(DEMO_PATIENTS.length) },
          { label: "Clinicians", value: "1" },
          { label: "Caregivers", value: "1" },
          { label: "Active Modules", value: String(MODULES.length) },
        ].map((s) => (
          <Card key={s.label} className="vv-enter p-5">
            <p className="vv-display text-3xl text-foreground">{s.value}</p>
            <p className="mt-2 text-[0.55rem] uppercase tracking-[0.22em] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card className="space-y-6">
          <p className="text-[0.6rem] uppercase tracking-[0.26em] text-teal">Engagement</p>
          <Meter label="Platform Engagement" value={engagement} />
          <Meter label="Average Recovery Index" value={overallScore(mod, state.indicators)} />
        </Card>
        <Card>
          <p className="text-[0.6rem] uppercase tracking-[0.26em] text-teal">Modules</p>
          <ul className="mt-4 space-y-3 text-sm">
            {MODULES.map((mm) => (
              <li key={mm.id} className="flex items-center justify-between">
                <span className="text-foreground">{mm.name}</span>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {DEMO_PATIENTS.filter((p) => p.moduleId === mm.id).map((p) => p.name).join(", ")} · Live
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">Activity Categories</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <Card key={c} className="p-4 text-center">
            <p className="vv-display text-xl text-foreground">
              {state.activities.filter((a) => a.category === c).length}
            </p>
            <p className="mt-1 text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">{c}</p>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-[0.6rem] uppercase tracking-[0.28em] text-teal">System Status</p>
      <Card className="mt-3">
        <p className="text-sm font-light text-foreground">
          All services operational · Local data persistence active · Adaptive engine v1.0
        </p>
      </Card>
    </Page>
  );
}
