import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Eyebrow, GhostLink, Page, PrimaryButton, Sub, Title } from "@/components/vitaverse/Shell";
import { findPatient } from "@/lib/patients";
import { getRecord } from "@/lib/vitaverse-db";
import { setState, type VitaState } from "@/lib/vitaverse-store";

export type LoginConfig = {
  title: string;
  subtitle: string;
  fields: [{ label: string; value: string; password?: boolean }, { label: string; value: string; password?: boolean }];
  cta: string;
  role: NonNullable<VitaState["role"]>;
  next: string;
};

export function LoginScreen({ config }: { config: LoginConfig }) {
  const navigate = useNavigate();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (config.role === "patient") {
      const p = findPatient(a, b);
      const record = p ? getRecord(p.id) : null;
      if (!p || !record) {
        setError("No patient found with that name and ID.");
        return;
      }
      setError("");
      // The assigned module always comes from the patient's stored record.
      setState({ role: "patient", patient: { name: p.name, id: p.id, moduleId: record.moduleId } });
      navigate({ to: "/patient/welcome" });
      return;
    }
    const ok =
      a.trim().toLowerCase() === config.fields[0].value.toLowerCase() &&
      b.trim().toLowerCase() === config.fields[1].value.toLowerCase();
    if (!ok) {
      setError("Those credentials don't match our demo records.");
      return;
    }
    setError("");
    setState({ role: config.role });
    navigate({ to: config.next });
  };

  return (
    <Page max="max-w-md" className="flex min-h-[100dvh] flex-col justify-center">
      <div className="vv-enter">
        <div className="text-center">
          <Eyebrow>Vitaverse AI</Eyebrow>
          <Title>{config.title}</Title>
          <Sub>{config.subtitle}</Sub>
        </div>

        <Card className="mt-9">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            {config.fields.map((field, i) => (
              <label key={field.label} className="block">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">{field.label}</span>
                <input
                  type={field.password ? "password" : "text"}
                  value={i === 0 ? a : b}
                  onChange={(e) => (i === 0 ? setA(e.target.value) : setB(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-colors duration-300 focus:border-rose"
                  placeholder={field.value}
                />
              </label>
            ))}

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PrimaryButton type="submit">{config.cta}</PrimaryButton>
              <GhostLink to="/role">Back</GhostLink>
            </div>
          </form>

          <p className="mt-6 border-t border-border pt-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Demo · {config.fields[0].value} / {config.fields[1].value}
          </p>
        </Card>
      </div>
    </Page>
  );
}
