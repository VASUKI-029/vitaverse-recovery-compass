import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eyebrow, Page, PrimaryButton } from "@/components/vitaverse/Shell";
import { useVita } from "@/lib/vitaverse-store";

export const Route = createFileRoute("/patient/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to PulmoVerse — Vitaverse AI" },
      { name: "description", content: "Your PulmoVerse recovery journey begins here." },
      { property: "og:title", content: "Welcome to PulmoVerse — Vitaverse AI" },
      { property: "og:description", content: "Your recovery journey begins here." },
    ],
  }),
  component: ModuleWelcome,
});

function ModuleWelcome() {
  const navigate = useNavigate();
  const { patient } = useVita();

  return (
    <Page max="max-w-xl" className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <div className="vv-enter">
        <Eyebrow>{patient?.name ? `Hello, ${patient.name}` : "Vitaverse AI"}</Eyebrow>
        <p className="vv-display mt-8 text-sm uppercase tracking-[0.4em] text-muted-foreground">Welcome to</p>
        <h1 className="vv-display mt-3 text-[clamp(2.2rem,9vw,4.5rem)] font-light leading-none text-foreground">
          Pulmo<span className="text-rose">Verse</span>
        </h1>
        <div className="mx-auto mt-7 h-px w-24 bg-gold/60" />
        <p className="mt-6 text-sm font-light text-muted-foreground">Your recovery journey begins here.</p>
        <div className="mt-12">
          <PrimaryButton onClick={() => navigate({ to: "/patient/assessment" })}>Begin Assessment</PrimaryButton>
        </div>
      </div>
    </Page>
  );
}
