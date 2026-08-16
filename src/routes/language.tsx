import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { setState } from "@/lib/vitaverse-store";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose Your Language — Vitaverse AI" },
      {
        name: "description",
        content: "Select your preferred language to begin your Vitaverse AI adaptive recovery experience.",
      },
      { property: "og:title", content: "Choose Your Language — Vitaverse AI" },
      { property: "og:description", content: "Select your preferred language to begin with Vitaverse AI." },
    ],
  }),
  component: LanguageSelection,
});

function LanguageSelection() {
  const [selected, setSelected] = useState("en");
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 50% 10%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-2xl animate-fade-in text-center">
        <p className="text-xs font-light uppercase tracking-[0.36em] text-muted-foreground">Vitaverse AI</p>
        <h1
          className="mt-5 text-[clamp(1.8rem,5vw,3rem)] font-light leading-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Choose your language
        </h1>
        <div className="mx-auto mt-6 h-px w-20 bg-gold/60" />

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LANGUAGES.map((lang) => {
            const active = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`group flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                  active
                    ? "border-gold bg-card shadow-[0_10px_30px_-18px_color-mix(in_oklab,var(--gold)_60%,transparent)]"
                    : "border-border bg-card/50 hover:border-gold/50"
                }`}
              >
                <span className="text-sm uppercase tracking-[0.18em] text-foreground">{lang.label}</span>
                <span className="text-base text-muted-foreground">{lang.native}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setState({ language: selected });
            navigate({ to: "/role" });
          }}
          className="mt-12 rounded-full bg-primary px-10 py-3.5 text-xs uppercase tracking-[0.3em] text-primary-foreground transition-opacity duration-300 hover:opacity-90">
          Continue
        </button>
      </div>
    </main>
  );
}
