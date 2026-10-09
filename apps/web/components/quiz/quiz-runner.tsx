"use client";

import Link from "next/link";
import { useState } from "react";
import { AI_GENERATED_MARKER } from "@whb/shared";
import { Badge, Button, Icon, ProgressBar } from "@whb/ui";

interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[] | null;
}

interface ApiError {
  error?: { message?: string };
}

export function QuizRunner({
  assessmentId,
  title,
  questions,
}: {
  assessmentId: string;
  title: string;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  const answered = Object.values(answers).filter((value) => value.trim() !== "").length;

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, answers }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        setError(body.error?.message ?? `Request failed (${response.status}).`);
        return;
      }
      const body = (await response.json()) as {
        data: { attempt: { score: number; maxScore: number } };
      };
      setResult(body.data.attempt);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    const strong = percent >= 70;
    return (
      <div className="flex flex-col gap-unit-6">
        <div className="bg-surface-container-lowest rounded-xl p-unit-8 shadow-card text-center flex flex-col items-center gap-unit-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              strong ? "bg-tertiary-fixed text-tertiary-container" : "bg-secondary-container text-primary"
            }`}
          >
            <Icon name={strong ? "emoji_events" : "school"} size={30} filled />
          </div>
          <div className="flex flex-col gap-unit-1">
            <h2 className="font-display text-headline-sm text-on-surface">
              {strong ? "Nice work!" : "Good effort!"}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              You scored {result.score} out of {result.maxScore}.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar value={percent} tone={strong ? "spark" : "primary"} />
          </div>
          <Button icon="arrow_back" variant="secondary">
            <Link href="/learner">Back to your board</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-unit-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-unit-2">
            <h1 className="font-display text-headline-sm text-primary">{title}</h1>
            <Badge tone="primary">{AI_GENERATED_MARKER}</Badge>
          </div>
          <p className="text-label-sm text-secondary">
            {answered} of {questions.length} answered
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-error-container px-unit-4 py-unit-3 text-label-sm text-on-error-container">
          {error}
        </p>
      ) : null}

      <ol className="flex flex-col gap-unit-4">
        {questions.map((question, index) => (
          <li
            key={question.id}
            className="bg-surface-container-lowest rounded-xl p-unit-4 shadow-card flex flex-col gap-unit-3"
          >
            <span className="text-body-md text-on-surface font-medium">
              {index + 1}. {question.prompt}
            </span>
            {question.options ? (
              <div className="flex flex-col gap-unit-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer(question.id, option)}
                      className={`text-left rounded-lg border px-unit-4 py-unit-3 text-body-md transition-colors ${
                        selected
                          ? "border-primary bg-secondary-container text-on-secondary-container"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-outline"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                value={answers[question.id] ?? ""}
                onChange={(event) => setAnswer(question.id, event.target.value)}
                placeholder="Type your answer"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-4 py-unit-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
              />
            )}
          </li>
        ))}
      </ol>

      <Button size="lg" fullWidth icon="send" disabled={busy} onClick={submit}>
        {busy ? "Submitting…" : "Submit answers"}
      </Button>
    </div>
  );
}
