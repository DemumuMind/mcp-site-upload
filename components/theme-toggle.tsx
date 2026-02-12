"use client";
import { useEffect } from "react";
import { MoonStar } from "lucide-react";
export function ThemeToggle() {
    useEffect(() => {
        document.documentElement.classList.add("dark");
        window.localStorage.setItem("demumumind-theme", "dark");
    }, []);
    return (<span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-indigo-900/70 text-violet-100 shadow-[0_0_0_1px_rgba(124,142,255,0.22),0_0_24px_rgba(83,92,255,0.2)] sm:h-9 sm:w-9" aria-label="Dark cosmic theme enabled" title="Dark cosmic theme">
      <MoonStar className="size-4"/>
      <span className="sr-only">Dark cosmic theme enabled</span>
    </span>);
}
