import Link from "next/link";
import { Badge, Icon, ProgressBar } from "@whb/ui";
import type { LearnerCardData } from "@/lib/dashboard-data";

function toneFor(mastery: number) {
  if (mastery >= 85) return { badge: "on-track" as const, dot: "#3F8F6E", label: "Excelling" };
  if (mastery >= 40) return { badge: "on-track" as const, dot: "#3F8F6E", label: "On track" };
  return { badge: "signal" as const, dot: "#BA1A1A", label: "Needs focus" };
}

export function ChildCard({ child }: { child: LearnerCardData }) {
  const tone = toneFor(child.overallMastery);
  return (
    <article className="relative flex flex-col bg-surface-container-lowest rounded-xl p-unit-6 shadow-card hover:shadow-card-float transition-all">
      <div className="flex items-start justify-between mb-unit-4 pb-unit-3 bg-surface-container-low/40 -mx-unit-6 -mt-unit-6 p-unit-6 rounded-t-xl">
        <div className="flex items-center gap-unit-3">
          <div className="w-11 h-11 rounded-full bg-primary-container/15 flex items-center justify-center text-primary font-display text-lg">
            {child.initials}
          </div>
          <div>
            <h2 className="font-display text-headline-sm text-on-surface leading-tight">
              {child.fullName}
            </h2>
            <p className="text-label-sm text-secondary">{child.gradeLabel}</p>
          </div>
        </div>
        <Badge tone={tone.badge} dot={tone.dot}>
          {tone.label}
        </Badge>
      </div>

      <div className="flex items-baseline justify-between mb-unit-4">
        <div>
          <span className="text-label-sm text-secondary block">Overall Mastery</span>
          <div className="flex items-baseline gap-unit-2 mt-0.5">
            <span className="font-display text-display-md text-on-surface leading-none">
              {child.overallMastery}%
            </span>
            {child.hasEnrollment ? (
              <span className="text-label-sm text-grow-green font-medium">Practice grows this</span>
            ) : (
              <span className="text-label-sm text-signal font-medium">Not enrolled yet</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-label-sm text-secondary block">Focus Time</span>
          <span className="font-mono text-code-sm text-on-surface font-medium">
            {child.focusMinutes} mins · {child.streakDays}-day streak
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-unit-3 mb-unit-6 pt-unit-2">
        {child.subjects.length ? (
          child.subjects.map((subject) => (
            <div key={subject.name}>
              <div className="flex justify-between items-baseline mb-unit-1">
                <span className="text-label-sm text-on-surface font-medium">{subject.name}</span>
                <span className="font-mono text-code-sm text-on-surface font-semibold">
                  {subject.mastery}%
                  {subject.note ? (
                    <span className="text-label-sm text-secondary font-normal"> ({subject.note})</span>
                  ) : null}
                </span>
              </div>
              <ProgressBar value={subject.mastery} />
            </div>
          ))
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            Subject mastery appears after the first practice rounds.
          </p>
        )}
      </div>

      <div className="mt-auto bg-surface-container-low rounded-lg p-unit-3 flex flex-col gap-unit-2">
        <div className="flex items-center gap-unit-2 text-primary">
          <Icon name={child.hasEnrollment ? "edit_note" : "assignment_add"} size={16} />
          <span className="text-label-sm font-semibold">
            {child.hasEnrollment ? "Next step" : "Start here"}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant italic">{child.remark}</p>
        <div className="pt-unit-2 flex items-center justify-between text-secondary">
          <span className="text-label-sm flex items-center gap-1">
            <Icon name="auto_stories" size={14} />
            {child.curriculumLabel}
          </span>
          <Link
            href={`/learner?child=${child.id}`}
            className="text-label-sm text-primary hover:underline font-semibold inline-flex items-center gap-1"
          >
            Open learner view
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}