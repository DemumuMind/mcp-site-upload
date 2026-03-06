import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 border px-2.5 py-1 text-[11px] font-medium tracking-[0.16em] uppercase whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors rounded-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary [a&]:hover:bg-primary/15",
        secondary: "border-border/70 bg-muted/30 text-foreground [a&]:hover:bg-muted/45",
        destructive: "border-destructive/35 bg-destructive/12 text-white [a&]:hover:bg-destructive/18 focus-visible:ring-destructive/25",
        outline: "border-border/70 bg-transparent text-foreground [a&]:hover:bg-accent/8",
        ghost: "border-transparent bg-transparent text-muted-foreground [a&]:hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant = "default", asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";
  return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
