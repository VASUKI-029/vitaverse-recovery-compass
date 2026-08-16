import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vitaverse AI — Adaptive Recovery Intelligence" },
      {
        name: "description",
        content:
          "Vitaverse AI delivers AI-powered adaptive recovery, personalising every step of your rehabilitation journey.",
      },
      { property: "og:title", content: "Vitaverse AI — Adaptive Recovery Intelligence" },
      {
        property: "og:description",
        content: "AI-powered adaptive recovery, personalised to how your body responds.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), 2200);
    const go = setTimeout(() => navigate({ to: "/language" }), 3000);
    return () => {
      clearTimeout(out);
      clearTimeout(go);
    };
  }, [navigate]);

  return (
    <main
      className={`relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-6 transition-opacity duration-[800ms] ease-out ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* soft ambient gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 38%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%), radial-gradient(50% 40% at 78% 82%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 72%)",
          animation: "splash-soft-in 900ms ease-out both",
        }}
      />

      {/* thin curved orbital lines — digital twin hint */}
      <svg
        aria-hidden
        viewBox="0 0 600 600"
        className="pointer-events-none absolute h-[min(120vw,760px)] w-[min(120vw,760px)] opacity-40"
        style={{ animation: "splash-halo 2400ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <defs>
          <linearGradient id="vv-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="45%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="text-gold" fill="none" stroke="url(#vv-line)" strokeWidth="0.8">
          <circle cx="300" cy="300" r="150" />
          <circle cx="300" cy="300" r="212" />
          <ellipse cx="300" cy="300" rx="260" ry="150" transform="rotate(24 300 300)" />
          <ellipse cx="300" cy="300" rx="260" ry="150" transform="rotate(-24 300 300)" />
        </g>
      </svg>

      {/* faint particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          [18, 62, 0],
          [32, 28, 400],
          [47, 78, 900],
          [63, 34, 250],
          [78, 66, 700],
          [88, 42, 1100],
        ].map(([left, top, delay]) => (
          <span
            key={`${left}-${top}`}
            className="absolute h-1 w-1 rounded-full bg-gold"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              opacity: 0,
              animation: `splash-drift 3200ms ${delay}ms ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center" style={{ animation: "splash-breathe 2600ms 1400ms ease-in-out" }}>
        <h1 className="splash-title text-[clamp(2.1rem,8vw,4.75rem)] font-light uppercase leading-none tracking-[0.3em] text-foreground">
          Vitaverse<span className="ml-3 text-gold">AI</span>
        </h1>

        <div
          className="mx-auto mt-7 h-px w-24 origin-center bg-gold/60 sm:w-32"
          style={{ animation: "splash-rule 900ms 700ms cubic-bezier(0.16,1,0.3,1) both" }}
        />

        <p
          className="mt-6 text-[clamp(0.7rem,2.6vw,0.95rem)] font-light uppercase tracking-[0.36em] text-muted-foreground"
          style={{ animation: "splash-soft-in 900ms 800ms ease-out both" }}
        >
          AI-Powered Adaptive Recovery
        </p>
      </div>
    </main>
  );
}
