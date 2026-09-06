import type { ReactNode } from "react";
import { clsx } from "clsx";

type BadgeTone =
  | "neutral"
  | "on-track"
  | "signal"
  | "primary"
  | "tertiary"
  | "secondary";

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-surface-container text-on-surface",
  "on-track":
    "bg-surface-container text-on-surface",
  signal: "bg-error-container/60 text-on-error-container",
  primary: "bg-primary-fixed/60 text-on-primary-fixed-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  secondary: "bg-secondary-container text-on-secondary-container",
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: string; // css color for the status dot
  className?: string;
}

export function Badge({ children, tone = "neutral", dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-unit-2 py-0.5 text-label-sm",
        toneClasses[tone],
        className,
      )}
    >
      {dot ? (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
      ) : null}
      {children}
    </span>
  );
}