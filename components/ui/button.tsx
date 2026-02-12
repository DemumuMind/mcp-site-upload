import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring/70 focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(101,120,255,0.35),0_0_28px_rgba(89,90,255,0.4)] hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(133,146,255,0.42),0_0_36px_rgba(111,95,255,0.48)]",
            destructive: "bg-destructive text-white shadow-[0_0_0_1px_rgba(255,98,128,0.42),0_0_26px_rgba(255,93,122,0.32)] hover:brightness-110 focus-visible:ring-destructive/25",
            outline: "border-border bg-card/80 text-foreground backdrop-blur-md hover:bg-accent/70 hover:text-accent-foreground",
            secondary: "border-secondary/70 bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "text-cosmic-muted hover:bg-accent/40 hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:text-cosmic-lilac hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2 has-[>svg]:px-3",
            xs: "h-6 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
            icon: "size-10",
            "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
            "icon-sm": "size-8",
            "icon-lg": "size-11",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot.Root : "button";
    return (<Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props}/>);
}
export { Button, buttonVariants };
