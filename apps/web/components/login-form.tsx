"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@whb/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next") ?? "/parent";
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError("Email or password is incorrect.");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-unit-4">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-4 py-unit-3 text-label-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Email address</span>
        <input
          type="email"
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-on-surface font-medium">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </label>

      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? "Signing you in…" : "Sign in"}
      </Button>
    </form>
  );
}