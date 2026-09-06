import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Icon } from "./Icon";

export interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={clsx(
        "flex flex-col md:flex-row md:items-end justify-between gap-unit-6 pb-unit-8 pt-unit-4",
        className,
      )}
    >
      <div className="flex flex-col max-w-2xl">
        {eyebrow ? (
          <div className="flex items-center gap-unit-2 text-label-sm mb-unit-2">
            {eyebrowIcon ? (
              <Icon name={eyebrowIcon} size={16} className="text-secondary" />
            ) : null}
            <span className="text-secondary">{eyebrow}</span>
          </div>
        ) : null}
        <h1 className="font-display text-headline-lg text-on-surface tracking-tight leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-body-md text-on-surface-variant mt-unit-2">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-unit-3 flex-wrap self-start md:self-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}