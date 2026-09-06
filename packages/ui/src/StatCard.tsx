import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Icon } from "./Icon";
import type { WithChildren } from "./Icon";

interface StatCardProps extends WithChildren {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
  footer?: ReactNode;
}

/** Precision-layered tonal metric card (institution/parent dashboards). */
export function StatCard({
  label,
  value,
  icon,
  accent = "bg-surface-container-low text-primary",
  footer,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        "bg-surface-container-lowest p-unit-6 rounded-xl shadow-card flex flex-col justify-between",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
          <span className="font-display text-headline-lg text-on-surface mt-unit-1 leading-none">
            {value}
          </span>
        </div>
        <div
          className={clsx(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            accent,
          )}
        >
          <Icon name={icon} size={20} />
        </div>
      </div>
      {footer ? (
        <div className="mt-unit-4 pt-unit-3 border-t border-surface-container flex items-center justify-between text-label-sm">
          {footer}
        </div>
      ) : null}
    </div>
  );
}