import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Map to CSS custom properties
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-hover": "var(--bg-hover)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "accent-start": "var(--accent-start)",
        "accent-end": "var(--accent-end)",
        "accent-text": "var(--accent-text)",
        // Semantic tokens
        red: "var(--red)",
        "red-soft": "var(--red-soft)",
        green: "var(--green)",
        "green-soft": "var(--green-soft)",
        blue: "var(--blue)",
        "blue-soft": "var(--blue-soft)",
        purple: "var(--purple)",
        "purple-soft": "var(--purple-soft)",
        amber: "var(--amber)",
        "amber-soft": "var(--amber-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
      },
    },
  },
  plugins: [],
};

export default config;
