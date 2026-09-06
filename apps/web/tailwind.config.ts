import type { Config } from "tailwindcss";
import whbPreset from "@whb/ui/tailwind-preset";

const config: Config = {
  presets: [whbPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;