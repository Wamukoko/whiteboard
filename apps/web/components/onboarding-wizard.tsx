"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@whb/ui";
import { CBC_PILOT_GRADE_BANDS } from "@whb/config";
import type { CreateChildInput, SelectCurriculumInput } from "@whb/shared";

interface Curriculum {
  id: string;
  code: string;
  family: "CBC" | "CAMBRIDGE";
  name: string;
}

type Step = 1 | 2 | 3;

interface FieldErrors {
  [key: string]: string[] | undefined;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [child, setChild] = useState<CreateChildInput>({
    fullName: "",
    dateOfBirth: undefined as unknown as Date,
    gender: "female",
    initials: "",
  });
  const [curriculum, setCurriculum] = useState<SelectCurriculumInput>({
    childId: "",
    curriculumCode: "CBC",
    gradeBand: "G5",
    stream: undefined,
  });
  const [familyName, setFamilyName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/curricula")
      .then((r) => r.json())
      .then((payload) => setCurricula(payload?.data?.curricula ?? []))
      .catch(() => setCurricula([]));
  }, []);

  useEffect(() => {
    fetch("/api/onboarding/family")
      .then((r) => r.json())
      .then((payload) => {
        const family = payload?.data?.family;
        if (!family) return;
        if (family.displayName) setFamilyName(family.displayName);
        // A family that already has children means this run is "add another
        // child": skip the naming step so the parent is not asked to re-create
        // a family that exists (which is what made this feel like a loop).
        if ((family.learnersCount ?? 0) > 0) setStep(2);
      })
      .catch(() => {});
  }, []);

  async function post(path: string, body: unknown): Promise<{ ok: boolean; data?: any; error?: any }> {
    setBusy(true);
    setServerError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) {
        setServerError(payload?.error?.message ?? "Something went wrong.");
        return payload;
      }
      return payload;
    } catch {
      setServerError("Could not reach the server. Check your connection and try again.");
      return { ok: false, error: { message: "network" } };
    } finally {
      setBusy(false);
    }
  }

  async function saveFamily() {
    if (!familyName.trim()) {
      setErrors({ familyName: ["Give your family a name."] });
      return false;
    }
    setErrors({});
    const res = await post("/api/onboarding/family", { displayName: familyName });
    return Boolean(res?.ok);
  }

  async function saveChild(): Promise<string | null> {
    const dobRaw = (document.getElementById("dob") as HTMLInputElement)?.value;
    const fullName = child.fullName.trim();
    if (fullName.length < 2) {
      setErrors({ fullName: ["Enter the child's full name."] });
      return null;
    }
    if (!dobRaw) {
      setErrors({ dateOfBirth: ["Select a date of birth."] });
      return null;
    }
    setErrors({});
    const res = await post("/api/onboarding/child", {
      fullName,
      dateOfBirth: new Date(dobRaw + "T00:00:00Z").toISOString(),
      gender: child.gender,
      initials: child.initials || undefined,
    });
    if (!res?.ok) return null;
    setCurriculum((c) => ({ ...c, childId: res.data.child.id }));
    return res.data.child.id;
  }

  async function saveCurriculum() {
    const res = await post("/api/onboarding/curriculum", curriculum);
    if (res?.ok) {
      router.push("/parent");
      router.refresh();
    }
  }

  const validChildId = curriculum.childId && !busy;

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-card p-unit-8 flex flex-col gap-unit-6">
      <ol className="flex items-center gap-unit-2 text-label-sm text-secondary" aria-label="Progress">
        {([1, 2, 3] as Step[]).map((s, i) => {
          const done = step > s;
          const active = step === s;
          return (
            <li key={s} className="flex items-center gap-unit-2">
              <span
                className={`flex items-center gap-unit-1 rounded-full px-unit-3 py-1 font-medium ${
                  active
                    ? "bg-primary text-on-primary"
                    : done
                      ? "bg-grow-green/15 text-grow-green"
                      : "text-on-surface-variant"
                }`}
              >
                {done ? <Icon name="check" size={14} /> : <span>{i + 1}</span>}
                {s === 1 ? "Family" : s === 2 ? "Child" : "Curriculum"}
              </span>
              {s < 3 ? <span className="w-4 h-px bg-outline-variant" /> : null}
            </li>
          );
        })}
      </ol>

      {serverError ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-4 py-unit-3 text-label-sm text-on-error-container">
          {serverError}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-unit-4">
          <div className="flex flex-col gap-unit-2">
            <h2 className="font-display text-headline-sm text-on-surface">Name your family</h2>
            <p className="text-body-sm text-on-surface-variant">
              Your family is the private home for your children&apos;s learning data. Only people you add can see it.
            </p>
          </div>
          <label className="flex flex-col gap-unit-2">
            <span className="text-label-sm text-on-surface font-medium">Family name</span>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Mutua Family"
            />
            {errors.familyName ? <span className="text-label-sm text-error">{errors.familyName[0]}</span> : null}
          </label>
          <Button
            size="lg"
            fullWidth
            onClick={() => void saveFamily().then((ok) => ok && setStep(2))}
            disabled={busy}
          >
            Continue · Add a child
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-unit-4">
          <div className="flex flex-col gap-unit-2">
            <h2 className="font-display text-headline-sm text-on-surface">Who is learning?</h2>
            <p className="text-body-sm text-on-surface-variant">
              Add your child&apos;s profile. You can add more children anytime.
            </p>
          </div>

          <label className="flex flex-col gap-unit-2">
            <span className="text-label-sm text-on-surface font-medium">Full name</span>
            <input
              className={`w-full rounded-lg border bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim ${
                errors.fullName ? "border-error" : "border-outline-variant"
              }`}
              value={child.fullName}
              onChange={(e) => setChild((c) => ({ ...c, fullName: e.target.value }))}
              placeholder="e.g. Amina Mutua"
            />
            {errors.fullName ? <span className="text-label-sm text-error">{errors.fullName[0]}</span> : null}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-4">
            <label className="flex flex-col gap-unit-2">
              <span className="text-label-sm text-on-surface font-medium">Date of birth</span>
              <input
                id="dob"
                type="date"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              />
              {errors.dateOfBirth ? <span className="text-label-sm text-error">{errors.dateOfBirth[0]}</span> : null}
            </label>
            <label className="flex flex-col gap-unit-2">
              <span className="text-label-sm text-on-surface font-medium">Gender</span>
              <select
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
                value={child.gender}
                onChange={(e) => setChild((c) => ({ ...c, gender: e.target.value as CreateChildInput["gender"] }))}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </label>
          </div>

          <Button size="lg" fullWidth onClick={() => saveChild().then((id) => id && setStep(3))} disabled={busy}>
            Add child · Choose curriculum
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-unit-4">
          <div className="flex flex-col gap-unit-2">
            <h2 className="font-display text-headline-sm text-on-surface">Pick a curriculum</h2>
            <p className="text-body-sm text-on-surface-variant">
              Learners can combine curricula (e.g., CBC + Cambridge). We start with one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-4">
            {curricula
              .filter((c) => c.family === "CBC" || c.family === "CAMBRIDGE")
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setCurriculum((prev) => ({ ...prev, curriculumCode: c.code as "CBC" | "CAMBRIDGE" }))
                  }
                  className={`flex flex-col gap-unit-2 rounded-xl border-2 p-unit-4 text-left transition-colors ${
                    curriculum.curriculumCode === c.code
                      ? "border-primary bg-primary-fixed/40"
                      : "border-outline-variant bg-surface-container-lowest hover:border-outline"
                  }`}
                >
                  <span className="font-display text-headline-sm text-on-surface">{c.code}</span>
                  <span className="text-body-sm text-on-surface-variant">{c.name}</span>
                </button>
              ))}
          </div>

          {curriculum.curriculumCode === "CBC" ? (
            <label className="flex flex-col gap-unit-2">
              <span className="text-label-sm text-on-surface font-medium">Grade band</span>
              <select
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
                value={curriculum.gradeBand}
                onChange={(e) => setCurriculum((c) => ({ ...c, gradeBand: e.target.value }))}
              >
                {CBC_PILOT_GRADE_BANDS.map((band) => (
                  <option key={band.band} value={band.band}>
                    {band.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-unit-2">
              <span className="text-label-sm text-on-surface font-medium">Stream</span>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
                value={curriculum.stream ?? ""}
                onChange={(e) => setCurriculum((c) => ({ ...c, stream: e.target.value || undefined }))}
                placeholder="e.g. IGCSE"
              />
            </label>
          )}

          <Button size="lg" fullWidth onClick={saveCurriculum} disabled={busy || !validChildId}>
            Finish · Open the dashboard
          </Button>
        </div>
      ) : null}

      {step > 1 ? (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep((s) => (s - 1) as Step);
              setServerError(null);
            }}
            className="text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back
          </button>
        </div>
      ) : null}
    </div>
  );
}