import { clsx } from "clsx";
import { Icon } from "./Icon";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  className?: string;
}

/** Mobile-first bottom navigation with safe-area padding (learner surface). */
export function BottomNav({ items, activeId, className }: BottomNavProps) {
  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50",
        "pb-safe bg-surface/80 backdrop-blur-xl shadow-nav-float",
        className,
      )}
      aria-label="Primary"
    >
      <div className="h-16 px-unit-2 flex items-center justify-around">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant",
              )}
            >
              <Icon name={item.icon} size={22} filled={active} />
              <span className="text-label-sm">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}