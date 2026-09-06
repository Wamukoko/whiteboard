import { clsx } from "clsx";
import { Icon } from "./Icon";
import type { NavItem } from "./BottomNav";

export interface SidebarProps {
  brand: string;
  tagline: string;
  sections: { key: string; label: string; items: NavItem[] }[];
  activeId: string;
  className?: string;
}

/** Desktop sidebar navigation (parent / institution surfaces). */
export function Sidebar({
  brand,
  tagline,
  sections,
  activeId,
  className,
}: SidebarProps) {
  return (
    <aside
      className={clsx(
        "hidden lg:flex w-72 shrink-0 flex-col bg-surface-container-lowest border-r border-outline-variant/40",
        className,
      )}
    >
      <div className="px-unit-8 pt-unit-8 pb-unit-6">
        <div className="flex items-center gap-unit-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-btn">
            <Icon name="stylus_note" size={22} filled />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-headline-sm text-on-surface leading-none">
              {brand}
            </span>
            <span className="text-label-sm text-on-surface-variant mt-0.5">
              {tagline}
            </span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-unit-4 pb-unit-6 space-y-unit-6" aria-label="Sidebar">
        {sections.map((section) => (
          <div key={section.key}>
            <h3 className="text-label-sm text-on-surface-variant/70 px-unit-2 mb-unit-2 uppercase tracking-wider">
              {section.label}
            </h3>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex items-center gap-unit-3 rounded px-unit-3 py-unit-2 text-label-md transition-colors min-h-[44px]",
                        active
                          ? "bg-primary-fixed/40 text-primary font-medium"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                      )}
                    >
                      <Icon name={item.icon} size={20} filled={active} />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="px-unit-8 pb-unit-8 text-label-sm text-on-surface-variant/60">
        Ask. Learn. Become.
      </div>
    </aside>
  );
}