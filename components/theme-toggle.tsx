"use client";

import { useEffect, useLayoutEffect } from "react";

type Theme = "light" | "dark";

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function saved(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  // React's dev-mode remount resets <html> attributes; put the theme back before paint.
  useLayoutEffect(() => {
    apply(saved() ?? systemTheme());
  }, []);

  // Without a saved choice, keep following the OS setting.
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!saved()) apply(systemTheme());
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = current() === "dark" ? "light" : "dark";
    const commit = () => {
      apply(next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage can be unavailable (private mode); the switch still works for this visit.
      }
    };

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) {
      commit();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement.style;
    root.setProperty("--vt-x", `${x}px`);
    root.setProperty("--vt-y", `${y}px`);
    root.setProperty("--vt-r", `${r}px`);
    document.startViewTransition(commit);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      title="Switch theme"
      className="group relative grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-fg"
    >
      <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* The filled half flips with the theme: board side vs. datasheet side. */}
        <path
          d="M10 2.75a7.25 7.25 0 0 1 0 14.5z"
          fill="currentColor"
          className="origin-center transition-transform duration-500 ease-(--ease-out) [[data-theme=light]_&]:rotate-180"
        />
      </svg>
    </button>
  );
}
