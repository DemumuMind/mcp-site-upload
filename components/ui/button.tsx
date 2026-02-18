import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-transparent text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none before:pointer-events-none before:absolute before:inset-y-[1px] before:left-[1px] before:w-px before:bg-white/15 after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-white/12 focus-visible:border-ring/80 focus-visible:ring-ring/60 focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(130deg,hsl(var(--primary))_0%,#8db7ff_48%,#4b6a9b_100%)] text-primary-foreground shadow-[0_14px_32px_-20px_rgba(44,118,255,0.8)] hover:-translate-y-0.5 hover:brightness-105",
        destructive:
          "bg-destructive text-white shadow-[0_0_0_1px_rgba(255,98,128,0.42),0_0_26px_rgba(255,93,122,0.32)] hover:brightness-110 focus-visible:ring-destructive/25",
        outline: "border-blacksmith bg-[linear-gradient(180deg,rgba(30,35,43,0.82)_0%,rgba(16,18,23,0.9)_100%)] text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "border-blacksmith bg-[linear-gradient(180deg,rgba(56,62,73,0.75)_0%,rgba(33,37,45,0.82)_100%)] text-secondary-foreground hover:brightness-110",
        ghost: "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:text-[#ffe082] hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };

