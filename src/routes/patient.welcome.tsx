import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getModule } from "@/lib/modules";
import { Card, Eyebrow, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { useDB } from "@/lib/vitaverse-db";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Your Module — Vitaverse AI" },
      { name: "description", content: "Your assigned Vitaverse recovery module welcome." },
      { property: "og:title", content: "Welcome to Your Module — Vitaverse AI" },
      { property: "og:description", content: "Your recovery journey begins here." },
    ],
  }),
  component: ModuleWelcome,
});

function ModuleWelcome() {
  const navigate = useNavigate();
  const session = useVita();
  const record = useDB().records[session.patient?.id ?? ""] ?? null;
  const mod = getModule(record?.moduleId ?? session.patient?.moduleId);
  const baselineReady = record?.baseline.status === "completed";

  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <div className="vv-enter">
        <Eyebrow>{record ? `Assigned by ${record.doctor}` : "Vitaverse AI"}</Eyebrow>
        <p className="vv-display mt-8 text-sm uppercase tracking-[0.4em] text-muted-foreground">Welcome to</p>
        <h1 className="vv-display mt-3 text-[clamp(2.2rem,9vw,4.5rem)] font-light leading-none text-foreground">
          {mod.prefix}
          <span className="text-rose">{mod.suffix}</span>
        </h1>
        <div className="mx-auto mt-7 h-px w-24 bg-gold/60" />
        <p className="mt-6 text-sm font-light text-muted-foreground">{mod.welcome}</p>
        <p className="mt-2 text-[0.62rem] uppercase tracking-[0.28em] text-teal">
          Let's enter into a world of experience &amp; joy
        </p>
        <div className="mt-12">
          <PrimaryButton onClick={() => navigate({ to: baselineReady ? "/patient/home" : "/patient/assessment" })}>
            {baselineReady ? "Enter Your Recovery Home" : "Begin Baseline Assessment"}
          </PrimaryButton>
        </div>
        <Card className="mt-10 text-left">
          <p className="text-[0.6rem] uppercase tracking-[0.26em] text-muted-foreground">Your Assigned Universe</p>
          <p className="mt-2 text-sm font-light text-foreground">
            {mod.name} · {mod.purpose}
          </p>
          {record ? (
            <p className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
              Assigned by {record.doctor} · {record.diagnosis}
            </p>
          ) : null}
        </Card>
      </div>
    </Page>
  );
}
