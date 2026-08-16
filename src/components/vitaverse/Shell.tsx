import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Page({
  children,
  className = "",
  max = "max-w-5xl",
}: {
  children: ReactNode;
  className?: string;
  max?: string;
}) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 35% at 50% 0%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 70%), radial-gradient(50% 35% at 90% 100%, color-mix(in oklab, var(--teal) 9%, transparent), transparent 72%)",
        }}
      />
      <div className={`relative mx-auto w-full ${max} px-5 py-10 sm:px-8 ${className}`}>{children}</div>
    </main>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[0.65rem] font-light uppercase tracking-[0.36em] text-muted-foreground">{children}</p>;
}

export function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={`vv-display mt-4 text-[clamp(1.7rem,4.5vw,2.75rem)] font-light leading-tight text-foreground ${className}`}>
      {children}
    </h1>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm font-light text-muted-foreground">{children}</p>;
}

export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card/70 p-6 shadow-[0_18px_45px_-34px_color-mix(in_oklab,var(--teal)_70%,transparent)] backdrop-blur-sm ${
        interactive ? "transition-all duration-300 hover:-translate-y-1 hover:border-rose/60" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-primary px-9 py-3.5 text-xs uppercase tracking-[0.28em] text-primary-foreground transition-all duration-300 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-full border border-border px-6 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground transition-colors duration-300 hover:border-rose/60 hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export function Meter({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className="vv-display text-lg text-foreground">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-[1200ms] ease-out"
          style={{
            width: `${Math.max(2, Math.min(100, value))}%`,
            background: "linear-gradient(90deg, var(--teal), var(--rose))",
          }}
        />
      </div>
    </div>
  );
}

export function Ring({ value, size = 168 }: { value: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          style={{
            ["--dash-from" as string]: `${c}`,
            ["--dash-to" as string]: `${c - (c * Math.min(100, value)) / 100}`,
            strokeDashoffset: c - (c * Math.min(100, value)) / 100,
            animation: "vv-ring 1400ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--teal)" />
            <stop offset="100%" stopColor="var(--rose)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="vv-display text-4xl text-foreground">{Math.round(value)}%</span>
        <span className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">Recovery</span>
      </div>
    </div>
  );
}
