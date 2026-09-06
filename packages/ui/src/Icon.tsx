import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";

const FILL_WEIGHT = {
  "font-variation-settings": '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
} as CSSProperties;

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}

/** Material Symbols Outlined icon wrapper (loaded via <link> in root layout). */
export function Icon({
  name,
  className,
  filled,
  size = 20,
  style,
  ...rest
}: IconProps) {
  return (
    <span
      aria-hidden={rest["aria-hidden"] ?? true}
      className={clsx("material-symbols-outlined select-none", className)}
      style={{
        fontSize: size,
        lineHeight: 1,
        ...(filled ? FILL_WEIGHT : undefined),
        ...style,
      }}
    >
      {name}
    </span>
  );
}

export interface WithChildren {
  children?: ReactNode;
  className?: string;
}