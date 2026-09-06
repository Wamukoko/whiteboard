import type { Config } from "tailwindcss";

/**
 * WhiteBoard design tokens — transcribed 1:1 from the Design Inspiration
 * suite (LearnerDashboard / Parentdashboard / InstitutionDashboard /
 * Scholarship + variants). Material-3-style surface system, Newsreader
 * display serif, Inter UI sans, JetBrains Mono code faces, and role accents.
 */
const preset: Config = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        // Primary — board blue
        primary: "#0d3464",
        "on-primary": "#ffffff",
        "primary-container": "#2a4b7c",
        "on-primary-container": "#9dbcf4",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#a9c7ff",
        "on-primary-fixed": "#001b3d",
        "on-primary-fixed-variant": "#254778",
        // Secondary
        secondary: "#5c5e68",
        "on-secondary": "#ffffff",
        "secondary-container": "#dedfeb",
        "on-secondary-container": "#60626c",
        "secondary-fixed": "#e1e2ee",
        "on-secondary-fixed": "#191b24",
        "on-secondary-fixed-variant": "#444650",
        // Tertiary — signal
        tertiary: "#691200",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#8f2106",
        "on-tertiary-container": "#ffa38d",
        "tertiary-fixed": "#ffdad2",
        "tertiary-fixed-dim": "#ffb4a3",
        "on-tertiary-fixed": "#3d0600",
        "on-tertiary-fixed-variant": "#891d03",
        // Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        // Neutral surfaces
        background: "#fbf8ff",
        surface: "#fbf8ff",
        "surface-dim": "#d6d8f2",
        "surface-bright": "#fbf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f2ff",
        "surface-container": "#ececff",
        "surface-container-high": "#e4e7ff",
        "surface-container-highest": "#dee1fb",
        "on-surface": "#161a2d",
        "on-surface-variant": "#43474f",
        outline: "#747780",
        "outline-variant": "#c3c6d0",
        "inverse-surface": "#2b2f43",
        "inverse-on-surface": "#f0efff",
        "inverse-primary": "#a9c7ff",
        "surface-tint": "#3f5f91",
        // Role accents
        "grow-green": "#3F8F6E",
        signal: "#C4472A",
        "spark-coral": "#E8674A",
        "calm-teal": "#3E6F71",
        "trust-gold": "#B08B3F",
        "ledger-gold": "#B48A3C",
        "ledger-teal": "#0D7A68",
        "ledger-bg": "#F9F8F5",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-newsreader)",
          "Newsreader",
          "Georgia",
          "serif",
        ],
        mono: [
          "var(--font-jetbrains)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      fontSize: {
        "display-md-mobile": [
          "2.5rem",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "headline-lg": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "headline-sm": ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "title-lg": ["1.125rem", { lineHeight: "1.4" }],
        "body-md": ["0.875rem", { lineHeight: "1.5" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.45" }],
        "label-md": ["0.8125rem", { lineHeight: "1.25", letterSpacing: "0.01em" }],
        "label-sm": ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.02em" }],
        "code-sm": ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        "unit-1": "0.25rem",
        "unit-2": "0.5rem",
        "unit-3": "0.75rem",
        "unit-4": "1rem",
        "unit-6": "1.5rem",
        "unit-8": "2rem",
        "unit-12": "3rem",
        "unit-24": "6rem",
        "gutter-desktop": "1.5rem",
        "margin-mobile": "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "0.75rem",
      },
      boxShadow: {
        card: "0 2px 8px rgba(28, 32, 51, 0.04)",
        "card-float": "0 8px 20px -6px rgba(28, 32, 51, 0.06)",
        "nav-float": "0 -1px 8px rgba(0, 0, 0, 0.04)",
        btn: "0 1px 2px rgba(16, 25, 40, 0.12)",
      },
      maxWidth: {
        shell: "1280px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.35s ease-out both",
      },
    },
  },
};

export default preset;