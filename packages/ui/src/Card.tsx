import type { HTMLAttributes } from "react";
import { clsx } from "clsx";
import type { WithChildren } from "./Icon";

interface CardProps extends HTMLAttributes<HTMLDivElement>, WithChildren {
  padded?: boolean;
  hover?: boolean;
}

export function Card({
  padded = true,
  hover,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl bg-surface-container-lowest shadow-card",
        padded && "p-unit-6",
        hover && "transition-shadow hover:shadow-card-float",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}