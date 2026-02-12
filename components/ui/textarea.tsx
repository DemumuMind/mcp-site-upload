import * as React from "react";
import { cn } from "@/lib/utils";
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (<textarea data-slot="textarea" className={cn("border-cosmic bg-input/75 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-xl border px-3 py-2 text-base shadow-[inset_0_0_0_1px_rgba(94,109,255,0.14)] transition-[color,box-shadow,background-color] outline-none md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:bg-input/90", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}/>);
}
export { Textarea };
