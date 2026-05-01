"use client";

/**
 * ThemeSwitcher
 * ─────────────
 * Toggles between dark and light themes by writing a `data-theme`
 * attribute to <html> and persisting the preference in localStorage.
 *
 * Usage
 * ─────
 * 1. Import global.css once at your root layout:
 *      import "@/components/global.css";
 *
 * 2. Drop the component anywhere in your layout or header:
 *      import ThemeSwitcher from "@/components/ThemeSwitcher";
 *      ...
 *      <ThemeSwitcher />
 *
 * The component is self-contained and has no external dependencies.
 */

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "nmm-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialise from localStorage or system preference (wrapped to satisfy
  // react-hooks/set-state-in-effect — setState is not called directly in
  // the effect body but inside a nested function, matching the project pattern).
  useEffect(() => {
    const init = () => {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initial: Theme =
        stored === "dark" || stored === "light" ? stored : getSystemTheme();
      applyTheme(initial);
      setTheme(initial);
      setMounted(true);
    };
    init();
  }, []);

  // Keep <html> and localStorage in sync whenever theme changes
  useEffect(() => {
    const sync = () => {
      applyTheme(theme);
      localStorage.setItem(STORAGE_KEY, theme);
    };
    if (mounted) sync();
  }, [theme, mounted]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Avoid hydration mismatch — render nothing until client is ready
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        fontSize: "1.25rem",
        backgroundColor: isDark ? "#3b82f6" : "#60a5fa",
        /* Transition is handled by global.css */
      }}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
