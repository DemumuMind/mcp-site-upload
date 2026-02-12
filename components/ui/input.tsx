import * as React from "react";
import { cn } from "@/lib/utils";
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (<input type={type} data-slot="input" className={cn("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-cosmic bg-input/75 h-10 w-full min-w-0 rounded-xl border px-3 py-2 text-base shadow-[inset_0_0_0_1px_rgba(94,109,255,0.14)] transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:bg-input/90", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className)} {...props}/>);
}
export { Input };
