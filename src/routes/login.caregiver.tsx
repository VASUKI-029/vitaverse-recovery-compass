import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/vitaverse/LoginForm";

export const Route = createFileRoute("/login/caregiver")({
  head: () => ({
    meta: [
      { title: "Caregiver Login — Vitaverse AI" },
      { name: "description", content: "Caregiver sign-in to support daily recovery." },
      { property: "og:title", content: "Caregiver Login — Vitaverse AI" },
      { property: "og:description", content: "Support daily recovery with Vitaverse AI." },
    ],
  }),
  component: () => (
    <LoginScreen
      config={{
        title: "Caregiver / Guardian Login",
        subtitle: "Support daily recovery",
        fields: [
          { label: "Caregiver ID", value: "CG001" },
          { label: "Password", value: "caregiver123", password: true },
        ],
        cta: "Sign In",
        role: "caregiver",
        next: "/caregiver",
      }}
    />
  ),
});
