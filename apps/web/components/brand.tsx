import Link from "next/link";
import { Icon } from "@whb/ui";
import { clsx } from "clsx";

export function Brand({
  size = "md",
  href = "/",
}: {
  size?: "md" | "lg";
  href?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center gap-unit-3 group" aria-label="WhiteBoard home">
      <span
        className={clsx(
          "rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-btn transition-transform group-hover:scale-[1.02]",
          size === "md" ? "w-10 h-10" : "w-12 h-12",
        )}
      >
        <Icon name="stylus_note" size={size === "md" ? 22 : 26} filled />
      </span>
      <span className="flex flex-col">
        <span
          className={clsx(
            "font-display text-on-surface leading-none",
            size === "md" ? "text-headline-sm" : "text-headline-lg",
          )}
        >
          WhiteBoard
        </span>
        <span className="text-label-sm text-on-surface-variant mt-0.5 hidden sm:block">
          Ask. Learn. Become.
        </span>
      </span>
    </Link>
  );
}