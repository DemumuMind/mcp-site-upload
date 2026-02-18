import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-blacksmith bg-[linear-gradient(180deg,rgba(17,20,25,0.94)_0%,rgba(11,13,18,0.96)_100%)] placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-lg border px-3 py-2 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-[color,box-shadow,background-color,border-color] outline-none md:text-sm",
        "focus-visible:border-ring/90 focus-visible:ring-ring/60 focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

