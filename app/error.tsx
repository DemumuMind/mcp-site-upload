"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
type ErrorProps = {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
};
export default function Error({ error, reset }: ErrorProps) {
    const locale = useLocale();
    useEffect(() => {
        if (error.message === "NEXT_DEVTOOLS_SIMULATED_ERROR") {
            return;
        }
        console.error(error);
    }, [error]);
    return (<div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <p className="text-sm text-muted-foreground">{tr(locale, "Something went wrong", "Something went wrong")}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {tr(locale, "We couldn't load this page", "We couldn't load this page")}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {tr(locale, "Please try again. If the issue persists, return to the home page.", "Please try again. If the issue persists, return to the home page.")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset} className="bg-blue-500 hover:bg-blue-400">
          {tr(locale, "Try again", "Try again")}
        </Button>
        <Button asChild variant="outline" className="border-blacksmith bg-transparent">
          <Link href="/">{tr(locale, "Back to home", "Back to home")}</Link>
        </Button>
      </div>
    </div>);
}

