import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/vitaverse/LoginForm";

export const Route = createFileRoute("/login/admin")({
  head: () => ({
    meta: [
      { title: "Admin Login — Vitaverse AI" },
      { name: "description", content: "Administrator sign-in to manage the Vitaverse AI platform." },
      { property: "og:title", content: "Admin Login — Vitaverse AI" },
      { property: "og:description", content: "Manage the Vitaverse AI platform." },
    ],
  }),
  component: () => (
    <LoginScreen
      config={{
        title: "Admin Login",
        subtitle: "Manage the platform",
        fields: [
          { label: "Admin ID", value: "ADMIN001" },
          { label: "Password", value: "admin123", password: true },
        ],
        cta: "Sign In",
        role: "admin",
        next: "/admin",
      }}
    />
  ),
});
