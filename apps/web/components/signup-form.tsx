"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@whb/ui";
import { validateSignup, type SignupInput } from "@whb/shared";

type FieldErrors = Partial<Record<keyof SignupInput | "form", string[]>>;

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof SignupInput>(key: K, value: SignupInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = validateSignup(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path[0] ?? "form") as keyof SignupInput;
        next[key] = [...(next[key] ?? []), issue.message];
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.error?.message ?? "Something went wrong. Please try again.";
        setServerError(message);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (signInResult?.error) {
        router.push("/login?next=/onboarding&signedUp=1");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim ${
      hasError ? "border-error" : "border-outline-variant"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-unit-4">
      {serverError ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-4 py-unit-3 text-label-sm text-on-error-container">
          {serverError}
        </p>
      ) : null}

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Your full name</span>
        <input
          type="text"
          autoComplete="name"
          className={inputClass(Boolean(errors.name))}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Amina Mutua"
        />
        {errors.name ? <span className="text-label-sm text-error">{errors.name[0]}</span> : null}
      </label>

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Email address</span>
        <input
          type="email"
          autoComplete="email"
          className={inputClass(Boolean(errors.email))}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@example.com"
        />
        {errors.email ? <span className="text-label-sm text-error">{errors.email[0]}</span> : null}
      </label>

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Password</span>
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass(Boolean(errors.password))}
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="At least 8 characters"
        />
        {errors.password ? <span className="text-label-sm text-error">{errors.password[0]}</span> : null}
      </label>

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Confirm password</span>
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass(Boolean(errors.confirmPassword))}
          value={values.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          placeholder="Repeat your password"
        />
        {errors.confirmPassword ? (
          <span className="text-label-sm text-error">{errors.confirmPassword[0]}</span>
        ) : null}
      </label>

      <label className="flex items-start gap-unit-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-outline-variant accent-primary"
        />
        <span className="text-body-sm text-on-surface-variant">
          I am the parent or guardian of the children I will add, and I consent to
          WhiteBoard holding their learning data in line with our{" "}
          <span className="text-primary font-medium">children&apos;s privacy</span> commitment
          (Kenya DPA 2019 principles).
        </span>
      </label>
      {errors.consent ? <span className="text-label-sm text-error">{errors.consent[0]}</span> : null}

      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? "Creating your account…" : "Create family account"}
      </Button>
    </form>
  );
}