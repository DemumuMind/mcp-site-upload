import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary/90 text-primary-foreground shadow-[0_0_0_1px_rgba(103,124,255,0.28),0_0_20px_rgba(89,90,255,0.24)] [a&]:hover:bg-primary",
            secondary: "bg-secondary text-secondary-foreground border-secondary/60 [a&]:hover:bg-secondary/90",
            destructive: "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/25",
            outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
            ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
            link: "text-primary underline-offset-4 [a&]:hover:underline",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Badge({ className, variant = "default", asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot.Root : "span";
    return (<Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props}/>);
}
export { Badge, badgeVariants };
