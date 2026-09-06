/** Runtime token map for components that need values outside Tailwind classes. */
export const tokens = {
  color: {
    primary: "#0d3464",
    onPrimary: "#ffffff",
    primaryContainer: "#2a4b7c",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f3f2ff",
    surfaceContainer: "#ececff",
    surfaceContainerHigh: "#e4e7ff",
    surfaceContainerHighest: "#dee1fb",
    onSurface: "#161a2d",
    onSurfaceVariant: "#43474f",
    outlineVariant: "#c3c6d0",
    growGreen: "#3F8F6E",
    signal: "#C4472A",
    sparkCoral: "#E8674A",
    calmTeal: "#3E6F71",
    trustGold: "#B08B3F",
    ledgerGold: "#B48A3C",
    ledgerTeal: "#0D7A68",
  },
  radius: {
    DEFAULT: "0.125rem",
    lg: "0.25rem",
    xl: "0.5rem",
    full: "0.75rem",
  },
  shadow: {
    card: "0 2px 8px rgba(28, 32, 51, 0.04)",
    cardFloat: "0 8px 20px -6px rgba(28, 32, 51, 0.06)",
  },
} as const;

export type Tokens = typeof tokens;