import { Link } from "@tanstack/react-router";
import { Activity, CircleUser, Home, Orbit, Sparkles } from "lucide-react";

const ITEMS = [
  { to: "/patient/home", label: "Home", icon: Home },
  { to: "/patient/recovery", label: "Recovery", icon: Sparkles },
  { to: "/patient/activities", label: "Activities", icon: Activity },
  { to: "/patient/twin", label: "Digital Twin", icon: Orbit },
  { to: "/patient/profile", label: "Profile", icon: CircleUser },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-2">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "text-teal" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 transition-colors duration-300"
          >
            <item.icon className="h-4.5 w-4.5" strokeWidth={1.5} />
            <span className="text-[0.55rem] uppercase tracking-[0.14em]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
