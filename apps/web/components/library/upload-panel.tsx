"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@whb/ui";

interface LearnerOption {
  id: string;
  fullName: string;
}

interface ApiError {
  error?: { message?: string };
}

const QUESTION_COUNTS = [5, 10, 15];
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export function UploadPanel({
  learners,
  creditsUsed,
  creditsLimit,
}: {
  learners: LearnerOption[];
  creditsUsed: number;
  creditsLimit: number;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [learnerId, setLearnerId] = useState(learners[0]?.id ?? "");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("MEDIUM");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const atCap = creditsUsed >= creditsLimit;

  async function readError(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as ApiError;
      return body.error?.message ?? `Request failed (${response.status}).`;
    } catch {
      return `Request failed (${response.status}).`;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!learnerId) {
      setError("Choose which learner this worksheet is for.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("learnerId", learnerId);

      const upload = await fetch("/api/materials", { method: "POST", body: form });
      if (!upload.ok) {
        setError(await readError(upload));
        return;
      }
      const uploaded = (await upload.json()) as { data: { material: { id: string } } };

      const generate = await fetch("/api/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceMaterialId: uploaded.data.material.id,
          learnerId,
          questionCount,
          difficulty,
          model: "claude-sonnet-5",
        }),
      });
      if (!generate.ok) {
        setError(await readError(generate));
        return;
      }
      const generated = (await generate.json()) as {
        data: { queued: boolean; content: { failureReason?: string | null } };
      };

      if (generated.data.queued) {
        setNotice("Uploaded. Your quiz is being generated — it will appear below for review.");
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setError(
          generated.data.content.failureReason ??
            "The quiz could not be queued. Please try again shortly.",
        );
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-3 py-unit-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-unit-4">
      <div className="flex items-center gap-unit-3">
        <div className="w-10 h-10 rounded-full bg-primary-fixed/60 flex items-center justify-center text-on-primary-fixed-variant">
          <Icon name="upload_file" size={22} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-display text-headline-sm text-on-surface">Upload a worksheet</h2>
          <p className="text-body-sm text-on-surface-variant">
            PDF, photo, or text — WhiteBoard drafts a quiz you review before a learner sees it.
          </p>
        </div>
        <span className="ml-auto text-label-sm text-secondary whitespace-nowrap">
          {creditsUsed}/{creditsLimit} credits
        </span>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-4 py-unit-3 text-label-sm text-on-error-container">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-lg bg-secondary-container px-unit-4 py-unit-3 text-label-sm text-on-secondary-container">
          {notice}
        </p>
      ) : null}

      <div className="grid md:grid-cols-2 gap-unit-4">
        <label className="flex flex-col gap-unit-2 md:col-span-2">
          <span className="text-label-sm text-on-surface font-medium">Worksheet file</span>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,text/plain"
            className="text-body-sm text-on-surface-variant file:mr-unit-3 file:rounded file:border-0 file:bg-primary-container file:px-unit-4 file:py-unit-2 file:text-on-primary file:text-label-sm cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-unit-2">
          <span className="text-label-sm text-on-surface font-medium">For learner</span>
          <select
            className={fieldClass}
            value={learnerId}
            onChange={(event) => setLearnerId(event.target.value)}
          >
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.fullName}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-unit-4">
          <label className="flex flex-col gap-unit-2">
            <span className="text-label-sm text-on-surface font-medium">Questions</span>
            <select
              className={fieldClass}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
            >
              {QUESTION_COUNTS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-unit-2">
            <span className="text-label-sm text-on-surface font-medium">Difficulty</span>
            <select
              className={fieldClass}
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as (typeof DIFFICULTIES)[number])
              }
            >
              {DIFFICULTIES.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-unit-3">
        <Button type="submit" icon="auto_awesome" disabled={busy || atCap || learners.length === 0}>
          {busy ? "Generating…" : "Generate quiz"}
        </Button>
        {atCap ? (
          <span className="text-label-sm text-error">
            Monthly quiz credits used. They reset at the start of next month.
          </span>
        ) : null}
      </div>
    </form>
  );
}
