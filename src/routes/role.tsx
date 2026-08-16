import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, HeartPulse, ShieldCheck, Stethoscope, User } from "lucide-react";
import { Card, Eyebrow, Page, Sub, Title } from "@/components/vitaverse/Shell";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "Choose Your Portal — Vitaverse AI" },
      { name: "description", content: "Select your Vitaverse AI portal: patient, doctor, caregiver or admin." },
      { property: "og:title", content: "Choose Your Portal — Vitaverse AI" },
      { property: "og:description", content: "Patient, doctor, caregiver and admin portals for adaptive recovery." },
    ],
  }),
  component: RoleSelection,
});

const ROLES = [
  { to: "/login/patient", icon: User, title: "Patient", desc: "Your recovery journey", cta: "Continue as Patient" },
  {
    to: "/login/doctor",
    icon: Stethoscope,
    title: "Doctor / Therapist",
    desc: "Monitor and guide recovery",
    cta: "Continue as Doctor",
  },
  {
    to: "/login/caregiver",
    icon: HeartPulse,
    title: "Caregiver / Guardian",
    desc: "Support daily recovery",
    cta: "Continue as Caregiver",
  },
  { to: "/login/admin", icon: ShieldCheck, title: "Admin", desc: "Manage the platform", cta: "Continue as Admin" },
];

function RoleSelection() {
  return (
    <Page>
      <div className="text-center vv-enter">
        <Eyebrow>Vitaverse AI</Eyebrow>
        <Title>Welcome to Vitaverse AI</Title>
        <Sub>Choose your portal</Sub>
        <div className="mx-auto mt-6 h-px w-20 bg-gold/60" />
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {ROLES.map((role, i) => (
          <Link key={role.to} to={role.to} className="vv-enter block" style={{ animationDelay: `${120 + i * 90}ms` }}>
            <Card interactive className="group h-full">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, color-mix(in oklab, var(--teal) 16%, transparent), color-mix(in oklab, var(--rose) 22%, transparent))",
                }}
              >
                <role.icon className="h-5 w-5 text-teal" strokeWidth={1.4} />
              </div>
              <h2 className="vv-display mt-5 text-2xl font-light text-foreground">{role.title}</h2>
              <p className="mt-1 text-sm font-light text-muted-foreground">{role.desc}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-teal transition-transform duration-300 group-hover:translate-x-1">
                {role.cta}
                <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </Page>
  );
}
