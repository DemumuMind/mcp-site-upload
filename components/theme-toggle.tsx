"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const savedTheme = window.localStorage.getItem("demumumind-theme");
    return savedTheme !== "light";
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("demumumind-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  function toggleTheme() {
    setIsDark((current) => !current);
  }

  const uiIsDark = hydrated ? isDark : true;
  const themeToggleLabel = uiIsDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-11 w-11 rounded-full border-white/15 bg-slate-900/70 text-slate-300 hover:bg-slate-900 hover:text-white sm:h-9 sm:w-9"
      aria-label={themeToggleLabel}
    >
      {uiIsDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">{themeToggleLabel}</span>
    </Button>
  );
}
