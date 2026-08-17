import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/vitaverse/LoginForm";

export const Route = createFileRoute("/login/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor Login — Vitaverse AI" },
      { name: "description", content: "Clinician sign-in to monitor and guide patient recovery." },
      { property: "og:title", content: "Doctor Login — Vitaverse AI" },
      { property: "og:description", content: "Monitor and guide recovery with Vitaverse AI." },
    ],
  }),
  component: () => (
    <LoginScreen
      config={{
        title: "Doctor / Therapist Login",
        subtitle: "Monitor and guide recovery",
        fields: [
          { label: "Doctor ID", value: "DOC001" },
          { label: "Password", value: "doctor123", password: true },
        ],
        cta: "Sign In",
        role: "doctor",
        next: "/doctor",
      }}
    />
  ),
});
