import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out motion-safe:active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:brightness-105",
        destructive: "border-destructive bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/25",
        outline: "border-border/80 bg-transparent text-foreground hover:bg-accent/10 hover:text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-accent/10 hover:text-foreground",
        link: "border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[var(--cta-height)] px-4 py-2 has-[>svg]:px-3 rounded-none",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 rounded-none [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-none",
        lg: "h-11 px-6 has-[>svg]:px-4 rounded-none",
        icon: "size-10 rounded-none",
        "icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-none",
        "icon-lg": "size-11 rounded-none",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
