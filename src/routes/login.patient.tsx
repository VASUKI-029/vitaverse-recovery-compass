import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/vitaverse/LoginForm";

export const Route = createFileRoute("/login/patient")({
  head: () => ({
    meta: [
      { title: "Patient Login — Vitaverse AI" },
      { name: "description", content: "Sign in to begin your Vitaverse AI recovery journey." },
      { property: "og:title", content: "Patient Login — Vitaverse AI" },
      { property: "og:description", content: "Begin your adaptive recovery journey." },
    ],
  }),
  component: () => (
    <LoginScreen
      config={{
        title: "Patient Login",
        subtitle: "Begin your recovery journey",
        fields: [
          { label: "Patient Name", value: "Alex" },
          { label: "Patient ID", value: "VT1001" },
        ],
        cta: "Continue",
        role: "patient",
        next: "/patient/welcome",
      }}
    />
  ),
});
