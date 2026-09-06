import { clsx } from "clsx";

export interface ProgressBarProps {
  value: number; // 0..100
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  tone?: "primary" | "primary-container" | "spark" | "outline";
}

const toneClasses = {
  primary: "bg-primary",
  "primary-container": "bg-primary-container",
  spark: "bg-spark-coral",
  outline: "bg-outline",
} as const;

export function ProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
  tone = "primary-container",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx(
        "w-full h-2 rounded-full overflow-hidden bg-surface-container",
        trackClassName,
        className,
      )}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-500",
          toneClasses[tone],
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}