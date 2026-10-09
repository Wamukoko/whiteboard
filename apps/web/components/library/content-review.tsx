"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AI_GENERATED_MARKER } from "@whb/shared";
import { Badge, Button, Icon } from "@whb/ui";
import type { LibraryContent } from "@/lib/library-data";

interface ApiError {
  error?: { message?: string };
}

export function ContentReview({ content }: { content: LibraryContent }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  async function decide(reviewState: "APPROVED" | "REJECTED") {
    setBusy(reviewState);
    setError(null);
    try {
      const response = await fetch(`/api/generation/${content.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewState, notes: notes.trim() || undefined }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        setError(body.error?.message ?? `Request failed (${response.status}).`);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low/40 p-unit-4 flex flex-col gap-unit-3">
      <div className="flex items-center justify-between gap-unit-3 flex-wrap">
        <div className="flex items-center gap-unit-2">
          <Icon name="quiz" size={18} className="text-primary" />
          <span className="text-label-md text-on-surface">
            {content.title ?? "Untitled quiz"}
          </span>
          <Badge tone="primary">{AI_GENERATED_MARKER}</Badge>
          <Badge tone="secondary">{content.questionCount} questions</Badge>
        </div>
        <span className="text-label-sm text-secondary">For {content.learnerName}</span>
      </div>

      <ol className="flex flex-col gap-unit-3">
        {content.questions.map((question, index) => (
          <li key={question.id} className="flex flex-col gap-unit-1">
            <span className="text-body-sm text-on-surface font-medium">
              {index + 1}. {question.prompt}
            </span>
            {question.options ? (
              <span className="text-body-sm text-on-surface-variant">
                {question.options
                  .map((option) =>
                    option === question.correctAnswer ? `✓ ${option}` : option,
                  )
                  .join("  ·  ")}
              </span>
            ) : (
              <span className="text-body-sm text-on-surface-variant">
                Answer: {question.correctAnswer}
              </span>
            )}
            {question.explanation ? (
              <span className="text-label-sm text-secondary italic">{question.explanation}</span>
            ) : null}
          </li>
        ))}
      </ol>

      {error ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-3 py-unit-2 text-label-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <label className="flex flex-col gap-unit-2">
        <span className="text-label-sm text-secondary">Notes (optional)</span>
        <input
          type="text"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. tighten question 3 wording"
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-3 py-unit-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
        />
      </label>

      <div className="flex items-center gap-unit-3">
        <Button
          icon="check"
          iconFill
          disabled={busy !== null}
          onClick={() => decide("APPROVED")}
        >
          {busy === "APPROVED" ? "Approving…" : "Approve for learner"}
        </Button>
        <Button
          variant="outline"
          icon="close"
          disabled={busy !== null}
          onClick={() => decide("REJECTED")}
        >
          {busy === "REJECTED" ? "Rejecting…" : "Reject"}
        </Button>
      </div>
    </div>
  );
}

const STATE_TONE: Record<string, "neutral" | "signal" | "secondary" | "on-track"> = {
  QUEUED: "neutral",
  PROCESSING: "neutral",
  READY: "on-track",
  FAILED: "signal",
};

export function GenerationStatusCard({ content }: { content: LibraryContent }) {
  const tone = STATE_TONE[content.generationState] ?? "neutral";
  const label =
    content.generationState === "READY"
      ? content.reviewState.replace("_", " ").toLowerCase()
      : content.generationState.toLowerCase();
  const icon =
    content.generationState === "READY"
      ? content.reviewState === "APPROVED"
        ? "task_alt"
        : "cancel"
      : content.generationState === "FAILED"
        ? "error"
        : "hourglass_top";

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low/30 p-unit-4 flex items-center gap-unit-3">
      <Icon name={icon} size={18} className="text-secondary" />
      <span className="text-body-sm text-on-surface">
        {content.failureReason ?? "Drafting quiz questions from this worksheet…"}
      </span>
      <Badge tone={tone} className="ml-auto capitalize">
        {label}
      </Badge>
    </div>
  );
}
