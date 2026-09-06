"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@whb/ui";

interface Option {
  value: string;
  label: string;
}

export function ChildSwitcher({ options }: { options: Option[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = options.find((o) => o.value === params.get("child")) ?? options[0];

  if (options.length <= 1) return null;

  return (
    <label className="inline-flex items-center gap-unit-2">
      <Icon name="swap_horiz" size={16} className="text-secondary" />
      <select
        aria-label="Switch learner"
        value={current?.value}
        onChange={(e) => router.push(`/learner?child=${e.target.value}`)}
        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-unit-3 py-unit-1 text-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}