import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { Icon } from "./Icon";

type ButtonVariant =
  | "primary"
  | "primary-container"
  | "secondary"
  | "ghost"
  | "outline"
  | "tonal";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconFill?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container shadow-btn transition-colors active:scale-[0.99]",
  "primary-container":
    "bg-primary-container text-on-primary hover:bg-primary shadow-btn transition-colors active:scale-[0.99]",
  secondary:
    "bg-surface-container text-primary hover:bg-surface-container-high transition-colors active:scale-[0.99]",
  tonal: "bg-secondary-container text-on-secondary-container hover:bg-surface-variant transition-colors",
  ghost: "text-primary hover:bg-surface-container transition-colors",
  outline:
    "border border-outline-variant text-primary bg-surface-container-lowest hover:border-outline transition-colors",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-unit-3 py-unit-1 text-label-sm",
  md: "px-unit-4 py-unit-2 text-label-md",
  lg: "px-unit-6 py-unit-3 text-label-md",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconFill,
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-unit-2 rounded font-medium transition-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={18} filled={iconFill} /> : null}
      {children}
    </button>
  );
}